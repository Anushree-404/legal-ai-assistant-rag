import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Scale, User, Loader2, Bookmark, Copy, Check, SkipForward } from 'lucide-react'
import { SourceCitations } from './SourceCitations'
import type { Message } from '../types'
import { clsx } from 'clsx'
import { useState } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'

interface MessageBubbleProps {
  message: Message
  onToggleBookmark?: (message: Message) => void
  isBookmarked?: boolean
  isLatest?: boolean
  isDark?: boolean
}

export function MessageBubble({
  message, onToggleBookmark, isBookmarked = false, isLatest = false, isDark = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  // Typewriter only for the latest assistant message
  const { displayed, isDone, skip } = useTypewriter(
    isUser ? message.content : message.content,
    isLatest && !isUser ? 6 : 0,
    isLatest && !isUser
  )

  const shownContent = (isLatest && !isUser) ? displayed : message.content

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={clsx('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm',
          isUser ? 'bg-legal-600' : isDark ? 'bg-legal-700' : 'bg-legal-800'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div className={clsx('max-w-[85%] flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        <div
          className={clsx(
            'rounded-2xl px-4 py-3 text-sm shadow-sm',
            isUser
              ? 'bg-legal-600 text-white rounded-tr-sm'
              : isDark
                ? 'bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-sm'
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
          )}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-3 py-1">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-legal-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">Researching legal sources…</span>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <>
              <div className={clsx(
                'prose prose-sm max-w-none',
                isDark
                  ? 'prose-invert prose-headings:text-gray-100 prose-a:text-legal-400 prose-code:bg-gray-700 prose-code:text-legal-300'
                  : 'prose-headings:text-gray-800 prose-headings:font-semibold prose-a:text-legal-600 prose-code:text-legal-700 prose-code:bg-legal-50 prose-code:px-1 prose-code:rounded prose-blockquote:border-legal-300 prose-blockquote:text-gray-600'
              )}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{shownContent}</ReactMarkdown>
              </div>

              {/* Typing cursor */}
              {isLatest && !isDone && (
                <span className="inline-block h-4 w-0.5 bg-legal-500 animate-pulse ml-0.5 align-middle" />
              )}

              {/* Sources — only show when done typing */}
              {isDone && message.sources && message.sources.length > 0 && (
                <SourceCitations sources={message.sources} isDark={isDark} />
              )}

              {isDone && message.domain && (
                <p className={clsx('mt-2 text-xs capitalize', isDark ? 'text-gray-500' : 'text-gray-400')}>
                  Domain: {message.domain.replace('_', ' ')}
                </p>
              )}
            </>
          )}

          <p className={clsx('mt-1 text-right text-xs', isUser ? 'text-legal-200' : isDark ? 'text-gray-600' : 'text-gray-400')}>
            {message.timestamp instanceof Date
              ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </p>
        </div>

        {/* Action row — hover to reveal */}
        {!isUser && !message.isLoading && isDone && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            <button
              onClick={handleCopy}
              className={clsx(
                'rounded-md p-1.5 transition-colors text-xs flex items-center gap-1',
                isDark ? 'text-gray-500 hover:bg-gray-800 hover:text-gray-300' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
              )}
              title="Copy response"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(message)}
                className={clsx(
                  'rounded-md p-1.5 transition-colors',
                  isBookmarked
                    ? 'text-legal-600 hover:text-red-500'
                    : isDark ? 'text-gray-500 hover:bg-gray-800 hover:text-legal-400' : 'text-gray-400 hover:bg-gray-100 hover:text-legal-600'
                )}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                <Bookmark className={clsx('h-3.5 w-3.5', isBookmarked && 'fill-legal-600')} />
              </button>
            )}
          </div>
        )}

        {/* Skip typewriter */}
        {isLatest && !isUser && !isDone && (
          <button
            onClick={skip}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-1 transition-colors"
          >
            <SkipForward className="h-3 w-3" /> Skip animation
          </button>
        )}
      </div>
    </div>
  )
}
