import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useStats } from '../../hooks/useStats'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function Dashboard() {
  const { admin } = useAuth()
  const { data: stats, isLoading } = useStats(admin?.token)
  const [copied, setCopied] = useState(false)

  if (isLoading) return <LoadingSpinner />

  const publicUrl = window.location.origin + '/players/'

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const cardIcons = {
    'إجمالي اللاعبين': '👥',
    'الحقول النشطة': '⚙️',
    'تسجيلات اليوم': '📊',
    'آخر تسجيل': '🕐',
  }

  const cards = [
    { label: 'إجمالي اللاعبين', value: stats?.totalPlayers ?? 0 },
    { label: 'الحقول النشطة', value: stats?.fieldsCount ?? 0 },
    { label: 'تسجيلات اليوم', value: stats?.todaySubmissions ?? 0 },
    { label: 'آخر تسجيل', value: stats?.lastSubmission || '—' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">لوحة التحكم</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <p className="text-gray-500 text-sm mb-3 font-medium">رابط تسجيل اللاعبين</p>
        <div className="flex gap-3">
          <input type="text" readOnly value={publicUrl}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 text-gray-700 direction-ltr focus:outline-none focus:ring-2 focus:ring-primary/30"
            onClick={e => e.target.select()} />
          <button onClick={copyLink}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap active:scale-[0.97] ${
              copied
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                : 'bg-primary hover:bg-primary-dark text-white hover:shadow-lg hover:shadow-primary/25'
            }`}>
            {copied ? '✓ تم النسخ' : 'نسخ'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{cardIcons[card.label]}</span>
              <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 group-hover:text-primary transition-colors">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
