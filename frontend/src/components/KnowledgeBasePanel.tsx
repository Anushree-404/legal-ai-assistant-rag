import { useState, useEffect, useCallback } from 'react'
import {
  Database, ChevronDown, ChevronUp, Trash2, RefreshCw,
  FileText, Gavel, ScrollText, FileCheck, BookMarked, File,
  Loader2, AlertCircle, Eye,
} from 'lucide-react'
import { clsx } from 'clsx'
import { DocumentViewer } from './DocumentViewer'

interface DocMeta {
  document_id: string
  title: string
  citation?: string
  document_type: string
  domain: string
  jurisdiction?: string
}

const DOC_TYPE_ICON: Record<string, React.ReactNode> = {
  statute:     <ScrollText className="h-3.5 w-3.5" />,
  case_law:    <Gavel className="h-3.5 w-3.5" />,
  regulation:  <FileCheck className="h-3.5 w-3.5" />,
  contract:    <FileText className="h-3.5 w-3.5" />,
  legal_brief: <BookMarked className="h-3.5 w-3.5" />,
}

const DOMAIN_COLORS: Record<string, string> = {
  constitutional:       'bg-purple-100 text-purple-700',
  criminal:             'bg-red-100 text-red-700',
  civil:                'bg-blue-100 text-blue-700',
  contract:             'bg-green-100 text-green-700',
  tort:                 'bg-orange-100 text-orange-700',
  property:             'bg-yellow-100 text-yellow-700',
  family:               'bg-pink-100 text-pink-700',
  employment:           'bg-teal-100 text-teal-700',
  immigration:          'bg-indigo-100 text-indigo-700',
  intellectual_property:'bg-cyan-100 text-cyan-700',
  corporate:            'bg-slate-100 text-slate-700',
  tax:                  'bg-lime-100 text-lime-700',
  general:              'bg-gray-100 text-gray-600',
}

export function KnowledgeBasePanel({ refreshTrigger }: { refreshTrigger: number }) {
  const [open, setOpen]           = useState(true)
  const [docs, setDocs]           = useState<DocMeta[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/documents')
      if (!res.ok) throw new Error('Failed to load documents')
      const data = await res.json()
      setDocs(data.documents ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading documents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs, refreshTrigger])

  const handleDelete = async (e: React.MouseEvent, docId: string, title: string) => {
    e.stopPropagation()
    if (!confirm(`Remove "${title}" from the knowledge base?`)) return
    setDeleting(docId)
    try {
      const res = await fetch(`/documents/${docId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setDocs((prev) => prev.filter((d) => d.document_id !== docId))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <section>
        {/* Header */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
          aria-expanded={open}
        >
          <span className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            Knowledge Base
            <span className="ml-1 rounded-full bg-legal-100 px-1.5 py-0.5 text-legal-700 font-bold text-xs">
              {docs.length}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); fetchDocs() }}
              className="rounded p-0.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              title="Refresh"
              aria-label="Refresh knowledge base"
            >
              <RefreshCw className={clsx('h-3 w-3', loading && 'animate-spin')} />
            </button>
            {open
              ? <ChevronUp className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        </button>

        {open && (
          <div className="mt-2">
            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading documents…
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && docs.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center">
                <Database className="mx-auto h-6 w-6 text-gray-300 mb-1" />
                <p className="text-xs text-gray-400">No documents yet.</p>
                <p className="text-xs text-gray-400">Click "Add Document" to get started.</p>
              </div>
            )}

            {/* Document list */}
            {!loading && docs.length > 0 && (
              <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
                {docs.map((doc) => (
                  <li key={doc.document_id}>
                    {/* Clickable card — opens viewer */}
                    <button
                      onClick={() => setViewingId(doc.document_id)}
                      className="group w-full flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-left hover:border-legal-300 hover:bg-legal-50 hover:shadow-sm transition-all cursor-pointer"
                      title={`Open: ${doc.title}`}
                    >
                      {/* Doc type icon */}
                      <span className="mt-0.5 shrink-0 text-gray-400 group-hover:text-legal-600 transition-colors">
                        {DOC_TYPE_ICON[doc.document_type] ?? <File className="h-3.5 w-3.5" />}
                      </span>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 leading-tight truncate group-hover:text-legal-800" title={doc.title}>
                          {doc.title}
                        </p>
                        {doc.citation && (
                          <p className="text-xs font-mono text-legal-600 truncate mt-0.5" title={doc.citation}>
                            {doc.citation}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className={clsx(
                            'inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium',
                            DOMAIN_COLORS[doc.domain] ?? DOMAIN_COLORS.general
                          )}>
                            {doc.domain.replace('_', ' ')}
                          </span>
                          {doc.jurisdiction && doc.jurisdiction !== 'general' && (
                            <span className="text-xs text-gray-400">{doc.jurisdiction}</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons — visible on hover */}
                      <div className="shrink-0 flex flex-col gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* View */}
                        <span
                          className="rounded p-1 text-legal-400 hover:bg-legal-100 hover:text-legal-700 transition-colors"
                          title="View document"
                          aria-label={`View ${doc.title}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </span>

                        {/* Delete */}
                        <span
                          onClick={(e) => handleDelete(e, doc.document_id, doc.title)}
                          className="rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete document"
                          aria-label={`Delete ${doc.title}`}
                          role="button"
                        >
                          {deleting === doc.document_id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Hint */}
            {!loading && docs.length > 0 && (
              <p className="mt-1.5 text-center text-xs text-gray-400">
                Click any document to view its full content
              </p>
            )}
          </div>
        )}
      </section>

      {/* Document viewer modal */}
      {viewingId && (
        <DocumentViewer
          documentId={viewingId}
          onClose={() => setViewingId(null)}
        />
      )}
    </>
  )
}
