import { useState, useCallback, useRef } from 'react'

interface VoiceInputResult {
  isListening: boolean
  isSupported: boolean
  transcript: string
  start: (onResult: (text: string) => void) => void
  stop: () => void
  error: string | null
}

export function useVoiceInput(): VoiceInputResult {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript]   = useState('')
  const [error, setError]             = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const start = useCallback((onResult: (text: string) => void) => {
    if (!isSupported) { setError('Voice input not supported in this browser.'); return }
    setError(null)
    setTranscript('')

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      const current = final || interim
      setTranscript(current)
      if (final) onResult(final.trim())
    }

    recognition.onerror = (event: any) => {
      setError(`Voice error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, isSupported, transcript, start, stop, error }
}
