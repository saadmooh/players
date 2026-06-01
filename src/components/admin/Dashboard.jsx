import { useAuth } from '../../context/AuthContext'
import { useStats } from '../../hooks/useStats'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function Dashboard() {
  const { admin } = useAuth()
  const { data: stats, isLoading } = useStats(admin?.token)

  if (isLoading) return <LoadingSpinner />

  const cards = [
    { label: 'إجمالي اللاعبين', value: stats?.totalPlayers ?? 0 },
    { label: 'الحقول النشطة', value: stats?.fieldsCount ?? 0 },
    { label: 'تسجيلات اليوم', value: stats?.todaySubmissions ?? 0 },
    { label: 'آخر تسجيل', value: stats?.lastSubmission || '—' },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">لوحة التحكم</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-gray-500 text-sm mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
