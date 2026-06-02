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
    const baseClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50/50 transition-all duration-300"
    switch (field.FieldType) {
      case 'textarea':
        return <textarea value={form[field.FieldName] || ''} onChange={e => setForm(f => ({ ...f, [field.FieldName]: e.target.value }))} rows={3} className={`${baseClass} resize-none`} />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-lg">✏️</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800">تعديل بيانات اللاعب</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(field => (
            <div key={field.FieldID}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {field.FieldLabel}
              </label>
              {renderField(field)}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm transition-all duration-300 disabled:opacity-60 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </span>
              ) : 'حفظ التغييرات'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition-all duration-300 active:scale-[0.98]">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
