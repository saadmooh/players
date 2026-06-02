import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    setLoading(true)
    setError('')
    try {
      await login(fd.get('username'), fd.get('password'))
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'اسم المستخدم أو كلمة المرور غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-[#0a2e14] flex items-center justify-center font-cairo relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-light/20 via-transparent to-transparent pointer-events-none" />
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-9 w-full max-w-sm mx-4 relative border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">لوحة تحكم المدير</h1>
          <p className="text-gray-400 text-sm mt-1">من فضلك سجل الدخول للمتابعة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">اسم المستخدم</label>
            <input name="username" type="text" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50/50 transition-all duration-300"
              placeholder="أدخل اسم المستخدم" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <input name="password" type={showPass ? 'text' : 'password'} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50/50 transition-all duration-300"
                placeholder="أدخل كلمة المرور" />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg transition-colors">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الدخول...
              </span>
            ) : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
