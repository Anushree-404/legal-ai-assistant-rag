/**
 * Persists bookmarked messages to localStorage independently of chat sessions.
 * Bookmarks survive page refresh, session switches, and chat clears.
 */
import { useState, useCallback, useEffect } from 'react'
import type { Message } from '../types'

const STORAGE_KEY = 'legal_ai_bookmarks'

function load(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const items: Message[] = JSON.parse(raw)
    // Rehydrate Date objects
    return items.map((m) => ({ ...m, timestamp: new Date(m.timestamp), bookmarked: true }))
  } catch {
    return []
  }
}

function save(bookmarks: Message[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Message[]>(load)

  // Persist every time bookmarks change
  useEffect(() => {
    save(bookmarks)
  }, [bookmarks])

  /** Returns true if a message id is bookmarked */
  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  )

  /** Add or remove a bookmark */
  const toggleBookmark = useCallback((message: Message) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === message.id)
      if (exists) {
        return prev.filter((b) => b.id !== message.id)
      } else {
        return [...prev, { ...message, bookmarked: true, isLoading: false }]
      }
    })
  }, [])

  /** Remove a bookmark by id */
  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  /** Clear all bookmarks */
  const clearBookmarks = useCallback(() => {
    setBookmarks([])
  }, [])

  return {
    bookmarks,
    bookmarkCount: bookmarks.length,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    clearBookmarks,
  }
}
