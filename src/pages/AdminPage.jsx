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
      <Sidebar activeSection={section} onNavigate={setSection} />
      <main className="flex-1 p-8 overflow-auto">
        <ActiveSection />
      </main>
    </div>
  )
}
