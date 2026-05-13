import { useState, type FormEvent } from 'react'
import { Scale, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { AuthView } from '../types/auth'
import { clsx } from 'clsx'

interface LoginPageProps {
  onViewChange: (v: AuthView) => void
}

export function LoginPage({ onViewChange }: LoginPageProps) {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-legal-950 px-14 py-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-legal-600">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Legal AI</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Your AI-powered<br />Legal Research<br />Assistant
          </h1>
          <p className="mt-4 text-legal-300 text-base leading-relaxed max-w-sm">
            Instantly research case law, analyze statutes, and get cited legal guidance — powered by RAG technology.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: '⚖️', text: 'Search 13+ legal domains' },
              { icon: '📚', text: 'Cited responses with source documents' },
              { icon: '🔒', text: 'Secure & confidential research' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm text-legal-200">
                <span className="text-lg">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-legal-500">
          General legal information only — not legal advice.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-legal-700">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Legal AI Assistant</span>
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white px-8 py-10 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              {/* Email */}
              <div>
                <label className="label" htmlFor="login-email">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-10"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label" htmlFor="login-password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Demo account hint */}
            <div className="rounded-lg bg-legal-50 border border-legal-100 px-4 py-3 text-xs text-legal-700">
              <p className="font-semibold mb-1">New here?</p>
              <p>Create a free account to start researching legal topics with AI-powered citations.</p>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                onClick={() => onViewChange('register')}
                className="font-semibold text-legal-600 hover:text-legal-800 underline-offset-2 hover:underline"
              >
                Create one free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
