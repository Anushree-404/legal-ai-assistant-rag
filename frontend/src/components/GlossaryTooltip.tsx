import { useState, useRef, useEffect } from 'react'
import { BookOpen, Loader2, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useTheme } from '../context/ThemeContext'

interface GlossaryResult {
  term: string
  definition: string
  latin_origin: string | null
  example: string
  related_terms: string[]
  domain: string
}

interface Props {
  onClose: () => void
}

export function GlossaryLookup({ onClose }: Props) {
  const { isDark } = useTheme()
  const [term, setTerm]         = useState('')
  const [result, setResult]     = useState<GlossaryResult | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [history, setHistory]   = useState<GlossaryResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const lookup = async (searchTerm?: string) => {
    const t = (searchTerm ?? term).trim()
    if (!t) return
    setLoading(true); setError(null)
    try {
      const res = await fetch('/glossary/define', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: t }),
      })
      if (!res.ok) throw new Error('Definition not found')
      const data = await res.json()
      setResult(data)
      setHistory((prev) => [data, ...prev.filter((h) => h.term !== data.term)].slice(0, 10))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  const DOMAIN_COLORS: Record<string, string> = {
    criminal: 'bg-red-100 text-red-700', civil: 'bg-blue-100 text-blue-700',
    contract: 'bg-green-100 text-green-700', tort: 'bg-orange-100 text-orange-700',
    constitutional: 'bg-purple-100 text-purple-700', general: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={clsx('w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden', isDark ? 'bg-gray-900' : 'bg-white')}>
        {/* Search */}
        <div className={clsx('flex items-center gap-3 border-b px-4 py-3', isDark ? 'border-gray-700' : 'border-gray-200')}>
          <BookOpen className="h-5 w-5 text-legal-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
            placeholder="Look up any legal term… (e.g., habeas corpus, mens rea, estoppel)"
            className={clsx('flex-1 text-sm focus:outline-none bg-transparent', isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400')}
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-legal-500 shrink-0" />}
          <button onClick={onClose} className={clsx('shrink-0', isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Result */}
          {result && (
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={clsx('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>{result.term}</h3>
                  {result.latin_origin && (
                    <p className={clsx('text-xs italic', isDark ? 'text-gray-500' : 'text-gray-400')}>Latin: {result.latin_origin}</p>
                  )}
                </div>
                <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0', DOMAIN_COLORS[result.domain] ?? DOMAIN_COLORS.general)}>
                  {result.domain}
                </span>
              </div>

              <p className={clsx('text-sm leading-relaxed', isDark ? 'text-gray-300' : 'text-gray-700')}>{result.definition}</p>

              <div className={clsx('rounded-xl p-3', isDark ? 'bg-gray-800' : 'bg-legal-50')}>
                <p className={clsx('text-xs font-semibold mb-1', isDark ? 'text-legal-400' : 'text-legal-700')}>Example</p>
                <p className={clsx('text-xs italic', isDark ? 'text-gray-400' : 'text-gray-600')}>{result.example}</p>
              </div>

              {result.related_terms.length > 0 && (
                <div>
                  <p className={clsx('text-xs font-semibold mb-1.5', isDark ? 'text-gray-400' : 'text-gray-600')}>Related Terms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.related_terms.map((t) => (
                      <button key={t} onClick={() => { setTerm(t); lookup(t) }}
                        className={clsx('rounded-full border px-2.5 py-0.5 text-xs transition-colors hover:scale-105',
                          isDark ? 'border-gray-700 text-gray-400 hover:border-legal-500 hover:text-legal-400' : 'border-legal-200 text-legal-700 hover:bg-legal-100')}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-red-600">{error}</div>
          )}

          {/* History */}
          {!result && history.length > 0 && (
            <div className="p-4">
              <p className={clsx('text-xs font-semibold uppercase tracking-wider mb-2', isDark ? 'text-gray-500' : 'text-gray-400')}>Recent Lookups</p>
              <div className="space-y-1">
                {history.map((h) => (
                  <button key={h.term} onClick={() => { setTerm(h.term); setResult(h) }}
                    className={clsx('w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700')}>
                    <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="font-medium">{h.term}</span>
                    <span className={clsx('text-xs truncate', isDark ? 'text-gray-500' : 'text-gray-400')}>{h.definition.slice(0, 50)}…</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!result && !loading && history.length === 0 && (
            <div className="py-10 text-center">
              <BookOpen className={clsx('mx-auto h-10 w-10 mb-2', isDark ? 'text-gray-700' : 'text-gray-200')} />
              <p className={clsx('text-sm', isDark ? 'text-gray-500' : 'text-gray-400')}>Type a legal term and press Enter</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3 px-4">
                {['habeas corpus', 'mens rea', 'estoppel', 'tort', 'injunction', 'subpoena'].map((t) => (
                  <button key={t} onClick={() => { setTerm(t); lookup(t) }}
                    className={clsx('rounded-full border px-2.5 py-1 text-xs', isDark ? 'border-gray-700 text-gray-400 hover:border-legal-500' : 'border-gray-200 text-gray-600 hover:border-legal-300')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={clsx('border-t px-4 py-2 flex justify-between items-center', isDark ? 'border-gray-700' : 'border-gray-100')}>
          <p className={clsx('text-xs', isDark ? 'text-gray-600' : 'text-gray-400')}>Press Enter to search · Esc to close</p>
          <button onClick={() => lookup()} disabled={!term.trim() || loading}
            className="btn-primary text-xs px-3 py-1.5">Look up</button>
        </div>
      </div>
    </div>
  )
}
