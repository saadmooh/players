import { useState } from 'react'
import { configAPI } from '../../api/supabaseApi'

export default function FieldModal({ field, token, onClose, onSave }) {
  const isEdit = !!field.FieldID
  const [form, setForm] = useState({
    FieldID: field.FieldID || '',
    FieldName: field.FieldName || '',
    FieldLabel: field.FieldLabel || '',
    FieldType: field.FieldType || 'text',
    IsRequired: field.IsRequired || 'FALSE',
    IsActive: field.IsActive ?? 'TRUE',
    DropdownOptions: field.DropdownOptions || '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await configAPI.saveField(token, form)
      onSave()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {isEdit ? 'تعديل حقل' : 'إضافة حقل جديد'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">اسم الحقل (باللاتيني)</label>
            <input
              value={form.FieldName}
              onChange={e => setForm(f => ({ ...f, FieldName: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="مثل: playerName"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">التسمية (بالعربي)</label>
            <input
              value={form.FieldLabel}
              onChange={e => setForm(f => ({ ...f, FieldLabel: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="مثل: اسم اللاعب"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">النوع</label>
            <select value={form.FieldType} onChange={e => setForm(f => ({ ...f, FieldType: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
              <option value="text">نص</option>
              <option value="number">رقم</option>
              <option value="date">تاريخ</option>
              <option value="email">بريد إلكتروني</option>
              <option value="tel">هاتف</option>
              <option value="textarea">نص طويل</option>
              <option value="select">قائمة منسدلة</option>
            </select>
          </div>

          {form.FieldType === 'select' && (
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">خيارات القائمة (مفصولة بفاصلة)</label>
              <input
                value={form.DropdownOptions}
                onChange={e => setForm(f => ({ ...f, DropdownOptions: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                placeholder="مهاجم,مدافع,وسط,حارس"
              />
            </div>
          )}

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.IsRequired === 'TRUE'}
                onChange={e => setForm(f => ({ ...f, IsRequired: e.target.checked ? 'TRUE' : 'FALSE' }))} />
              <span>حقل إلزامي</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.IsActive === 'TRUE'}
                onChange={e => setForm(f => ({ ...f, IsActive: e.target.checked ? 'TRUE' : 'FALSE' }))} />
              <span>نشط</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
              {saving ? 'جاري الحفظ...' : 'حفظ'}
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
