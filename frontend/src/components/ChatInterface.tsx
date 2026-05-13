import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, Scale, Mic, MicOff } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { LegalDisclaimer } from './LegalDisclaimer'
import { SmartSuggestions } from './SmartSuggestions'
import { StatusBar } from './StatusBar'
import { useChat } from '../hooks/useChat'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import type { LegalDomain, Message } from '../types'
import { clsx } from 'clsx'

interface ChatInterfaceProps {
  selectedDomain: LegalDomain | null
  jurisdiction: string
  pendingQuestion: string | null
  onPendingQuestionConsumed: () => void
  clearSignal: number
  onMessageCountChange: (count: number) => void
  onMessagesChange?: (messages: Message[]) => void
  loadedMessages?: Message[] | null
  onToggleBookmark?: (message: Message) => void
  isBookmarked?: (id: string) => boolean
}

export function ChatInterface({
  selectedDomain, jurisdiction, pendingQuestion, onPendingQuestionConsumed,
  clearSignal, onMessageCountChange, onMessagesChange, loadedMessages,
  onToggleBookmark, isBookmarked,
}: ChatInterfaceProps) {
  const { messages, isLoading, error, sendMessage, clearChat, loadMessages } = useChat()
  const { isDark } = useTheme()
  const toast = useToast()
  const voice = useVoiceInput()

  const [input, setInput]           = useState('')
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [lastDomain, setLastDomain] = useState<string | null | undefined>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const startTimeRef = useRef<number | null>(null)

  // Clear signal
  useEffect(() => { if (clearSignal > 0) { clearChat(); setShowSuggestions(false) } }, [clearSignal]) // eslint-disable-line

  // Load messages from history
  useEffect(() => { if (loadedMessages) { loadMessages(loadedMessages); setShowSuggestions(false) } }, [loadedMessages]) // eslint-disable-line

  // Notify parent
  useEffect(() => {
    onMessageCountChange(messages.length)
    onMessagesChange?.(messages)
    // Show suggestions after assistant responds
    const last = messages[messages.length - 1]
    if (last && last.role === 'assistant' && !last.isLoading) {
      setLastDomain(last.domain)
      setTimeout(() => setShowSuggestions(true), 800)
      if (startTimeRef.current) {
        setResponseTime(Date.now() - startTimeRef.current)
        startTimeRef.current = null
      }
    }
  }, [messages]) // eslint-disable-line

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Pending question
  useEffect(() => {
    if (pendingQuestion) {
      setInput(pendingQuestion)
      onPendingQuestionConsumed()
      textareaRef.current?.focus()
    }
  }, [pendingQuestion]) // eslint-disable-line

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return
    setShowSuggestions(false)
    startTimeRef.current = Date.now()
    sendMessage(input, selectedDomain, jurisdiction || null)
    setInput('')
  }, [input, isLoading, sendMessage, selectedDomain, jurisdiction])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleVoice = () => {
    if (voice.isListening) {
      voice.stop()
    } else {
      voice.start((text) => {
        setInput(text)
        toast.info('Voice captured', text.slice(0, 60))
        textareaRef.current?.focus()
      })
    }
  }

  const handleSuggestion = (s: string) => {
    setInput(s)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const isEmpty = messages.length === 0

  return (
    <div className={clsx('flex flex-1 flex-col overflow-hidden', isDark ? 'bg-gray-950' : 'bg-gray-50')}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-16">
            <div className={clsx(
              'flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg',
              isDark ? 'bg-legal-900 text-legal-400' : 'bg-legal-100 text-legal-700'
            )}>
              <Scale className="h-10 w-10" />
            </div>
            <div>
              <h2 className={clsx('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-800')}>
                Legal Research Assistant
              </h2>
              <p className={clsx('mt-2 text-sm max-w-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                Ask about statutes, case law, legal concepts, or upload documents to analyze.
                Powered by RAG for accurate, cited responses.
              </p>
            </div>

            {/* Quick start chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {[
                'What are Miranda rights?',
                'Elements of negligence',
                'How does Title VII work?',
                'What is fair use in copyright?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus() }}
                  className={clsx(
                    'rounded-full border px-4 py-2 text-sm transition-all hover:scale-105',
                    isDark
                      ? 'border-gray-700 bg-gray-800 text-gray-300 hover:border-legal-500'
                      : 'border-legal-200 bg-white text-legal-700 hover:border-legal-400 shadow-sm'
                  )}
                >
                  {q}
                </button>
              ))}
            </div>

            <LegalDisclaimer />
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onToggleBookmark={onToggleBookmark}
              isBookmarked={isBookmarked?.(msg.id) ?? false}
              isLatest={idx === messages.length - 1}
              isDark={isDark}
            />
          ))
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Smart suggestions */}
      {showSuggestions && !isLoading && messages.length > 0 && (
        <SmartSuggestions domain={lastDomain} onSelect={handleSuggestion} isDark={isDark} />
      )}

      {/* Disclaimer */}
      {!isEmpty && (
        <div className="px-6 pb-2">
          <LegalDisclaimer />
        </div>
      )}

      {/* Input area */}
      <div className={clsx(
        'border-t px-6 py-4',
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      )}>
        <div className="flex items-end gap-3">
          {/* Voice input button */}
          {voice.isSupported && (
            <button
              onClick={handleVoice}
              title={voice.isListening ? 'Stop recording' : 'Voice input'}
              className={clsx(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all',
                voice.isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                  : isDark
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {voice.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          {/* Text input */}
          <div className={clsx(
            'flex-1 rounded-xl border transition-all',
            isDark
              ? 'bg-gray-800 border-gray-700 focus-within:border-legal-500 focus-within:ring-2 focus-within:ring-legal-900'
              : 'bg-gray-50 border-gray-300 focus-within:border-legal-500 focus-within:ring-2 focus-within:ring-legal-200'
          )}>
            <textarea
              ref={textareaRef}
              value={voice.isListening ? voice.transcript || input : input}
              onChange={(e) => !voice.isListening && setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={voice.isListening ? '🎤 Listening…' : 'Ask a legal question… (Shift+Enter for new line)'}
              rows={1}
              className={clsx(
                'w-full resize-none bg-transparent px-4 py-3 text-sm placeholder-gray-400 focus:outline-none max-h-40',
                isDark ? 'text-gray-100' : 'text-gray-800'
              )}
              style={{ minHeight: '44px' }}
              disabled={isLoading}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={clsx(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all',
              input.trim() && !isLoading
                ? 'bg-legal-600 text-white hover:bg-legal-700 shadow-md hover:shadow-legal-200 hover:scale-105 active:scale-95'
                : isDark ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <p className={clsx('mt-2 text-center text-xs', isDark ? 'text-gray-600' : 'text-gray-400')}>
          Enter to send · Shift+Enter for new line{voice.isSupported ? ' · Mic for voice' : ''}
        </p>
      </div>

      {/* Status bar */}
      <StatusBar responseTime={responseTime} isDark={isDark} />
    </div>
  )
}
