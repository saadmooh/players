import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DynamicForm from '../components/user/DynamicForm'
import ExcelUpload from '../components/user/ExcelUpload'
import Toast from '../components/shared/Toast'

export default function UserPage() {
  const [activeTab, setActiveTab] = useState('manual')
  const [toast, setToast] = useState(null)
  const [submitterName, setSubmitterName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [coachPhone, setCoachPhone] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [teamInput, setTeamInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [nameConfirmed, setNameConfirmed] = useState(false)
  const navigate = useNavigate()

  if (!nameConfirmed) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 font-cairo flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md mx-4 text-center relative border border-white/50">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">✍️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">مرحباً بك</h2>
          <p className="text-gray-500 text-sm mb-8">من فضلك أدخل بياناتك قبل البدء</p>
          <input
            type="text"
            placeholder="الاسم"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-gray-50/50 text-right transition-all duration-300 mb-3"
            autoFocus
          />
          <input
            type="text"
            placeholder="اسم الفريق"
            value={teamInput}
            onChange={e => setTeamInput(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-gray-50/50 text-right transition-all duration-300 mb-3"
          />
          <input
            type="tel"
            placeholder="هاتف المدرب"
            value={phoneInput}
            onChange={e => setPhoneInput(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-gray-50/50 text-right transition-all duration-300 mb-4"
            onKeyDown={e => { if (e.key === 'Enter' && nameInput.trim() && teamInput.trim() && phoneInput.trim()) { setSubmitterName(nameInput.trim()); setTeamName(teamInput.trim()); setCoachPhone(phoneInput.trim()); setNameConfirmed(true) } }}
          />
          <button
            disabled={!nameInput.trim() || !teamInput.trim() || !phoneInput.trim()}
            onClick={() => { setSubmitterName(nameInput.trim()); setTeamName(teamInput.trim()); setCoachPhone(phoneInput.trim()); setNameConfirmed(true) }}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            بدء التسجيل
          </button>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 font-cairo">
      <header className="bg-gradient-to-l from-primary to-primary-dark text-white py-4 px-6 shadow-lg shadow-primary/20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚽</span>
            <h1 className="text-xl font-bold tracking-wide">نظام تسجيل اللاعبين</h1>
          </div>
          <button
            onClick={() => navigate('/admin/login')}
            className="text-sm text-white/80 hover:text-white border border-white/25 hover:border-white/60 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-white/10"
          >
            🔐 دخول المدير
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 px-5 py-3.5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>المدرب: <strong className="text-primary">{submitterName}</strong></span>
            <span className="text-gray-300">|</span>
            <span>الفريق: <strong className="text-primary">{teamName}</strong></span>
            <span className="text-gray-300">|</span>
            <span>هاتف المدرب: <strong className="text-primary" dir="ltr">{coachPhone}</strong></span>
          </div>
          <button
            onClick={() => { setNameInput(''); setTeamInput(''); setPhoneInput(''); setNameConfirmed(false) }}
            className="text-xs text-gray-400 hover:text-gray-600 underline-offset-2 hover:underline transition-colors"
          >
            تغيير
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-6 flex">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 px-6 py-2.5 font-semibold text-sm rounded-xl transition-all duration-300 ${
              activeTab === 'manual'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            📝 إدخال يدوي
          </button>
          <button
            onClick={() => setActiveTab('excel')}
            className={`flex-1 px-6 py-2.5 font-semibold text-sm rounded-xl transition-all duration-300 ${
              activeTab === 'excel'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            📊 رفع ملف Excel
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'manual' && (
            <DynamicForm submitterName={submitterName} teamName={teamName} coachPhone={coachPhone} onSuccess={(msg) => setToast({ type: 'success', msg })} />
          )}
          {activeTab === 'excel' && (
            <ExcelUpload submitterName={submitterName} teamName={teamName} coachPhone={coachPhone} onSuccess={(msg) => setToast({ type: 'success', msg })} />
          )}
        </div>
      </main>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
