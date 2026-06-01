import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DynamicForm from '../components/user/DynamicForm'
import ExcelUpload from '../components/user/ExcelUpload'
import Toast from '../components/shared/Toast'

export default function UserPage() {
  const [activeTab, setActiveTab] = useState('manual')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

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
          <DynamicForm onSuccess={(msg) => setToast({ type: 'success', msg })} />
        )}
        {activeTab === 'excel' && (
          <ExcelUpload onSuccess={(msg) => setToast({ type: 'success', msg })} />
        )}
      </main>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
