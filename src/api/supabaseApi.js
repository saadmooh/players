import { supabase, sha256 } from '../lib/supabase'

function generateToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function toGASField(db) {
  return {
    FieldID: db.id,
    FieldName: db.field_name,
    FieldLabel: db.field_label,
    FieldType: db.field_type,
    IsRequired: db.is_required ? 'TRUE' : 'FALSE',
    IsActive: db.is_active ? 'TRUE' : 'FALSE',
    DropdownOptions: db.dropdown_options || '',
  }
}

function toDBField(f) {
  return {
    field_name: f.FieldName,
    field_label: f.FieldLabel,
    field_type: f.FieldType,
    is_required: f.IsRequired === 'TRUE',
    is_active: f.IsActive === 'TRUE',
    dropdown_options: f.DropdownOptions || null,
  }
}

function toGASPlayer(db) {
  return {
    SubmissionID: db.submission_id,
    ...(db.data || {}),
    SubmittedAt: db.created_at,
  }
}

// ─── Public API ───────────────────────────────────────────

export const userAPI = {
  async getFields() {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw new Error(error.message)
    return data.map(toGASField)
  },

  async submitPlayer(playerData) {
    const id = 'PLAYER-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
    const { error } = await supabase
      .from('players')
      .insert({ submission_id: id, data: playerData })
    if (error) throw new Error(error.message)
    return { id }
  },

  async submitBulkPlayers(players) {
    const rows = players.map(p => ({
      submission_id: 'PLAYER-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      data: p,
    }))
    const { error } = await supabase.from('players').insert(rows)
    if (error) throw new Error(error.message)
    return { saved: rows.length }
  },
}

// ─── Auth API ─────────────────────────────────────────────

export const authAPI = {
  async login(username, password) {
    const hash = await sha256(password)
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, username')
      .eq('username', username)
      .eq('password_hash', hash)
      .single()
    if (error || !admin) throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة')

    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({ admin_id: admin.id, token, expires_at: expiresAt })
    if (sessionError) throw new Error(sessionError.message)

    return { token, admin: { id: admin.id, username: admin.username } }
  },

  async logout(token) {
    await supabase.from('sessions').delete().eq('token', token)
    return true
  },
}

// ─── Admin API (requires token) ──────────────────────────

async function validateToken(token) {
  const { data, error } = await supabase
    .from('sessions')
    .select('admin_id')
    .eq('token', token)
    .gte('expires_at', new Date().toISOString())
    .single()
  if (error || !data) throw new Error('الجلسة غير صالحة أو منتهية')
  return data.admin_id
}

export const playersAPI = {
  async getAll(token, page = 1, search = '', filters = {}, searchFields = [], limit = 20) {
    await validateToken(token)
    let query = supabase.from('players').select('*', { count: 'exact' })
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.eq(`data->>${key}`, value)
      }
    })
    if (search && searchFields.length > 0) {
      const conditions = searchFields.map(f => `data->>${f}.ilike.%${search}%`)
      query = query.or(conditions.join(','))
    }
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)
    if (error) throw new Error(error.message)
    return {
      players: (data || []).map(toGASPlayer),
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    }
  },

  async delete(token, submissionID) {
    await validateToken(token)
    const { error } = await supabase.from('players').delete().eq('submission_id', submissionID)
    if (error) throw new Error(error.message)
    return true
  },

  async exportExcel(token) {
    await validateToken(token)
    const { data, error } = await supabase.from('players').select('*').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data || []).map(toGASPlayer)
  },

  async update(token, submissionID, playerData) {
    await validateToken(token)
    const { error } = await supabase
      .from('players')
      .update({ data: playerData })
      .eq('submission_id', submissionID)
    if (error) throw new Error(error.message)
    return true
  },
}

