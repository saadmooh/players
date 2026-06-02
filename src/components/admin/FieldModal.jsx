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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-lg">{isEdit ? '⚙️' : '➕'}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800">
            {isEdit ? 'تعديل حقل' : 'إضافة حقل جديد'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">اسم الحقل (باللاتيني)</label>
            <input
              value={form.FieldName}
              onChange={e => setForm(f => ({ ...f, FieldName: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50/50 transition-all duration-300"
              placeholder="مثل: playerName"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">التسمية (بالعربي)</label>
            <input
              value={form.FieldLabel}
              onChange={e => setForm(f => ({ ...f, FieldLabel: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50/50 transition-all duration-300"
              placeholder="مثل: اسم اللاعب"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">النوع</label>
            <select value={form.FieldType} onChange={e => setForm(f => ({ ...f, FieldType: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300">
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
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">خيارات القائمة (مفصولة بفاصلة)</label>
              <input
                value={form.DropdownOptions}
                onChange={e => setForm(f => ({ ...f, DropdownOptions: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
                placeholder="مهاجم,مدافع,وسط,حارس"
              />
            </div>
          )}

          <div className="flex gap-6 bg-gray-50/50 rounded-xl px-4 py-3">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" checked={form.IsRequired === 'TRUE'}
                onChange={e => setForm(f => ({ ...f, IsRequired: e.target.checked ? 'TRUE' : 'FALSE' }))}
                className="rounded border-gray-300 text-primary focus:ring-primary/30" />
              <span className="text-gray-700">حقل إلزامي</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" checked={form.IsActive === 'TRUE'}
                onChange={e => setForm(f => ({ ...f, IsActive: e.target.checked ? 'TRUE' : 'FALSE' }))}
                className="rounded border-gray-300 text-primary focus:ring-primary/30" />
              <span className="text-gray-700">نشط</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm transition-all duration-300 disabled:opacity-60 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </span>
              ) : 'حفظ'}
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
