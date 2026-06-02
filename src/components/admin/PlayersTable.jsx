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
  const searchFields = fields.map(f => f.FieldName)

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
        const row = { 'تاريخ التسجيل': new Date(db.created_at).toLocaleDateString('ar') }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800">اللاعبين ({total})</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {exporting ? 'جاري التصدير...' : '📥 تنزيل CSV'}
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="bg-primary/10 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">تم اختيار {selected.size} لاعب</span>
          <button
            onClick={() => setBulkDeleteConfirm(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
          >
            حذف المحدد
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">بحث عام</label>
            <input
              type="text"
              placeholder="بحث في جميع الحقول..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {filterableFields.map(f => {
            const options = filterOptions[f.FieldName] || []
            return (
              <div key={f.FieldID} className="min-w-[150px]">
                <label className="block text-xs text-gray-500 mb-1">{f.FieldLabel}</label>
                <select
                  value={filters[f.FieldName] || ''}
                  onChange={(e) => handleFilterChange(f.FieldName, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">الكل</option>
                  {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )
          })}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              ✕ إلغاء الفلترة
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-right w-8">
                  <input type="checkbox" checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary" />
                </th>
                {fields.map(f => (
                  <th key={f.FieldID} className="px-4 py-3 text-right whitespace-nowrap">{f.FieldLabel}</th>
                ))}
                <th className="px-4 py-3 text-right whitespace-nowrap">تاريخ التسجيل</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.SubmissionID} className={`border-t hover:bg-gray-50 ${selected.has(p.SubmissionID) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(p.SubmissionID)}
                      onChange={() => toggleSelect(p.SubmissionID)}
                      className="rounded border-gray-300 text-primary focus:ring-primary" />
                  </td>
                  {fields.map(f => (
                    <td key={f.FieldID} className="px-4 py-3 max-w-[200px] truncate">{p[f.FieldName] || '—'}</td>
                  ))}
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {p.SubmittedAt ? new Date(p.SubmittedAt).toLocaleDateString('ar') : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditPlayer(p)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => setDeleteID(p.SubmissionID)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 3} className="px-4 py-8 text-center text-gray-400">لا يوجد لاعبين</td>
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
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                p === page
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
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
