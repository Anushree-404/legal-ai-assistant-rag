import { useState } from 'react'
import { X, ShieldAlert, ShieldCheck, Shield, AlertTriangle, Loader2, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { clsx } from 'clsx'
import { useTheme } from '../context/ThemeContext'

interface RiskFlag {
  severity: 'high' | 'medium' | 'low'
  category: string
  phrase: string
  explanation: string
  suggestion: string
}

interface RiskResult {
  overall_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  flags: RiskFlag[]
  summary: string
}

const SEVERITY_STYLES = {
  high:   { bg: 'bg-red-50 border-red-200',   badge: 'bg-red-100 text-red-700',   icon: <ShieldAlert className="h-4 w-4 text-red-500" /> },
  medium: { bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> },
  low:    { bg: 'bg-blue-50 border-blue-200',  badge: 'bg-blue-100 text-blue-700', icon: <Shield className="h-4 w-4 text-blue-500" /> },
}

const RISK_LEVEL_CONFIG = {
  low:      { color: 'text-green-600', bg: 'bg-green-500', label: 'Low Risk' },
  medium:   { color: 'text-yellow-600', bg: 'bg-yellow-500', label: 'Medium Risk' },
  high:     { color: 'text-orange-600', bg: 'bg-orange-500', label: 'High Risk' },
  critical: { color: 'text-red-600', bg: 'bg-red-500', label: 'Critical Risk' },
}

const DOC_TYPES = ['contract', 'lease', 'employment agreement', 'NDA', 'terms of service', 'settlement agreement', 'other']

interface Props { onClose: () => void }

export function RiskAnalyzer({ onClose }: Props) {
  const { isDark } = useTheme()
  const [text, setText]         = useState('')
  const [docType, setDocType]   = useState('contract')
  const [result, setResult]     = useState<RiskResult | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  const analyze = async () => {
    if (!text.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/analyze/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, document_type: docType }),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const cfg = result ? RISK_LEVEL_CONFIG[result.risk_level] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={clsx(
        'w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]',
        isDark ? 'bg-gray-900' : 'bg-white'
      )}>
        {/* Header */}
        <div className={clsx('flex items-center justify-between border-b px-6 py-4 shrink-0', isDark ? 'border-gray-700' : 'border-gray-200')}>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <h2 className={clsx('text-base font-bold', isDark ? 'text-white' : 'text-gray-900')}>Legal Risk Analyzer</h2>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">AI-powered</span>
          </div>
          <button onClick={onClose} className={clsx('rounded-lg p-1.5', isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100')}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!result ? (
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Document Type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="input">
                  {DOC_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Paste Contract / Legal Text *</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste any contract clause, legal document, or agreement text here…"
                  className={clsx('input min-h-[200px] resize-y font-mono text-xs', isDark ? 'bg-gray-800 text-gray-200' : '')}
                />
                <p className={clsx('text-xs mt-1', isDark ? 'text-gray-500' : 'text-gray-400')}>{text.length} chars · max 4000</p>
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
              )}
              <button
                onClick={analyze}
                disabled={loading || !text.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing risks…</> : <><ShieldAlert className="h-4 w-4" /> Analyze Legal Risks</>}
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {/* Score gauge */}
              <div className={clsx('rounded-2xl p-5 text-center', isDark ? 'bg-gray-800' : 'bg-gray-50')}>
                <div className="relative inline-flex items-center justify-center mb-3">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke={isDark ? '#374151' : '#e5e7eb'} strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none"
                      stroke={result.risk_level === 'critical' ? '#ef4444' : result.risk_level === 'high' ? '#f97316' : result.risk_level === 'medium' ? '#eab308' : '#22c55e'}
                      strokeWidth="10"
                      strokeDasharray={`${(result.overall_score / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className={clsx('text-3xl font-black', cfg?.color)}>{result.overall_score}</p>
                    <p className={clsx('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-500')}>/ 100</p>
                  </div>
                </div>
                <p className={clsx('text-lg font-bold', cfg?.color)}>{cfg?.label}</p>
                <p className={clsx('text-sm mt-1 max-w-md mx-auto', isDark ? 'text-gray-400' : 'text-gray-600')}>{result.summary}</p>
              </div>

              {/* Risk flags */}
              <div>
                <h3 className={clsx('text-sm font-bold mb-3', isDark ? 'text-gray-200' : 'text-gray-800')}>
                  {result.flags.length} Risk Flag{result.flags.length !== 1 ? 's' : ''} Identified
                </h3>
                <div className="space-y-2">
                  {result.flags.map((flag, i) => {
                    const s = SEVERITY_STYLES[flag.severity] ?? SEVERITY_STYLES.low
                    return (
                      <div key={i} className={clsx('rounded-xl border overflow-hidden', isDark ? 'border-gray-700 bg-gray-800' : s.bg)}>
                        <button
                          onClick={() => setExpanded(expanded === i ? null : i)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left"
                        >
                          {s.icon}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={clsx('rounded-full px-2 py-0.5 text-xs font-bold', s.badge)}>{flag.severity.toUpperCase()}</span>
                              <span className={clsx('text-xs font-semibold', isDark ? 'text-gray-300' : 'text-gray-700')}>{flag.category}</span>
                            </div>
                            <p className={clsx('text-xs mt-0.5 font-mono truncate', isDark ? 'text-gray-400' : 'text-gray-600')}>"{flag.phrase}"</p>
                          </div>
                          {expanded === i ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                        </button>
                        {expanded === i && (
                          <div className={clsx('px-4 pb-4 space-y-2 border-t', isDark ? 'border-gray-700' : 'border-gray-200')}>
                            <div className="pt-3">
                              <p className={clsx('text-xs font-semibold mb-1', isDark ? 'text-gray-300' : 'text-gray-700')}>⚠️ Why it's risky</p>
                              <p className={clsx('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>{flag.explanation}</p>
                            </div>
                            <div className={clsx('rounded-lg p-3', isDark ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200')}>
                              <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1"><Lightbulb className="h-3.5 w-3.5" /> Suggestion</p>
                              <p className={clsx('text-xs', isDark ? 'text-green-300' : 'text-green-700')}>{flag.suggestion}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setResult(null)} className="btn-secondary flex-1">Analyze Another</button>
                <button onClick={onClose} className="btn-primary flex-1">Done</button>
              </div>
              <p className={clsx('text-xs text-center', isDark ? 'text-gray-600' : 'text-gray-400')}>
                ⚠️ AI analysis only — consult a licensed attorney before signing any legal document.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
