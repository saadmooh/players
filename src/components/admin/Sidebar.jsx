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
    <aside className="w-64 bg-gradient-to-b from-primary-dark to-[#0a2e14] text-white min-h-screen flex flex-col shadow-2xl shadow-primary-dark/30">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
            ⚽
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">نظام اللاعبين</h2>
            <p className="text-xs text-white/50">{admin?.username || 'المدير'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full text-right px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 group ${
              activeSection === item.key
                ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg transition-transform duration-300 ${
                activeSection === item.key ? 'scale-110' : 'group-hover:scale-110'
              }`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {activeSection === item.key && (
                <span className="mr-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full text-right px-4 py-3.5 rounded-2xl text-sm font-semibold text-white/50 hover:bg-white/10 hover:text-white transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚪</span>
            <span>تسجيل خروج</span>
          </div>
        </button>
      </div>
    </aside>
  )
}
