import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import LoginForm from '../components/admin/LoginForm'
import Sidebar from '../components/admin/Sidebar'
import Dashboard from '../components/admin/Dashboard'
import PlayersTable from '../components/admin/PlayersTable'
import FieldConfig from '../components/admin/FieldConfig'
import AdminManagement from '../components/admin/AdminManagement'

export default function AdminPage({ view }) {
  const { isLoggedIn } = useAuth()
  const [section, setSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (view === 'login' || !isLoggedIn) return <LoginForm />

  const sections = {
    dashboard: Dashboard,
    players: PlayersTable,
    config: FieldConfig,
    admins: AdminManagement,
  }
  const ActiveSection = sections[section] || Dashboard

  return (
    <div dir="rtl" className="min-h-screen flex font-cairo bg-gradient-to-br from-gray-50 to-gray-100/50">
      <Sidebar activeSection={section} onNavigate={(s) => { setSection(s); setSidebarOpen(false) }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <main className="flex-1 p-4 md:p-8 overflow-auto pt-16 md:pt-8">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 right-4 z-30 md:hidden bg-white rounded-xl shadow-lg border border-gray-200 p-2.5 hover:bg-gray-50 transition-all duration-200 active:scale-95"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        <ActiveSection />
      </main>
    </div>
  )
}
