import { useState, useEffect } from 'react'
import { X, GitCompare, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

interface DocDetail {
  document_id: string
  title: string
  citation: string
  document_type: string
  domain: string
  jurisdiction: string
  content: string
}

interface DocMeta {
  document_id: string
  title: string
  citation?: string
  domain: string
  document_type: string
}

const DOMAIN_COLORS: Record<string, string> = {
  constitutional: 'bg-purple-100 text-purple-700',
  criminal: 'bg-red-100 text-red-700',
  civil: 'bg-blue-100 text-blue-700',
  contract: 'bg-green-100 text-green-700',
  tort: 'bg-orange-100 text-orange-700',
  employment: 'bg-teal-100 text-teal-700',
  general: 'bg-gray-100 text-gray-600',
}

function DocPane({ docId, label }: { docId: string | null; label: string }) {
  const [doc, setDoc]       = useState<DocDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!docId) { setDoc(null); return }
    setLoading(true); setError(null)
    fetch(`/documents/${docId}`)
      .then((r) => { if (!r.ok) throw new Error('Failed'); return r.json() })
      .then(setDoc)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [docId])

  return (
    <div className="flex flex-col flex-1 min-w-0 border-r last:border-r-0 border-gray-100">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 shrink-0">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {!docId && (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
            <GitCompare className="h-10 w-10" />
            <p className="text-sm">Select a document</p>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-legal-500" />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />{error}
          </div>
        )}
        {doc && !loading && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{doc.title}</h3>
              {doc.citation && (
                <p className="text-xs font-mono text-legal-600 mt-0.5">{doc.citation}</p>
              )}
              <div className="flex gap-2 mt-1.5">
                <span className={clsx(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  DOMAIN_COLORS[doc.domain] ?? DOMAIN_COLORS.general
                )}>
                  {doc.domain.replace('_', ' ')}
                </span>
                {doc.jurisdiction && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {doc.jurisdiction}
                  </span>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <pre className="whitespace-pre-wrap text-xs text-gray-700 leading-relaxed font-sans">
                {doc.content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface Props {
  onClose: () => void
}

export function DocumentComparison({ onClose }: Props) {
  const [docs, setDocs]     = useState<DocMeta[]>([])
  const [leftId, setLeftId] = useState<string | null>(null)
  const [rightId, setRightId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/documents')
      .then((r) => r.json())
      .then((d) => setDocs(d.documents ?? []))
      .catch(() => {})
  }, [])

  const swap = () => { const tmp = leftId; setLeftId(rightId); setRightId(tmp) }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-legal-600" />
            <h2 className="text-base font-bold text-gray-900">Document Comparison</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-4 border-b px-6 py-3 shrink-0 bg-gray-50">
          {[
            { id: leftId, setId: setLeftId, label: 'Document A' },
            { id: rightId, setId: setRightId, label: 'Document B' },
          ].map(({ id, setId, label }) => (
            <div key={label}>
              <label className="label mb-1">{label}</label>
              <select
                value={id ?? ''}
                onChange={(e) => setId(e.target.value || null)}
                className="input text-sm"
              >
                <option value="">— Select document —</option>
                {docs.map((d) => (
                  <option key={d.document_id} value={d.document_id}>
                    {d.title}{d.citation ? ` (${d.citation})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Swap button */}
        {(leftId || rightId) && (
          <div className="flex justify-center py-2 border-b bg-gray-50 shrink-0">
            <button
              onClick={swap}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Swap
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Side-by-side panes */}
        <div className="flex flex-1 overflow-hidden">
          <DocPane docId={leftId} label="Document A" />
          <DocPane docId={rightId} label="Document B" />
        </div>
      </div>
    </div>
  )
}