export const configAPI = {
  async getFields(token) {
    await validateToken(token)
    const { data, error } = await supabase.from('fields').select('*').order('sort_order')
    if (error) throw new Error(error.message)
    return (data || []).map(toGASField)
  },

  async saveField(token, field) {
    await validateToken(token)
    const dbField = toDBField(field)
    if (field.FieldID) {
      const { error } = await supabase.from('fields').update(dbField).eq('id', field.FieldID)
      if (error) throw new Error(error.message)
    } else {
      const { data: max } = await supabase.from('fields').select('sort_order').order('sort_order', { ascending: false }).limit(1)
      dbField.sort_order = (max?.[0]?.sort_order ?? -1) + 1
      const { error } = await supabase.from('fields').insert(dbField)
      if (error) throw new Error(error.message)
    }
    return true
  },

  async deleteField(token, fieldID) {
    await validateToken(token)
    const { error } = await supabase.from('fields').update({ is_active: false }).eq('id', fieldID)
    if (error) throw new Error(error.message)
    return true
  },

  async reorderFields(token, orderedIDs) {
    await validateToken(token)
    const updates = orderedIDs.map((id, idx) => ({ id, sort_order: idx }))
    for (const u of updates) {
      await supabase.from('fields').update({ sort_order: u.sort_order }).eq('id', u.id)
    }
    return true
  },
}

export const statsAPI = {
  async get(token) {
    await validateToken(token)
    const { count: totalPlayers } = await supabase.from('players').select('*', { count: 'exact', head: true })
    const { count: fieldsCount } = await supabase.from('fields').select('*', { count: 'exact', head: true }).eq('is_active', true)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count: todaySubmissions } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())
    const { data: last } = await supabase.from('players').select('created_at').order('created_at', { ascending: false }).limit(1)
    return {
      totalPlayers: totalPlayers || 0,
      fieldsCount: fieldsCount || 0,
      todaySubmissions: todaySubmissions || 0,
      lastSubmission: last?.[0]?.created_at
        ? new Date(last[0].created_at).toLocaleDateString('ar')
        : '—',
    }
  },

  async seedMockData(token) {
    await validateToken(token)
    await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const { data: activeFields } = await supabase.from('fields').select('*').eq('is_active', true).order('sort_order')
    if (!activeFields?.length) throw new Error('لا يوجد حقول نشطة')

    const firstNames = ['أحمد', 'محمد', 'علي', 'خالد', 'عمر', 'حسن', 'محمود', 'سامي', 'نادر', 'بسام']
    const lastNames = ['السيد', 'عبدالله', 'الغامدي', 'الشمراني', 'القحطاني', 'العتيبي', 'الزهراني', 'الشهري', 'الجهني', 'المطيري']
    const positions = ['مهاجم', 'مدافع', 'وسط', 'حارس']
    const notes = ['لاعب ممتاز', 'محتاج تدريب', 'جديد', 'خبرة', '', '']

    const players = Array.from({ length: 50 }, (_, i) => {
      const data = {}
      const fieldConfig = {}
      activeFields.forEach(f => { fieldConfig[f.field_name] = f })
      if (fieldConfig.playerName) data.playerName = firstNames[i % 10] + ' ' + lastNames[i % 10]
      if (fieldConfig.phoneNumber) data.phoneNumber = '05' + String(500000000 + Math.floor(Math.random() * 99999999))
      if (fieldConfig.age) data.age = String(18 + Math.floor(Math.random() * 30))
      if (fieldConfig.position) data.position = positions[Math.floor(Math.random() * positions.length)]
      if (fieldConfig.email) data.email = 'player' + i + '@example.com'
      if (fieldConfig.notes) data.notes = notes[Math.floor(Math.random() * notes.length)]
      return {
        submission_id: 'PLAYER-SEED-' + String(i + 1).padStart(3, '0'),
        data,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    })

    const { error } = await supabase.from('players').insert(players)
    if (error) throw new Error(error.message)

    return { players: 50, fields: activeFields.length }
  },
}
