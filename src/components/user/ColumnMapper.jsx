export default function ColumnMapper({
  sheetColumns, systemFields, mapping, onChange, onSubmit, submitting, totalRows
}) {
  return (
    <div>
      <h3 className="font-bold text-gray-700 mb-1">ربط أعمدة الملف بحقول النظام</h3>
      <p className="text-gray-500 text-sm mb-4">كل عمود من ملفك → ما يقابله في النظام</p>

      <div className="space-y-3 mb-6">
        {sheetColumns.map(col => (
          <div key={col} className="flex items-center gap-3">
            <span className="w-40 text-sm font-medium text-gray-700 truncate">{col}</span>
            <span className="text-gray-400">←</span>
            <select
              value={mapping[col] || ''}
              onChange={(e) => onChange(prev => ({ ...prev, [col]: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">— تجاهل هذا العمود —</option>
              {systemFields.map(f => (
                <option key={f.FieldID} value={f.FieldName}>{f.FieldLabel}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full bg-primary text-white font-bold py-3 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? `جاري رفع ${totalRows} لاعب...` : `رفع ${totalRows} لاعب ✓`}
      </button>
    </div>
  )
}
