import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useActiveFields } from '../../hooks/useFields'
import ColumnMapper from './ColumnMapper'
import { userAPI } from '../../api/supabaseApi'

export default function ExcelUpload({ submitterName, teamName, coachPhone, onSuccess }) {
  const { data: systemFields = [] } = useActiveFields()
  const [step, setStep] = useState('upload')
  const [sheetData, setSheetData] = useState([])
  const [sheetColumns, setSheetColumns] = useState([])
  const [mapping, setMapping] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()

  function handleFile(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' })
      if (json.length === 0) return alert('الملف فارغ')
      setSheetData(json)
      setSheetColumns(Object.keys(json[0]))
      setStep('preview')
    }
    reader.readAsBinaryString(file)
  }

  async function handleSubmit() {
    const players = sheetData.map(row => {
      const player = { _submitted_by: submitterName, _team_name: teamName, _coach_phone: coachPhone }
      Object.entries(mapping).forEach(([sheetCol, systemField]) => {
        if (systemField) player[systemField] = row[sheetCol]
      })
      return player
    })

    setSubmitting(true)
    try {
      const result = await userAPI.submitBulkPlayers(players)
      onSuccess(`تم حفظ ${result.saved} لاعب بنجاح ✓`)
      setStep('upload')
      setSheetData([])
      setMapping({})
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {step === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current.click()}
          className={`border-3 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          <div className={`text-6xl mb-4 transition-transform duration-300 ${dragOver ? 'scale-110' : ''}`}>📂</div>
          <p className="text-gray-700 font-bold text-lg mb-1">اسحب ملف Excel هنا</p>
          <p className="text-gray-400 text-sm">أو انقر للاختيار — يقبل .xlsx, .xls, .csv</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      )}

      {step === 'preview' && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3">معاينة البيانات <span className="text-gray-400 font-normal text-sm">(أول 5 صفوف)</span></h3>
          <div className="overflow-x-auto border border-gray-200 rounded-xl mb-4">
            <table className="text-sm w-full">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>{sheetColumns.map(c => <th key={c} className="px-4 py-3 text-right font-semibold">{c}</th>)}</tr>
              </thead>
              <tbody>
                {sheetData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    {sheetColumns.map(c => <td key={c} className="px-4 py-3 text-gray-700">{row[c]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 text-sm">إجمالي الصفوف: <strong className="text-gray-700">{sheetData.length}</strong></p>
            <button
              onClick={() => setStep('upload')}
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
            >
              ✕ تغيير الملف
            </button>
          </div>
          <button
            onClick={() => setStep('mapping')}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            التالي: ربط الأعمدة ←
          </button>
        </div>
      )}

      {step === 'mapping' && (
        <ColumnMapper
          sheetColumns={sheetColumns}
          systemFields={systemFields}
          mapping={mapping}
          onChange={setMapping}
          onSubmit={handleSubmit}
          submitting={submitting}
          totalRows={sheetData.length}
        />
      )}
    </div>
  )
}
