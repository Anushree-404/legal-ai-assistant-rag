import { useState, useEffect, useRef } from 'react'

/**
 * Streams text character by character for a typewriter effect.
 * Returns the currently displayed text and whether it's still typing.
 */
export function useTypewriter(fullText: string, speed = 8, enabled = true) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone]       = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled || !fullText) {
      setDisplayed(fullText)
      setIsDone(true)
      return
    }

    // Reset when text changes
    indexRef.current = 0
    setDisplayed('')
    setIsDone(false)

    const tick = () => {
      if (indexRef.current < fullText.length) {
        // Advance by a few chars per tick for speed
        const step = Math.max(1, Math.floor(speed / 2))
        indexRef.current = Math.min(indexRef.current + step, fullText.length)
        setDisplayed(fullText.slice(0, indexRef.current))
        timerRef.current = setTimeout(tick, speed)
      } else {
        setIsDone(true)
      }
    }

    timerRef.current = setTimeout(tick, speed)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [fullText, speed, enabled])

  const skip = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setDisplayed(fullText)
    setIsDone(true)
    indexRef.current = fullText.length
  }

  return { displayed, isDone, skip }
}
