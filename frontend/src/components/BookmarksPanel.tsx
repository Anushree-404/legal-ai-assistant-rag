import { X, Bookmark, BookmarkX, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { Message } from '../types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  bookmarks: Message[]
  onRemoveBookmark: (id: string) => void
  onClose: () => void
}

export function BookmarksPanel({ bookmarks, onRemoveBookmark, onClose }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (msg: Message) => {
    navigator.clipboard.writeText(msg.content)
    setCopiedId(msg.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-legal-600 fill-legal-600" />
            <h2 className="text-base font-bold text-gray-900">Bookmarked Responses</h2>
            <span className="rounded-full bg-legal-100 px-2 py-0.5 text-xs font-bold text-legal-700">
              {bookmarks.length}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Bookmark className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">No bookmarks yet</p>
              <p className="text-xs mt-1">Click the bookmark icon on any AI response to save it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((msg) => (
                <div key={msg.id} className="rounded-xl border border-legal-100 bg-legal-50 p-4">
                  {/* Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">
                      {msg.timestamp instanceof Date
                        ? msg.timestamp.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : ''}
                      {msg.domain && <span className="ml-2 capitalize text-legal-600">· {msg.domain.replace('_', ' ')}</span>}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(msg)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-700 transition-colors"
                        title="Copy response"
                      >
                        {copiedId === msg.id
                          ? <Check className="h-3.5 w-3.5 text-green-500" />
                          : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => onRemoveBookmark(msg.id)}
                        className="rounded-lg p-1.5 text-legal-500 hover:bg-white hover:text-red-500 transition-colors"
                        title="Remove bookmark"
                      >
                        <BookmarkX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content.slice(0, 600) + (msg.content.length > 600 ? '\n\n*…(truncated)*' : '')}
                    </ReactMarkdown>
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-legal-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Sources</p>
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((s, i) => (
                          <span key={i} className="rounded-full bg-white border border-legal-200 px-2 py-0.5 text-xs text-legal-700 font-mono">
                            {s.citation || s.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
