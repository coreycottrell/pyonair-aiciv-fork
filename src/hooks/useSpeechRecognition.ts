import { useState, useRef, useCallback } from 'react'

interface SpeechRecognitionHook {
  isListening: boolean
  isSupported: boolean
  transcript: string
  start: () => void
  stop: () => void
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Speech recognition hook — works on both desktop and mobile.
 *
 * Desktop: continuous=true, reads results array directly.
 * Mobile:  continuous=false (single phrase at a time), auto-restarts
 *          after each final result, accumulates phrases with spaces.
 */
export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const shouldRestartRef = useRef(false)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobile = useRef(isMobile())
  // For mobile: accumulated final phrases across restarts
  const phrasesRef = useRef('')
  // For desktop: saved text from previous sessions
  const savedRef = useRef('')
  const latestRef = useRef('')

  const isSupported = getSpeechRecognition() !== null

  const launch = useCallback(() => {
    const Ctor = getSpeechRecognition()
    if (!Ctor) return

    const rec = new Ctor()
    rec.interimResults = true
    rec.lang = 'en-US'

    if (mobile.current) {
      // MOBILE: single-shot mode — captures one phrase, then restarts
      rec.continuous = false

      rec.onresult = (event: SpeechRecognitionEvent) => {
        // On mobile with continuous=false, there's typically just one result
        const result = event.results[0]
        const text = result[0].transcript

        if (result.isFinal) {
          // Save this phrase and add a space
          const separator = phrasesRef.current ? ' ' : ''
          phrasesRef.current += separator + text
          setTranscript(phrasesRef.current)
        } else {
          // Show interim: accumulated phrases + current interim
          const separator = phrasesRef.current ? ' ' : ''
          setTranscript(phrasesRef.current + separator + text)
        }
      }
    } else {
      // DESKTOP: continuous mode — results array has everything
      rec.continuous = true

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let sessionText = ''
        for (let i = 0; i < event.results.length; i++) {
          sessionText += event.results[i][0].transcript
        }
        const full = savedRef.current + sessionText
        latestRef.current = full
        setTranscript(full)
      }
    }

    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
      shouldRestartRef.current = false
      setIsListening(false)
      recognitionRef.current = null
    }

    rec.onend = () => {
      if (!shouldRestartRef.current) {
        setIsListening(false)
        return
      }

      if (!mobile.current) {
        // Desktop: save current text for next session
        savedRef.current = latestRef.current
      }
      // Mobile: phrasesRef already has accumulated text

      // Restart
      restartTimerRef.current = setTimeout(() => {
        if (shouldRestartRef.current) launch()
      }, 300)
    }

    recognitionRef.current = rec
    try {
      rec.start()
      setIsListening(true)
    } catch {
      setIsListening(false)
    }
  }, [])

  const start = useCallback(() => {
    phrasesRef.current = ''
    savedRef.current = ''
    latestRef.current = ''
    shouldRestartRef.current = true
    setTranscript('')
    launch()
  }, [launch])

  const stop = useCallback(() => {
    shouldRestartRef.current = false
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch { /* */ }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  return { isListening, isSupported, transcript, start, stop }
}
