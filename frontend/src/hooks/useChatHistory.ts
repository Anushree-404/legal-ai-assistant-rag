import { useState, useCallback, useEffect } from 'react'
import type { ChatSession, Message } from '../types'

const STORAGE_KEY = 'legal_ai_chat_history'
const MAX_SESSIONS = 50

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const sessions: ChatSession[] = JSON.parse(raw)
    // Rehydrate Date objects
    return sessions.map((s) => ({
      ...s,
      messages: s.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }))
  } catch {
    return []
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
}

function generateTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === 'user')
  if (!first) return 'New conversation'
  return first.content.slice(0, 50) + (first.content.length > 50 ? '…' : '')
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  useEffect(() => {
    saveSessions(sessions)
  }, [sessions])

  const saveSession = useCallback((messages: Message[], domain?: string | null) => {
    if (messages.length === 0) return
    const now = new Date().toISOString()

    setSessions((prev) => {
      if (activeSessionId) {
        // Update existing
        return prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages, title: generateTitle(messages), updatedAt: now }
            : s
        )
      } else {
        // Create new
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: generateTitle(messages),
          messages,
          createdAt: now,
          updatedAt: now,
          domain: domain as any,
        }
        setActiveSessionId(newSession.id)
        return [newSession, ...prev]
      }
    })
  }, [activeSessionId])

  const loadSession = useCallback((sessionId: string): Message[] => {
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return []
    setActiveSessionId(sessionId)
    return session.messages
  }, [sessions])

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (activeSessionId === sessionId) setActiveSessionId(null)
  }, [activeSessionId])

  const clearAllSessions = useCallback(() => {
    setSessions([])
    setActiveSessionId(null)
  }, [])

  const startNewSession = useCallback(() => {
    setActiveSessionId(null)
  }, [])

  return {
    sessions,
    activeSessionId,
    saveSession,
    loadSession,
    deleteSession,
    clearAllSessions,
    startNewSession,
  }
}
