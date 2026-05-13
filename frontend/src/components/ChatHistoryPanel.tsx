import { useState } from 'react'
import { History, ChevronDown, ChevronUp, Trash2, MessageSquare, Plus, Clock } from 'lucide-react'
import type { ChatSession } from '../types'
import { clsx } from 'clsx'

interface Props {
  sessions: ChatSession[]
  activeSessionId: string | null
  onLoad: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
  onClearAll: () => void
}

export function ChatHistoryPanel({ sessions, activeSessionId, onLoad, onDelete, onNew, onClearAll }: Props) {
  const [open, setOpen] = useState(true)

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHrs = Math.floor(diffMins / 60)
    if (diffHrs < 24) return `${diffHrs}h ago`
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
  }

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5" />
          Chat History
          {sessions.length > 0 && (
            <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-gray-600 font-bold text-xs">
              {sessions.length}
            </span>
          )}
        </span>
        <span className="flex items-center gap-1">
          {sessions.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); if (confirm('Clear all chat history?')) onClearAll() }}
              className="rounded p-0.5 hover:bg-gray-200 text-gray-400 hover:text-red-500 text-xs"
              title="Clear all history"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          {/* New chat button */}
          <button
            onClick={onNew}
            className={clsx(
              'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors',
              !activeSessionId
                ? 'bg-legal-100 text-legal-800 font-semibold'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            New conversation
          </button>

          {sessions.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-400 italic">No saved conversations yet</p>
          )}

          {/* Session list */}
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={clsx(
                  'group flex items-start gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors',
                  activeSessionId === s.id
                    ? 'bg-legal-100 border border-legal-200'
                    : 'hover:bg-gray-100'
                )}
                onClick={() => onLoad(s.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onLoad(s.id)}
              >
                <MessageSquare className={clsx(
                  'h-3.5 w-3.5 mt-0.5 shrink-0',
                  activeSessionId === s.id ? 'text-legal-600' : 'text-gray-400'
                )} />
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    'text-xs truncate leading-tight',
                    activeSessionId === s.id ? 'font-semibold text-legal-800' : 'text-gray-700'
                  )}>
                    {s.title}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDate(s.updatedAt)}
                    <span className="ml-1">· {s.messages.filter(m => m.role === 'user').length} msgs</span>
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
                  className="shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  aria-label="Delete session"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
