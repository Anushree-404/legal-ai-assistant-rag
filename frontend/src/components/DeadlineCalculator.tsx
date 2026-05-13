import { useState } from 'react'
import { X, Clock, Loader2, AlertTriangle, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { clsx } from 'clsx'
import { useTheme } from '../context/ThemeContext'

interface DeadlineEntry {
  deadline_name: string
  deadline_date: string
  days_remaining: number
  urgency: 'urgent' | 'warning' | 'ok' | 'expired'
  description: string
  citation: string
}

interface DeadlineResult {
  event_type: string
  event_date: string
  jurisdiction: string
  deadlines: DeadlineEntry[]
  disclaimer: string
}

const EVENT_TYPES = [
  'personal injury / accident',
  'medical malpractice',
  'employment discrimination',
  'wrongful termination',
  'contract breach',
  'property damage',
  'defamation / libel',
  'civil rights violation (§ 1983)',
  'copyright infringement',
  'fraud',
]

const URGENCY_CONFIG = {
  expired: { icon: <XCircle className="h-5 w-5 text-red-500" />, bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', label: 'EXPIRED' },
  urgent:  { icon: <AlertTriangle className="h-5 w-5 text-orange-500" />, bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700', label: 'URGENT' },
  warning: { icon: <Clock className="h-5 w-5 text-yellow-500" />, bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', label: 'WARNING' },
  ok:      { icon: <CheckCircle className="h-5 w-5 text-green-500" />, bg: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', label: 'OK' },
}

const JURISDICTIONS = ['federal', 'California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio']

interface Props { onClose: () => void }

export function DeadlineCalculator({ onClose }: Props) {
  const { isDark } = useTheme()
  const [eventType, setEventType]     = useState('')
  const [eventDate, setEventDate]     = useState('')
  const [jurisdiction, setJurisdiction] = useState('federal')
  const [result, setResult]           = useState<DeadlineResult | null>(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const calculate = async () => {
    if (!eventType || !eventDate) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/calculate/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: eventType, event_date: eventDate, jurisdiction }),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={clsx('w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]', isDark ? 'bg-gray-900' : 'bg-white')}>
        <div className={clsx('flex items-center justify-between border-b px-6 py-4 shrink-0', isDark ? 'border-gray-700' : 'border-gray-200')}>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h2 className={clsx('text-base font-bold', isDark ? 'text-white' : 'text-gray-900')}>Legal Deadline Calculator</h2>
          </div>
          <button onClick={onClose} className={clsx('rounded-lg p-1.5', isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100')}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            <div className="space-y-4">
              <div className={clsx('rounded-xl p-4 border', isDark ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200')}>
                <p className="text-xs text-orange-700 font-medium">⚠️ Time-sensitive: Missing legal deadlines can permanently bar your claims. Always verify with an attorney.</p>
              </div>

              <div>
                <label className="label">Type of Legal Event *</label>
                <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="input">
                  <option value="">— Select event type —</option>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Date of Event *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="input pl-10" />
                </div>
              </div>

              <div>
                <label className="label">Jurisdiction</label>
                <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="input">
                  {JURISDICTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

              <button onClick={calculate} disabled={loading || !eventType || !eventDate}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Calculating…</> : <><Clock className="h-4 w-4" /> Calculate Deadlines</>}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={clsx('rounded-xl p-4', isDark ? 'bg-gray-800' : 'bg-gray-50')}>
                <p className={clsx('text-sm font-bold capitalize', isDark ? 'text-white' : 'text-gray-900')}>{result.event_type}</p>
                <p className={clsx('text-xs mt-0.5', isDark ? 'text-gray-400' : 'text-gray-500')}>
                  Event date: {new Date(result.event_date).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })} · {result.jurisdiction}
                </p>
              </div>

              <div className="space-y-2">
                {result.deadlines.map((d, i) => {
                  const cfg = URGENCY_CONFIG[d.urgency]
                  return (
                    <div key={i} className={clsx('rounded-xl border p-4', isDark ? 'border-gray-700 bg-gray-800' : cfg.bg)}>
                      <div className="flex items-start gap-3">
                        {cfg.icon}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={clsx('rounded-full px-2 py-0.5 text-xs font-bold', cfg.badge)}>{cfg.label}</span>
                            <span className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>{d.deadline_name}</span>
                          </div>
                          <p className={clsx('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>{d.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={clsx('text-xs font-mono font-bold', d.urgency === 'expired' ? 'text-red-600' : d.urgency === 'urgent' ? 'text-orange-600' : isDark ? 'text-gray-300' : 'text-gray-700')}>
                              {d.urgency === 'expired' ? `Expired ${Math.abs(d.days_remaining)} days ago` : `${d.days_remaining} days remaining`}
                            </span>
                            <span className={clsx('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>
                              Due: {new Date(d.deadline_date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {d.citation && (
                            <p className={clsx('text-xs font-mono mt-1', isDark ? 'text-legal-400' : 'text-legal-600')}>{d.citation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={clsx('rounded-xl p-3 border', isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200')}>
                <p className="text-xs text-red-700">{result.disclaimer}</p>
              </div>

              <button onClick={() => setResult(null)} className="btn-secondary w-full">Calculate Another</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
