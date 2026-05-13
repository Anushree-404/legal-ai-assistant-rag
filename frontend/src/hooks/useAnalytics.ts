import { useCallback, useEffect, useState } from 'react'
import type { AnalyticsData, Message } from '../types'

const STORAGE_KEY = 'legal_ai_analytics'

interface RawEvent {
  timestamp: string
  domain: string | null
  sourceCount: number
  sources: { title: string; citation: string }[]
}

function loadEvents(): RawEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function saveEvents(events: RawEvent[]) {
  // Keep last 500 events
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-500)))
}

export function useAnalytics() {
  const [events, setEvents] = useState<RawEvent[]>(loadEvents)

  useEffect(() => { saveEvents(events) }, [events])

  const trackQuery = useCallback((messages: Message[]) => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant' && !m.isLoading)
    if (!lastAssistant) return
    const event: RawEvent = {
      timestamp: new Date().toISOString(),
      domain: lastAssistant.domain ?? null,
      sourceCount: lastAssistant.sources?.length ?? 0,
      sources: (lastAssistant.sources ?? []).map((s) => ({ title: s.title, citation: s.citation })),
    }
    setEvents((prev) => [...prev, event])
  }, [])

  const getAnalytics = useCallback((): AnalyticsData => {
    const domainBreakdown: Record<string, number> = {}
    const sourceCounts: Record<string, { title: string; citation: string; count: number }> = {}
    const dayMap: Record<string, number> = {}
    let totalSources = 0

    for (const e of events) {
      // Domain
      const d = e.domain ?? 'general'
      domainBreakdown[d] = (domainBreakdown[d] ?? 0) + 1

      // Sources
      totalSources += e.sourceCount
      for (const s of e.sources) {
        const key = s.citation || s.title
        if (!sourceCounts[key]) sourceCounts[key] = { ...s, count: 0 }
        sourceCounts[key].count++
      }

      // Per day
      const day = e.timestamp.slice(0, 10)
      dayMap[day] = (dayMap[day] ?? 0) + 1
    }

    const topSources = Object.values(sourceCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Last 7 days
    const queriesPerDay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const key = d.toISOString().slice(0, 10)
      return { date: key, count: dayMap[key] ?? 0 }
    })

    return {
      totalQueries: events.length,
      domainBreakdown,
      topSources,
      queriesPerDay,
      avgSourcesPerQuery: events.length ? Math.round((totalSources / events.length) * 10) / 10 : 0,
    }
  }, [events])

  const clearAnalytics = useCallback(() => setEvents([]), [])

  return { trackQuery, getAnalytics, totalQueries: events.length, clearAnalytics }
}
