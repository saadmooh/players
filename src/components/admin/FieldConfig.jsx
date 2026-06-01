import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Sortable from 'sortablejs'
import { useAuth } from '../../context/AuthContext'
import { useAllFields } from '../../hooks/useFields'
import { configAPI } from '../../api/supabaseApi'
import FieldModal from './FieldModal'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function FieldConfig() {
  const { admin } = useAuth()
  const { data: fields = [], isLoading } = useAllFields(admin?.token)
  const [modalField, setModalField] = useState(null)
  const listRef = useRef()
  const qc = useQueryClient()

  useEffect(() => {
    if (!listRef.current || !fields.length) return
    const sortable = Sortable.create(listRef.current, {
      handle: '.drag-handle',
      animation: 150,
      onEnd: async ({ oldIndex, newIndex }) => {
        if (oldIndex === newIndex) return
        const reordered = [...fields]
        const [moved] = reordered.splice(oldIndex, 1)
        reordered.splice(newIndex, 0, moved)
        try {
          await configAPI.reorderFields(admin.token, reordered.map(f => f.FieldID))
          qc.invalidateQueries({ queryKey: ['allFields'] })
        } catch {}
      }
    })
    return () => sortable.destroy()
  }, [fields])

  const deleteMutation = useMutation({
    mutationFn: (id) => configAPI.deleteField(admin.token, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allFields'] })
      qc.invalidateQueries({ queryKey: ['activeFields'] })
    },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">إعداد الحقول</h2>
        <button onClick={() => setModalField({})}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
          + إضافة حقل
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-right w-8"></th>
              <th className="px-4 py-3 text-right">التسمية</th>
              <th className="px-4 py-3 text-right">النوع</th>
              <th className="px-4 py-3 text-right">إلزامي</th>
              <th className="px-4 py-3 text-right">نشط</th>
              <th className="px-4 py-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody ref={listRef}>
            {fields.map(field => (
              <tr key={field.FieldID} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="drag-handle cursor-grab text-gray-300 text-lg">⠿</span>
                </td>
                <td className="px-4 py-3 font-medium">{field.FieldLabel}</td>
                <td className="px-4 py-3 text-gray-500">{field.FieldType}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${field.IsRequired === 'TRUE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                    {field.IsRequired === 'TRUE' ? 'إلزامي' : 'اختياري'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${field.IsActive === 'TRUE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {field.IsActive === 'TRUE' ? 'نشط' : 'مخفي'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => setModalField(field)}
                    className="text-blue-600 hover:underline text-xs">تعديل</button>
                  <button onClick={() => { if (confirm('حذف هذا الحقل؟')) deleteMutation.mutate(field.FieldID) }}
                    className="text-red-500 hover:underline text-xs">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalField !== null && (
        <FieldModal
          field={modalField}
          token={admin.token}
          onClose={() => setModalField(null)}
          onSave={() => { setModalField(null); qc.invalidateQueries({ queryKey: ['allFields', 'activeFields'] }) }}
        />
      )}
    </div>
  )
}
