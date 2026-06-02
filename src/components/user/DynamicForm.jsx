import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useActiveFields } from '../../hooks/useFields'
import { userAPI } from '../../api/supabaseApi'

export default function DynamicForm({ submitterName, teamName, coachPhone, onSuccess }) {
  const { data: fields = [], isLoading } = useActiveFields()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)

  function renderField(field) {
    const baseClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50/50 transition-all duration-300"
    const rules = field.IsRequired === 'TRUE' ? { required: `${field.FieldLabel} مطلوب` } : {}

    switch (field.FieldType) {
      case 'textarea':
        return <textarea {...register(field.FieldName, rules)} rows={3} className={`${baseClass} resize-none`} placeholder={`أدخل ${field.FieldLabel}`} />
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
            type={field.FieldType === 'number' ? 'number' : 'text'}
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
      await userAPI.submitPlayer({ ...values, _submitted_by: submitterName, _team_name: teamName, _coach_phone: coachPhone })
      reset()
      onSuccess('تم حفظ بيانات اللاعب بنجاح ✓')
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      <p className="mt-4 text-gray-400 text-sm">جاري تحميل النموذج...</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {fields.map(field => (
        <div key={field.FieldID}>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {field.FieldLabel}
            {field.IsRequired === 'TRUE' && <span className="text-red-500 mr-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.FieldName] && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <span>⚠️</span> {errors[field.FieldName].message}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            جاري الحفظ...
          </span>
        ) : 'حفظ بيانات اللاعب'}
      </button>
    </form>
  )
}
