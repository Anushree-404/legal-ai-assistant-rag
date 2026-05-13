import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User, AuthState } from '../types/auth'

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'legal_ai_user'
const USERS_KEY   = 'legal_ai_users'

// Helpers — simple localStorage-based auth (no backend required)
function loadUsers(): Record<string, { name: string; email: string; password: string; role: 'user' | 'admin'; createdAt: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveUsers(users: ReturnType<typeof loadUsers>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setUser(JSON.parse(stored))
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // Simulate async call
    await new Promise((r) => setTimeout(r, 600))

    const users = loadUsers()
    const key   = email.toLowerCase().trim()
    const found = users[key]

    if (!found) throw new Error('No account found with this email.')
    if (found.password !== btoa(password)) throw new Error('Incorrect password.')

    const u: User = {
      id: btoa(key),
      name: found.name,
      email: key,
      role: found.role,
      createdAt: found.createdAt,
    }
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600))

    const users = loadUsers()
    const key   = email.toLowerCase().trim()

    if (users[key]) throw new Error('An account with this email already exists.')
    if (password.length < 6) throw new Error('Password must be at least 6 characters.')

    const now = new Date().toISOString()
    users[key] = { name: name.trim(), email: key, password: btoa(password), role: 'user', createdAt: now }
    saveUsers(users)

    const u: User = { id: btoa(key), name: name.trim(), email: key, role: 'user', createdAt: now }
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
