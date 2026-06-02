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
        <h2 className="text-2xl font-bold text-gray-800">إعداد الحقول</h2>
        <button onClick={() => setModalField({})}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.97]">
          + إضافة حقل
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-l from-gray-50 to-gray-100/50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-4 text-right w-8"></th>
              <th className="px-4 py-4 text-right font-semibold">التسمية</th>
              <th className="px-4 py-4 text-right font-semibold">النوع</th>
              <th className="px-4 py-4 text-right font-semibold">إلزامي</th>
              <th className="px-4 py-4 text-right font-semibold">نشط</th>
              <th className="px-4 py-4 text-right font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody ref={listRef}>
            {fields.map((field, idx) => (
              <tr key={field.FieldID} className={`transition-colors duration-200 ${
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              } hover:bg-primary/5`}>
                <td className="px-4 py-3.5">
                  <span className="drag-handle cursor-grab text-gray-300 hover:text-gray-500 text-lg transition-colors">⠿</span>
                </td>
                <td className="px-4 py-3.5 font-medium text-gray-800">{field.FieldLabel}</td>
                <td className="px-4 py-3.5 text-gray-500">
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                    {field.FieldType === 'text' ? 'نص' :
                     field.FieldType === 'number' ? 'رقم' :
                     field.FieldType === 'date' ? 'تاريخ' :
                     field.FieldType === 'email' ? 'بريد' :
                     field.FieldType === 'tel' ? 'هاتف' :
                     field.FieldType === 'textarea' ? 'نص طويل' :
                     field.FieldType === 'select' ? 'قائمة' : field.FieldType}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    field.IsRequired === 'TRUE' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    {field.IsRequired === 'TRUE' ? 'إلزامي' : 'اختياري'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    field.IsActive === 'TRUE' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    {field.IsActive === 'TRUE' ? 'نشط' : 'مخفي'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-2">
                    <button onClick={() => setModalField(field)}
                      className="text-blue-600 hover:text-blue-700 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all duration-200">تعديل</button>
                    <button onClick={() => { if (confirm('حذف هذا الحقل؟')) deleteMutation.mutate(field.FieldID) }}
                      className="text-red-500 hover:text-red-600 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all duration-200">حذف</button>
                  </div>
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
