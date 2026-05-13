import { useEffect, useState } from 'react'
import {
  X, FileText, Gavel, ScrollText, FileCheck, BookMarked, File,
  Copy, Check, ExternalLink, Loader2, AlertCircle, Tag, MapPin, Hash,
} from 'lucide-react'
import { clsx } from 'clsx'

interface DocumentDetail {
  document_id: string
  title: string
  citation: string
  document_type: string
  domain: string
  jurisdiction: string
  url: string
  chunk_count: number
  content: string
}

const DOC_TYPE_ICON: Record<string, React.ReactNode> = {
  statute:     <ScrollText className="h-4 w-4" />,
  case_law:    <Gavel className="h-4 w-4" />,
  regulation:  <FileCheck className="h-4 w-4" />,
  contract:    <FileText className="h-4 w-4" />,
  legal_brief: <BookMarked className="h-4 w-4" />,
}

const DOC_TYPE_LABEL: Record<string, string> = {
  statute: 'Statute', case_law: 'Case Law', regulation: 'Regulation',
  contract: 'Contract', legal_brief: 'Legal Brief', article: 'Article', other: 'Document',
}

const DOMAIN_COLORS: Record<string, string> = {
  constitutional: 'bg-purple-100 text-purple-700 border-purple-200',
  criminal:       'bg-red-100 text-red-700 border-red-200',
  civil:          'bg-blue-100 text-blue-700 border-blue-200',
  contract:       'bg-green-100 text-green-700 border-green-200',
  tort:           'bg-orange-100 text-orange-700 border-orange-200',
  property:       'bg-yellow-100 text-yellow-700 border-yellow-200',
  family:         'bg-pink-100 text-pink-700 border-pink-200',
  employment:     'bg-teal-100 text-teal-700 border-teal-200',
  immigration:    'bg-indigo-100 text-indigo-700 border-indigo-200',
  intellectual_property: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  corporate:      'bg-slate-100 text-slate-700 border-slate-200',
  tax:            'bg-lime-100 text-lime-700 border-lime-200',
  general:        'bg-gray-100 text-gray-600 border-gray-200',
}

interface DocumentViewerProps {
  documentId: string
  onClose: () => void
}

export function DocumentViewer({ documentId, onClose }: DocumentViewerProps) {
  const [doc, setDoc]       = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/documents/${documentId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load document')
        return r.json()
      })
      .then(setDoc)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [documentId])

  const handleCopy = () => {
    if (!doc) return
    navigator.clipboard.writeText(doc.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Document Viewer"
    >
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl max-h-[90vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2 text-legal-700">
            {doc ? (DOC_TYPE_ICON[doc.document_type] ?? <File className="h-4 w-4" />) : <File className="h-4 w-4" />}
            <h2 className="text-base font-semibold text-gray-900 truncate max-w-md">
              {doc?.title ?? 'Loading…'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-1 items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin text-legal-500" />
              <p className="text-sm">Loading document…</p>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="flex flex-1 items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-red-500">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {doc && !loading && (
          <>
            {/* Metadata strip */}
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                {/* Domain badge */}
                <span className={clsx(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  DOMAIN_COLORS[doc.domain] ?? DOMAIN_COLORS.general
                )}>
                  <Tag className="h-3 w-3" />
                  {doc.domain.replace('_', ' ')}
                </span>

                {/* Doc type */}
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-600">
                  {DOC_TYPE_ICON[doc.document_type] ?? <File className="h-3 w-3" />}
                  {DOC_TYPE_LABEL[doc.document_type] ?? 'Document'}
                </span>

                {/* Jurisdiction */}
                {doc.jurisdiction && doc.jurisdiction !== 'general' && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" />
                    {doc.jurisdiction}
                  </span>
                )}

                {/* Chunks */}
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-500">
                  <Hash className="h-3 w-3" />
                  {doc.chunk_count} chunk{doc.chunk_count !== 1 ? 's' : ''}
                </span>

                {/* External URL */}
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-legal-200 bg-legal-50 px-2.5 py-0.5 text-xs text-legal-600 hover:bg-legal-100 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Source
                  </a>
                )}
              </div>

              {/* Citation */}
              {doc.citation && (
                <p className="mt-2 font-mono text-xs text-legal-700 bg-legal-50 border border-legal-100 rounded-md px-3 py-1.5 inline-block">
                  {doc.citation}
                </p>
              )}
            </div>

            {/* Full text */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Document Content
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  {copied
                    ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</>
                    : <><Copy className="h-3.5 w-3.5" /> Copy text</>}
                </button>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                  {doc.content}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-3 shrink-0 flex justify-end">
              <button onClick={onClose} className="btn-secondary text-sm">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
