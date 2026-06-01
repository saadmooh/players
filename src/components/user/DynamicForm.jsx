import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useActiveFields } from '../../hooks/useFields'
import { userAPI } from '../../api/supabaseApi'

export default function DynamicForm({ onSuccess }) {
  const { data: fields = [], isLoading } = useActiveFields()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)

  function renderField(field) {
    const baseClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    const rules = field.IsRequired === 'TRUE' ? { required: `${field.FieldLabel} مطلوب` } : {}

    switch (field.FieldType) {
      case 'textarea':
        return <textarea {...register(field.FieldName, rules)} rows={3} className={baseClass} placeholder={`أدخل ${field.FieldLabel}`} />
      case 'select':
        return (
          <select {...register(field.FieldName, rules)} className={baseClass}>
            <option value="">— اختر —</option>
            {field.DropdownOptions?.split(',').map(opt => (
              <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
            ))}
          </select>
        )
      default:
        return (
          <input
            type={field.FieldType || 'text'}
            {...register(field.FieldName, rules)}
            className={baseClass}
            placeholder={`أدخل ${field.FieldLabel}`}
          />
        )
    }
  }

  async function onSubmit(values) {
    setSubmitting(true)
    try {
      await userAPI.submitPlayer(values)
      reset()
      onSuccess('تم حفظ بيانات اللاعب بنجاح ✓')
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <div className="text-center py-10 text-gray-400">جاري تحميل النموذج...</div>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {fields.map(field => (
        <div key={field.FieldID}>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {field.FieldLabel}
            {field.IsRequired === 'TRUE' && <span className="text-red-500 mr-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.FieldName] && (
            <p className="text-red-500 text-xs mt-1">{errors[field.FieldName].message}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'جاري الحفظ...' : 'حفظ بيانات اللاعب'}
      </button>
    </form>
  )
}
