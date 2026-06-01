import { useAuth } from '../../context/AuthContext'

const items = [
  { key: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
  { key: 'players', label: 'اللاعبين', icon: '👥' },
  { key: 'config', label: 'إعداد الحقول', icon: '⚙️' },
  { key: 'admins', label: 'المديرين', icon: '🔐' },
]

export default function Sidebar({ activeSection, onNavigate }) {
  const { admin, logout } = useAuth()

  return (
    <aside className="w-64 bg-primary-dark text-white min-h-screen flex flex-col">
      <div className="p-5 border-b border-white/10">
        <span className="text-3xl">⚽</span>
        <h2 className="text-lg font-bold mt-1">نظام اللاعبين</h2>
        <p className="text-xs text-white/60 mt-1">{admin?.username || 'المدير'}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full text-right px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              activeSection === item.key
                ? 'bg-white/15 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="ml-2">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full text-right px-4 py-3 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          🚪 تسجيل خروج
        </button>
      </div>
    </aside>
  )
}
