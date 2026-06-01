import { useState } from 'react'

export default function PlayerEditModal({ player, fields, onSave, onClose }) {
  const [form, setForm] = useState(() => {
    const initial = {}
    fields.forEach(f => {
      initial[f.FieldName] = player[f.FieldName] || ''
    })
    return initial
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  function renderField(field) {
    const baseClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    switch (field.FieldType) {
      case 'textarea':
        return <textarea value={form[field.FieldName] || ''} onChange={e => setForm(f => ({ ...f, [field.FieldName]: e.target.value }))} rows={3} className={baseClass} />
      case 'select':
        return (
          <select value={form[field.FieldName] || ''} onChange={e => setForm(f => ({ ...f, [field.FieldName]: e.target.value }))} className={baseClass}>
            <option value="">— اختر —</option>
            {field.DropdownOptions?.split(',').map(opt => (
              <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
            ))}
          </select>
        )
      default:
        return <input type={field.FieldType === 'number' ? 'number' : 'text'} value={form[field.FieldName] || ''} onChange={e => setForm(f => ({ ...f, [field.FieldName]: e.target.value }))} className={baseClass} />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">تعديل بيانات اللاعب</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.FieldID}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {field.FieldLabel}
              </label>
              {renderField(field)}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg text-sm transition-colors">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
