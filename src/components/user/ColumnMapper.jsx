export default function ColumnMapper({
  sheetColumns, systemFields, mapping, onChange, onSubmit, submitting, totalRows
}) {
  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-1">ربط أعمدة الملف بحقول النظام</h3>
      <p className="text-gray-400 text-sm mb-5">كل عمود من ملفك → ما يقابله في النظام</p>

      <div className="space-y-3 mb-6">
        {sheetColumns.map((col, idx) => (
          <div key={col} className="flex items-center gap-3 bg-gray-50/50 hover:bg-gray-100/50 rounded-xl px-4 py-3 transition-colors duration-200">
            <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {idx + 1}
            </span>
            <span className="w-36 text-sm font-medium text-gray-700 truncate">{col}</span>
            <span className="text-gray-300 shrink-0">←</span>
            <select
              value={mapping[col] || ''}
              onChange={(e) => onChange(prev => ({ ...prev, [col]: e.target.value }))}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
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
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            جاري رفع {totalRows} لاعب...
          </span>
        ) : `رفع ${totalRows} لاعب ✓`}
      </button>
    </div>
  )
}
