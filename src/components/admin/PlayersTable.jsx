import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { usePlayers, useDeletePlayer, useBulkDeletePlayers, useUpdatePlayer } from '../../hooks/usePlayers'
import { useActiveFields } from '../../hooks/useFields'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../shared/LoadingSpinner'
import ConfirmDialog from '../shared/ConfirmDialog'
import PlayerEditModal from './PlayerEditModal'

function downloadCSV(rows, filename) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const val = r[h] ?? ''
      return /[,"\n]/.test(val) ? '"' + val.replace(/"/g, '""') + '"' : val
    }).join(',')),
  ].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function PlayersTable() {
  const { admin } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [deleteID, setDeleteID] = useState(null)
  const [editPlayer, setEditPlayer] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [filterOptions, setFilterOptions] = useState({})
  const [selected, setSelected] = useState(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  const { data: fields = [] } = useActiveFields()
  const searchFields = [...fields.map(f => f.FieldName), '_submitted_by', '_team_name']

  const { data, isLoading } = usePlayers(admin?.token, page, search, filters, searchFields)
  const deleteMutation = useDeletePlayer(admin?.token)
  const bulkDeleteMutation = useBulkDeletePlayers(admin?.token)
  const updateMutation = useUpdatePlayer(admin?.token)

  const players = data?.players ?? []
  const allSelected = players.length > 0 && players.every(p => selected.has(p.SubmissionID))

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(players.map(p => p.SubmissionID)))
    }
  }

  function handleBulkDelete() {
    bulkDeleteMutation.mutate([...selected], {
      onSettled: () => { setSelected(new Set()); setBulkDeleteConfirm(false) },
    })
  }

  useEffect(() => {
    if (!fields.length) return
    const selectFields = fields.filter(f => f.FieldType === 'select')
    selectFields.forEach(async (f) => {
      const { data: vals } = await supabase.rpc('get_distinct_field_values', { field_name: f.FieldName })
      if (vals?.length) {
        setFilterOptions(prev => ({ ...prev, [f.FieldName]: vals.map(v => v.value).filter(Boolean) }))
      }
    })
    supabase.rpc('get_distinct_field_values', { field_name: '_submitted_by' }).then(({ data: vals }) => {
      if (vals?.length) {
        setFilterOptions(prev => ({ ...prev, _submitted_by: vals.map(v => v.value).filter(Boolean) }))
      }
    })
    supabase.rpc('get_distinct_field_values', { field_name: '_team_name' }).then(({ data: vals }) => {
      if (vals?.length) {
        setFilterOptions(prev => ({ ...prev, _team_name: vals.map(v => v.value).filter(Boolean) }))
      }
    })
  }, [fields])

  function handleDelete() {
    if (deleteID) {
      deleteMutation.mutate(deleteID, {
        onSettled: () => setDeleteID(null),
      })
    }
  }

  async function handleEditSave(formData) {
    await updateMutation.mutateAsync({
      submissionID: editPlayer.SubmissionID,
      data: formData,
    })
    setEditPlayer(null)
  }

  function handleFilterChange(fieldName, value) {
    setFilters(prev => {
      const next = { ...prev }
      if (value) next[fieldName] = value
      else delete next[fieldName]
      return next
    })
    setPage(1)
  }

  function clearFilters() {
    setFilters({})
    setSearch('')
    setPage(1)
  }

  const hasActiveFilters = Object.keys(filters).length > 0 || search

  const handleExportCSV = useCallback(async () => {
    setExporting(true)
    try {
      const { data: allData } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false })
      const rows = allData.map(db => {
        const row = { 'المسجل': db.data?._submitted_by || '', 'الفريق': db.data?._team_name || '', 'تاريخ التسجيل': new Date(db.created_at).toLocaleDateString('ar') }
        fields.forEach(f => {
          row[f.FieldLabel] = db.data?.[f.FieldName] || ''
        })
        return row
      })
      downloadCSV(rows, 'players.csv')
    } catch (err) {
      alert(err.message)
    } finally {
      setExporting(false)
    }
  }, [fields])

  if (isLoading) return <LoadingSpinner />

  const total = data?.total ?? 0
  const pages = data?.pages ?? 0
  const filterableFields = fields.filter(f => f.FieldType === 'select')

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">اللاعبين <span className="text-primary text-lg">({total})</span></h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-60 hover:shadow-lg hover:shadow-green-600/25 active:scale-[0.97]"
          >
            {exporting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري التصدير...
              </span>
            ) : '📥 تنزيل CSV'}
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl px-5 py-3.5 mb-5 flex items-center justify-between animate-fadeIn">
          <span className="text-sm font-semibold text-gray-700">تم اختيار <strong className="text-primary">{selected.size}</strong> لاعب</span>
          <button
            onClick={() => setBulkDeleteConfirm(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.97]"
          >
            حذف المحدد
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">بحث عام</label>
            <input
              type="text"
              placeholder="بحث في جميع الحقول..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50/50 transition-all duration-300"
            />
          </div>
          {filterableFields.map(f => {
            const options = filterOptions[f.FieldName] || []
            return (
              <div key={f.FieldID} className="min-w-[150px]">
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">{f.FieldLabel}</label>
                <select
                  value={filters[f.FieldName] || ''}
                  onChange={(e) => handleFilterChange(f.FieldName, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                >
                  <option value="">الكل</option>
                  {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )
          })}
          {(filterOptions._submitted_by?.length > 0) && (
            <div className="min-w-[150px]">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">المسجل</label>
              <select
                value={filters._submitted_by || ''}
                onChange={(e) => handleFilterChange('_submitted_by', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
              >
                <option value="">الكل</option>
                {filterOptions._submitted_by.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}
          {(filterOptions._team_name?.length > 0) && (
            <div className="min-w-[150px]">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">الفريق</label>
              <select
                value={filters._team_name || ''}
                onChange={(e) => handleFilterChange('_team_name', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
              >
                <option value="">الكل</option>
                {filterOptions._team_name.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              ✕ إلغاء الفلترة
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-l from-gray-50 to-gray-100/50 text-gray-600 text-xs uppercase tracking-wider">
                <th className="px-4 py-4 text-right w-8">
                  <input type="checkbox" checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary/30" />
                </th>
                {fields.map(f => (
                  <th key={f.FieldID} className="px-4 py-4 text-right whitespace-nowrap font-semibold">{f.FieldLabel}</th>
                ))}
                <th className="px-4 py-4 text-right whitespace-nowrap font-semibold">المسجل</th>
                <th className="px-4 py-4 text-right whitespace-nowrap font-semibold">الفريق</th>
                <th className="px-4 py-4 text-right whitespace-nowrap font-semibold">تاريخ التسجيل</th>
                <th className="px-4 py-4 text-right whitespace-nowrap font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, idx) => (
                <tr key={p.SubmissionID} className={`transition-colors duration-200 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                } hover:bg-primary/5 ${
                  selected.has(p.SubmissionID) ? 'bg-primary/5 ring-1 ring-primary/20' : ''
                }`}>
                  <td className="px-4 py-3.5">
                    <input type="checkbox" checked={selected.has(p.SubmissionID)}
                      onChange={() => toggleSelect(p.SubmissionID)}
                      className="rounded border-gray-300 text-primary focus:ring-primary/30" />
                  </td>
                  {fields.map(f => (
                    <td key={f.FieldID} className="px-4 py-3.5 max-w-[200px] truncate text-gray-700">{p[f.FieldName] || '—'}</td>
                  ))}
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{p._submitted_by || '—'}</td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{p._team_name || '—'}</td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                    {p.SubmittedAt ? new Date(p.SubmittedAt).toLocaleDateString('ar') : '—'}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditPlayer(p)}
                        className="text-blue-600 hover:text-blue-700 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all duration-200"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => setDeleteID(p.SubmissionID)}
                        className="text-red-500 hover:text-red-600 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all duration-200"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 5} className="px-4 py-12 text-center text-gray-400">
                    <div className="text-4xl mb-2">📋</div>
                    لا يوجد لاعبين
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-300 ${
                p === page
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {deleteID && (
        <ConfirmDialog
          message="هل أنت متأكد من حذف هذا اللاعب؟"
          onConfirm={handleDelete}
          onCancel={() => setDeleteID(null)}
        />
      )}

      {bulkDeleteConfirm && (
        <ConfirmDialog
          message={`هل أنت متأكد من حذف ${selected.size} لاعب؟`}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
        />
      )}

      {editPlayer && (
        <PlayerEditModal
          player={editPlayer}
          fields={fields}
          onSave={handleEditSave}
          onClose={() => setEditPlayer(null)}
        />
      )}
    </div>
  )
}
