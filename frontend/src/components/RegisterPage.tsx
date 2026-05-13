import { useState, type FormEvent } from 'react'
import { Scale, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { AuthView } from '../types/auth'

interface RegisterPageProps {
  onViewChange: (v: AuthView) => void
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 6 characters', ok: password.length >= 6 },
    { label: 'Contains a number', ok: /\d/.test(password) },
    { label: 'Contains a letter', ok: /[a-zA-Z]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length
  const colors = ['bg-red-400', 'bg-yellow-400', 'bg-green-400']
  const labels = ['Weak', 'Fair', 'Strong']

  if (!password) return null

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Strength: <span className="font-medium">{labels[score - 1] ?? 'Too short'}</span>
      </p>
      <ul className="space-y-0.5">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RegisterPage({ onViewChange }: RegisterPageProps) {
  const { register } = useAuth()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await register(name, email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-legal-950 px-14 py-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-legal-600">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Legal AI</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Start your free<br />legal research<br />journey today
          </h1>
          <p className="mt-4 text-legal-300 text-base leading-relaxed max-w-sm">
            Join thousands of users who use Legal AI to research case law, understand statutes, and analyze legal documents.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { num: '13+', label: 'Legal domains' },
              { num: '100%', label: 'Free to use' },
              { num: 'RAG', label: 'AI technology' },
              { num: '24/7', label: 'Always available' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-legal-900 px-4 py-3">
                <p className="text-2xl font-bold text-white">{s.num}</p>
                <p className="text-xs text-legal-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-legal-500">
          General legal information only — not legal advice.
        </p>
      </div>

      {/* Right panel */}
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
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-1 text-sm text-gray-500">Free forever — no credit card required</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              {/* Full name */}
              <div>
                <label className="label" htmlFor="reg-name">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="input pl-10"
                    required
                    autoFocus
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label" htmlFor="reg-email">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label" htmlFor="reg-password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="reg-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="input pl-10 pr-10"
                    required
                    autoComplete="new-password"
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
                <PasswordStrength password={password} />
              </div>

              {/* Confirm password */}
              <div>
                <label className="label" htmlFor="reg-confirm">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="reg-confirm"
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className={`input pl-10 ${confirm && confirm !== password ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                    required
                    autoComplete="new-password"
                  />
                </div>
                {confirm && confirm !== password && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Terms note */}
              <p className="text-xs text-gray-400">
                By creating an account you agree that this tool provides general legal information only and is not a substitute for professional legal advice.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !name || !email || !password || !confirm}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                ) : (
                  'Create free account'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button
                onClick={() => onViewChange('login')}
                className="font-semibold text-legal-600 hover:text-legal-800 underline-offset-2 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
