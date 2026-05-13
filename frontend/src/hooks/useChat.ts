import { useState, useCallback, useRef } from 'react'
import { api } from '../services/api'
import type { Message, ChatMessage, LegalDomain } from '../types'

function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (query: string, domain?: LegalDomain | null, jurisdiction?: string | null) => {
      if (!query.trim() || isLoading) return
      setError(null)

      const userMsg: Message = {
        id: generateId(), role: 'user', content: query.trim(), timestamp: new Date(),
      }
      const loadingId = generateId()
      const loadingMsg: Message = {
        id: loadingId, role: 'assistant', content: '', timestamp: new Date(), isLoading: true,
      }

      setMessages((prev) => [...prev, userMsg, loadingMsg])
      setIsLoading(true)

      const history: ChatMessage[] = messages
        .filter((m) => !m.isLoading)
        .map((m) => ({ role: m.role, content: m.content }))

      try {
        abortRef.current = new AbortController()
        const response = await api.chat({
          query: query.trim(),
          conversation_history: history,
          domain: domain ?? null,
          jurisdiction: jurisdiction ?? null,
          include_sources: true,
        })

        const assistantMsg: Message = {
          id: loadingId, role: 'assistant',
          content: response.answer,
          sources: response.sources,
          domain: response.domain_detected,
          timestamp: new Date(),
          isLoading: false,
          bookmarked: false,
        }
        setMessages((prev) => prev.map((m) => (m.id === loadingId ? assistantMsg : m)))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setMessages((prev) => prev.filter((m) => m.id !== loadingId))
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [messages, isLoading]
  )

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const loadMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs)
    setError(null)
  }, [])

  const toggleBookmark = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => m.id === id ? { ...m, bookmarked: !m.bookmarked } : m)
    )
  }, [])

  return { messages, isLoading, error, sendMessage, clearChat, loadMessages, toggleBookmark }
}
