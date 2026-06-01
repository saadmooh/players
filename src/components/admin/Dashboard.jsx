import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { useStats } from '../../hooks/useStats'
import LoadingSpinner from '../shared/LoadingSpinner'
import { statsAPI } from '../../api/supabaseApi'

export default function Dashboard() {
  const { admin } = useAuth()
  const { data: stats, isLoading } = useStats(admin?.token)
  const [seeding, setSeeding] = useState(false)
  const qc = useQueryClient()

  async function handleSeed() {
    if (!confirm('سيتم مسح جميع البيانات الحالية وإضافة 50 لاعب وهمي. هل أنت متأكد؟')) return
    setSeeding(true)
    try {
      const result = await statsAPI.seedMockData(admin.token)
      alert(`تم إدخال ${result.players} لاعب و ${result.fields} حقل بنجاح`)
      qc.invalidateQueries()
    } catch (err) {
      alert(err.message)
    } finally {
      setSeeding(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  const cards = [
    { label: 'إجمالي اللاعبين', value: stats?.totalPlayers ?? 0 },
    { label: 'الحقول النشطة', value: stats?.fieldsCount ?? 0 },
    { label: 'تسجيلات اليوم', value: stats?.todaySubmissions ?? 0 },
    { label: 'آخر تسجيل', value: stats?.lastSubmission || '—' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">لوحة التحكم</h2>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {seeding ? 'جاري الإدخال...' : '🧪 إدخال بيانات تجريبية'}
        </button>
      </div>

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
