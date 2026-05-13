import { useState } from 'react'
import { X, FileText, Loader2, Copy, Check, Download } from 'lucide-react'
import { clsx } from 'clsx'
import { useTheme } from '../context/ThemeContext'

interface BriefResult {
  title: string
  content: string
  word_count: number
}

const BRIEF_TYPES = [
  { value: 'memorandum', label: '📋 Legal Memorandum', desc: 'Internal research memo with analysis' },
  { value: 'motion', label: '⚖️ Court Motion', desc: 'Formal motion for court filing' },
  { value: 'demand_letter', label: '✉️ Demand Letter', desc: 'Professional demand to opposing party' },
]

const JURISDICTIONS = ['federal', 'California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina']

interface Props { onClose: () => void }

export function BriefGenerator({ onClose }: Props) {
  const { isDark } = useTheme()
  const [topic, setTopic]           = useState('')
  const [briefType, setBriefType]   = useState('memorandum')
  const [jurisdiction, setJurisdiction] = useState('federal')
  const [result, setResult]         = useState<BriefResult | null>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [copied, setCopied]         = useState(false)

  const generate = async () => {
    if (!topic.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/generate/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, brief_type: briefType, jurisdiction }),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={clsx('w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]', isDark ? 'bg-gray-900' : 'bg-white')}>
        {/* Header */}
        <div className={clsx('flex items-center justify-between border-b px-6 py-4 shrink-0', isDark ? 'border-gray-700' : 'border-gray-200')}>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-legal-600" />
            <h2 className={clsx('text-base font-bold', isDark ? 'text-white' : 'text-gray-900')}>Legal Brief Generator</h2>
            <span className="rounded-full bg-legal-100 px-2 py-0.5 text-xs font-medium text-legal-700">AI-powered</span>
          </div>
          <button onClick={onClose} className={clsx('rounded-lg p-1.5', isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100')}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            <div className="space-y-5">
              {/* Brief type */}
              <div>
                <label className="label">Document Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {BRIEF_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setBriefType(t.value)}
                      className={clsx(
                        'flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
                        briefType === t.value
                          ? 'border-legal-500 bg-legal-50 ring-2 ring-legal-200'
                          : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <span className="text-lg">{t.label.split(' ')[0]}</span>
                      <div>
                        <p className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>{t.label.slice(2)}</p>
                        <p className={clsx('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="label">Legal Topic / Issue *</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Fourth Amendment violation in digital search, Employment discrimination under Title VII"
                  className="input"
                />
              </div>

              {/* Jurisdiction */}
              <div>
                <label className="label">Jurisdiction</label>
                <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="input">
                  {JURISDICTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

              <button
                onClick={generate}
                disabled={loading || !topic.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating brief…</>
                  : <><FileText className="h-4 w-4" /> Generate Legal Brief</>}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Meta */}
              <div className={clsx('rounded-xl p-4', isDark ? 'bg-gray-800' : 'bg-legal-50')}>
                <h3 className={clsx('font-bold text-sm', isDark ? 'text-white' : 'text-gray-900')}>{result.title}</h3>
                <p className={clsx('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-500')}>{result.word_count} words · {jurisdiction} · {briefType.replace('_', ' ')}</p>
              </div>

              {/* Content */}
              <div className={clsx('rounded-xl border p-5 max-h-80 overflow-y-auto', isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50')}>
                <pre className={clsx('whitespace-pre-wrap text-xs leading-relaxed font-sans', isDark ? 'text-gray-300' : 'text-gray-700')}>
                  {result.content}
                </pre>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setResult(null)} className="btn-secondary text-sm">New Brief</button>
                <button onClick={handleCopy} className="btn-secondary text-sm flex items-center justify-center gap-1.5">
                  {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </button>
                <button onClick={handleDownload} className="btn-primary text-sm flex items-center justify-center gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
              <p className={clsx('text-xs text-center', isDark ? 'text-gray-600' : 'text-gray-400')}>
                ⚠️ AI-generated draft only — review and edit before use. Consult a licensed attorney.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
