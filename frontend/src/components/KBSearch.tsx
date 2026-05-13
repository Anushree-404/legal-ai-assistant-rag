import { useState, useEffect, useRef } from 'react'
import { Search, X, FileText, Gavel, ScrollText, File } from 'lucide-react'

interface DocMeta {
  document_id: string
  title: string
  citation?: string
  document_type: string
  domain: string
  jurisdiction?: string
}

const DOC_ICON: Record<string, React.ReactNode> = {
  statute:     <ScrollText className="h-3.5 w-3.5" />,
  case_law:    <Gavel className="h-3.5 w-3.5" />,
  contract:    <FileText className="h-3.5 w-3.5" />,
}

interface Props {
  onSelect: (docId: string) => void
  onClose: () => void
}

export function KBSearch({ onSelect, onClose }: Props) {
  const [query, setQuery]   = useState('')
  const [docs, setDocs]     = useState<DocMeta[]>([])
  const [filtered, setFiltered] = useState<DocMeta[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/documents')
      .then((r) => r.json())
      .then((d) => { setDocs(d.documents ?? []); setFiltered(d.documents ?? []) })
      .catch(() => {})
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const q = query.toLowerCase().trim()
    if (!q) { setFiltered(docs); return }
    setFiltered(docs.filter((d) =>
      d.title.toLowerCase().includes(q) ||
      (d.citation ?? '').toLowerCase().includes(q) ||
      d.domain.toLowerCase().includes(q) ||
      (d.jurisdiction ?? '').toLowerCase().includes(q)
    ))
  }, [query, docs])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge base by title, citation, domain…"
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              {query ? `No documents matching "${query}"` : 'No documents in knowledge base'}
            </div>
          ) : (
            <ul>
              {filtered.map((doc) => (
                <li key={doc.document_id}>
                  <button
                    onClick={() => { onSelect(doc.document_id); onClose() }}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-legal-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <span className="mt-0.5 text-gray-400 shrink-0">
                      {DOC_ICON[doc.document_type] ?? <File className="h-3.5 w-3.5" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{doc.title}</p>
                      {doc.citation && (
                        <p className="text-xs font-mono text-legal-600 truncate">{doc.citation}</p>
                      )}
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 capitalize">{doc.domain.replace('_', ' ')}</span>
                        {doc.jurisdiction && <span className="text-xs text-gray-400">· {doc.jurisdiction}</span>}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-gray-400">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</p>
          <p className="text-xs text-gray-400">↵ to open · Esc to close</p>
        </div>
      </div>
    </div>
  )
}
