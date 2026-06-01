import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useActiveFields } from '../../hooks/useFields'
import ColumnMapper from './ColumnMapper'
import { userAPI } from '../../api/supabaseApi'

export default function ExcelUpload({ onSuccess }) {
  const { data: systemFields = [] } = useActiveFields()
  const [step, setStep] = useState('upload')
  const [sheetData, setSheetData] = useState([])
  const [sheetColumns, setSheetColumns] = useState([])
  const [mapping, setMapping] = useState({})
  const [submitting, setSubmitting] = useState(false)
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
      const player = {}
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
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {step === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-green-50 transition-colors"
        >
          <div className="text-5xl mb-3">📂</div>
          <p className="text-gray-600 font-semibold">اسحب ملف Excel هنا</p>
          <p className="text-gray-400 text-sm mt-1">أو انقر للاختيار — يقبل .xlsx, .xls, .csv</p>
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
          <h3 className="font-bold text-gray-700 mb-3">معاينة البيانات (أول 5 صفوف)</h3>
          <div className="overflow-x-auto border rounded-lg mb-4">
            <table className="text-xs w-full">
              <thead className="bg-gray-100">
                <tr>{sheetColumns.map(c => <th key={c} className="px-3 py-2 text-right">{c}</th>)}</tr>
              </thead>
              <tbody>
                {sheetData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t">
                    {sheetColumns.map(c => <td key={c} className="px-3 py-2">{row[c]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-sm mb-4">إجمالي الصفوف: {sheetData.length}</p>
          <button
            onClick={() => setStep('mapping')}
            className="w-full bg-primary text-white font-bold py-3 rounded-lg"
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
