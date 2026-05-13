import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, XCircle, Loader2, X } from 'lucide-react'
import { useDocuments } from '../hooks/useDocuments'
import type { LegalDomain, DocumentType } from '../types'
import { clsx } from 'clsx'

const DOMAINS: { value: LegalDomain; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'constitutional', label: 'Constitutional' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'civil', label: 'Civil' },
  { value: 'contract', label: 'Contract' },
  { value: 'tort', label: 'Tort' },
  { value: 'property', label: 'Property' },
  { value: 'family', label: 'Family' },
  { value: 'employment', label: 'Employment' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'intellectual_property', label: 'Intellectual Property' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'tax', label: 'Tax' },
]

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'statute', label: 'Statute' },
  { value: 'case_law', label: 'Case Law' },
  { value: 'regulation', label: 'Regulation' },
  { value: 'contract', label: 'Contract' },
  { value: 'legal_brief', label: 'Legal Brief' },
  { value: 'article', label: 'Article' },
  { value: 'other', label: 'Other' },
]

interface DocumentUploadProps {
  onClose: () => void
  onSuccess?: () => void
}

export function DocumentUpload({ onClose, onSuccess }: DocumentUploadProps) {
  const { isUploading, uploadResult, uploadError, uploadFile, ingestText, reset } = useDocuments()
  const fileRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<'file' | 'text'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [citation, setCitation] = useState('')
  const [domain, setDomain] = useState<LegalDomain>('general')
  const [docType, setDocType] = useState<DocumentType>('other')
  const [jurisdiction, setJurisdiction] = useState('')
  const [textContent, setTextContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      if (mode === 'file' && file) {
        await uploadFile(file, title, docType, domain, citation || undefined, jurisdiction || undefined)
      } else if (mode === 'text' && textContent.trim()) {
        await ingestText({
          title,
          citation: citation || undefined,
          document_type: docType,
          domain,
          jurisdiction: jurisdiction || undefined,
          content: textContent,
        })
      }
      onSuccess?.()
    } catch {
      // error handled by hook
    }
  }

  const handleReset = () => {
    reset()
    setFile(null)
    setTitle('')
    setCitation('')
    setTextContent('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Upload Legal Document">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Add to Knowledge Base</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {uploadResult ? (
            <div className="text-center py-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" aria-hidden="true" />
              <p className="font-semibold text-gray-800">{uploadResult.message}</p>
              <p className="text-sm text-gray-500 mt-1">
                {uploadResult.chunks_created} chunks indexed
              </p>
              <div className="mt-4 flex gap-3 justify-center">
                <button onClick={handleReset} className="btn-secondary">Add Another</button>
                <button onClick={onClose} className="btn-primary">Done</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mode toggle */}
              <div className="flex rounded-lg border border-gray-200 p-1 gap-1">
                {(['file', 'text'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={clsx(
                      'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
                      mode === m
                        ? 'bg-legal-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {m === 'file' ? 'Upload File' : 'Paste Text'}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="label" htmlFor="doc-title">Title *</label>
                <input
                  id="doc-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., California Civil Code § 1542"
                  className="input"
                  required
                />
              </div>

              {/* Citation */}
              <div>
                <label className="label" htmlFor="doc-citation">Citation</label>
                <input
                  id="doc-citation"
                  type="text"
                  value={citation}
                  onChange={(e) => setCitation(e.target.value)}
                  placeholder="e.g., Cal. Civ. Code § 1542"
                  className="input"
                />
              </div>

              {/* Domain & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="doc-domain">Domain</label>
                  <select
                    id="doc-domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value as LegalDomain)}
                    className="input"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="doc-type">Document Type</label>
                  <select
                    id="doc-type"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentType)}
                    className="input"
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Jurisdiction */}
              <div>
                <label className="label" htmlFor="doc-jurisdiction">Jurisdiction</label>
                <input
                  id="doc-jurisdiction"
                  type="text"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  placeholder="e.g., federal, California, New York"
                  className="input"
                />
              </div>

              {/* File or Text */}
              {mode === 'file' ? (
                <div>
                  <label className="label" htmlFor="doc-file">File (PDF, DOCX, TXT)</label>
                  <div
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 cursor-pointer hover:border-legal-400 hover:bg-legal-50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label="Click to select file"
                  >
                    {file ? (
                      <div className="flex items-center gap-2 text-legal-700">
                        <FileText className="h-5 w-5" aria-hidden="true" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" aria-hidden="true" />
                        <p className="text-sm text-gray-500">Click to select a file</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    id="doc-file"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              ) : (
                <div>
                  <label className="label" htmlFor="doc-text">Document Content *</label>
                  <textarea
                    id="doc-text"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Paste the full text of the legal document here…"
                    className="input min-h-[120px] resize-y"
                    required={mode === 'text'}
                  />
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {uploadError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !title.trim() || (mode === 'file' ? !file : !textContent.trim())}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Ingesting…
                    </>
                  ) : (
                    'Add to Knowledge Base'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
