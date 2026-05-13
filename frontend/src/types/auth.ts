export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export type AuthView = 'login' | 'register'
