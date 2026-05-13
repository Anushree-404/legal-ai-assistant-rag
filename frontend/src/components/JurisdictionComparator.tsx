import { useState } from 'react'
import { X, Globe, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'
import { useTheme } from '../context/ThemeContext'

interface JurisdictionEntry {
  jurisdiction: string
  summary: string
  key_differences: string[]
  notable_cases: string[]
}

interface CompareResult {
  topic: string
  entries: JurisdictionEntry[]
  overall_comparison: string
}

const PRESET_JURISDICTIONS = ['federal', 'California', 'New York', 'Texas', 'Florida', 'Illinois', 'Washington', 'Massachusetts']

interface Props { onClose: () => void }

export function JurisdictionComparator({ onClose }: Props) {
  const { isDark } = useTheme()
  const [topic, setTopic]                   = useState('')
  const [jurisdictions, setJurisdictions]   = useState(['federal', 'California', 'New York'])
  const [result, setResult]                 = useState<CompareResult | null>(null)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [expanded, setExpanded]             = useState<number | null>(0)
  const [customInput, setCustomInput]       = useState('')

  const addJurisdiction = (j: string) => {
    if (!j.trim() || jurisdictions.includes(j) || jurisdictions.length >= 5) return
    setJurisdictions((prev) => [...prev, j.trim()])
    setCustomInput('')
  }

  const removeJurisdiction = (j: string) => {
    if (jurisdictions.length <= 2) return
    setJurisdictions((prev) => prev.filter((x) => x !== j))
  }

  const compare = async () => {
    if (!topic.trim() || jurisdictions.length < 2) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/analyze/jurisdictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, jurisdictions }),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Comparison failed')
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={clsx('w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]', isDark ? 'bg-gray-900' : 'bg-white')}>
        <div className={clsx('flex items-center justify-between border-b px-6 py-4 shrink-0', isDark ? 'border-gray-700' : 'border-gray-200')}>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <h2 className={clsx('text-base font-bold', isDark ? 'text-white' : 'text-gray-900')}>Jurisdiction Comparator</h2>
          </div>
          <button onClick={onClose} className={clsx('rounded-lg p-1.5', isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100')}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            <div className="space-y-5">
              <div>
                <label className="label">Legal Topic *</label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., At-will employment, Comparative negligence, Non-compete agreements"
                  className="input" />
              </div>

              <div>
                <label className="label">Jurisdictions to Compare (2–5)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {jurisdictions.map((j, i) => (
                    <span key={j} className={clsx('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', COLORS[i % COLORS.length])}>
                      {j}
                      <button onClick={() => removeJurisdiction(j)} className="hover:opacity-70">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select value="" onChange={(e) => addJurisdiction(e.target.value)} className="input text-sm flex-1">
                    <option value="">+ Add preset jurisdiction</option>
                    {PRESET_JURISDICTIONS.filter((j) => !jurisdictions.includes(j)).map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addJurisdiction(customInput)}
                      placeholder="Custom…" className="input text-sm w-28" />
                    <button onClick={() => addJurisdiction(customInput)} className="btn-secondary px-2">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

              <button onClick={compare} disabled={loading || !topic.trim() || jurisdictions.length < 2}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Comparing…</> : <><Globe className="h-4 w-4" /> Compare Jurisdictions</>}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={clsx('rounded-xl p-4', isDark ? 'bg-gray-800' : 'bg-blue-50')}>
                <h3 className={clsx('font-bold text-sm mb-1', isDark ? 'text-white' : 'text-gray-900')}>{result.topic}</h3>
                <p className={clsx('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>{result.overall_comparison}</p>
              </div>

              <div className="space-y-2">
                {result.entries.map((entry, i) => (
                  <div key={entry.jurisdiction} className={clsx('rounded-xl border overflow-hidden', isDark ? 'border-gray-700' : 'border-gray-200')}>
                    <button onClick={() => setExpanded(expanded === i ? null : i)}
                      className={clsx('w-full flex items-center justify-between px-4 py-3', isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50')}>
                      <div className="flex items-center gap-2">
                        <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-bold', COLORS[i % COLORS.length])}>{entry.jurisdiction}</span>
                        <span className={clsx('text-xs truncate max-w-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>{entry.summary.slice(0, 80)}…</span>
                      </div>
                      {expanded === i ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                    </button>
                    {expanded === i && (
                      <div className={clsx('px-4 pb-4 space-y-3 border-t', isDark ? 'border-gray-700' : 'border-gray-100')}>
                        <p className={clsx('text-xs pt-3', isDark ? 'text-gray-300' : 'text-gray-700')}>{entry.summary}</p>
                        <div>
                          <p className={clsx('text-xs font-semibold mb-1', isDark ? 'text-gray-300' : 'text-gray-700')}>Key Differences</p>
                          <ul className="space-y-1">
                            {entry.key_differences.map((d, j) => (
                              <li key={j} className={clsx('text-xs flex gap-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                                <span className="text-legal-500 shrink-0">•</span>{d}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {entry.notable_cases.length > 0 && (
                          <div>
                            <p className={clsx('text-xs font-semibold mb-1', isDark ? 'text-gray-300' : 'text-gray-700')}>Notable Cases</p>
                            <div className="flex flex-wrap gap-1">
                              {entry.notable_cases.map((c, j) => (
                                <span key={j} className={clsx('rounded-full px-2 py-0.5 text-xs font-mono', isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')}>{c}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => setResult(null)} className="btn-secondary w-full">New Comparison</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
