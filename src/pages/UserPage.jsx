import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DynamicForm from '../components/user/DynamicForm'
import ExcelUpload from '../components/user/ExcelUpload'
import Toast from '../components/shared/Toast'

export default function UserPage() {
  const [activeTab, setActiveTab] = useState('manual')
  const [toast, setToast] = useState(null)
  const [submitterName, setSubmitterName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [nameConfirmed, setNameConfirmed] = useState(false)
  const navigate = useNavigate()

  if (!nameConfirmed) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 font-cairo flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mx-4 text-center">
          <div className="text-5xl mb-4">✍️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">مرحباً بك</h2>
          <p className="text-gray-500 text-sm mb-6">من فضلك أدخل اسمك قبل البدء</p>
          <input
            type="text"
            placeholder="الاسم الثلاثي"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center mb-4"
            autoFocus
          />
          <button
            disabled={!nameInput.trim()}
            onClick={() => { setSubmitterName(nameInput.trim()); setNameConfirmed(true) }}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            بدء التسجيل
          </button>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-cairo">
      <header className="bg-primary text-white py-4 px-6 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚽</span>
            <h1 className="text-xl font-bold">نظام تسجيل اللاعبين</h1>
          </div>
          <button
            onClick={() => navigate('/admin/login')}
            className="text-sm text-white/80 hover:text-white border border-white/30 hover:border-white px-3 py-1.5 rounded-lg transition-colors"
          >
            🔐 دخول المدير
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-primary/10 rounded-xl px-5 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            المسجل: <strong>{submitterName}</strong>
          </span>
          <button
            onClick={() => { setNameInput(''); setNameConfirmed(false) }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            تغيير
          </button>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-6 py-3 font-semibold text-sm transition-colors ${
              activeTab === 'manual'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📝 إدخال يدوي
          </button>
          <button
            onClick={() => setActiveTab('excel')}
            className={`px-6 py-3 font-semibold text-sm transition-colors ${
              activeTab === 'excel'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 رفع ملف Excel
          </button>
        </div>

        {activeTab === 'manual' && (
          <DynamicForm submitterName={submitterName} onSuccess={(msg) => setToast({ type: 'success', msg })} />
        )}
        {activeTab === 'excel' && (
          <ExcelUpload submitterName={submitterName} onSuccess={(msg) => setToast({ type: 'success', msg })} />
        )}
      </main>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
