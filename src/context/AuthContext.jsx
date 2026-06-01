import { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../api/supabaseApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('adminInfo') || 'null')
    } catch {
      return null
    }
  })

  const login = useCallback(async (username, password) => {
    const data = await authAPI.login(username, password)
    sessionStorage.setItem('adminInfo', JSON.stringify(data))
    setAdmin(data)
    return data
  }, [])

  const logout = useCallback(async () => {
    if (admin?.token) {
      try { await authAPI.logout(admin.token) } catch {}
    }
    sessionStorage.removeItem('adminInfo')
    setAdmin(null)
  }, [admin])

  return (
    <AuthContext.Provider value={{ admin, login, logout, isLoggedIn: !!admin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
