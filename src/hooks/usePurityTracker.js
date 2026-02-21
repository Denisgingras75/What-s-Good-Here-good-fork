import { useRef, useCallback, useEffect } from 'react'

// Keys that don't count as "human typing" — editing/navigation only
const EDITING_KEYS = new Set([
  'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Home', 'End', 'PageUp', 'PageDown',
])

// Max flight times to keep for jitter calculation
const MAX_FLIGHT_TIMES = 100
// Max dwell times to keep
const MAX_DWELL_TIMES = 100
// Flight time bounds (ms) — filter out outliers
const MIN_FLIGHT_MS = 20
const MAX_FLIGHT_MS = 2000
// Dwell time bounds (ms) — filter out outliers
const MIN_DWELL_MS = 10
const MAX_DWELL_MS = 500
// Minimum human chars before we trust the score
const MIN_CHARS_FOR_SCORE = 20
// Max mutation length to tolerate (autocorrect/autocomplete)
const AUTOCORRECT_TOLERANCE = 15
// Number of fatigue windows to track
const FATIGUE_WINDOW_COUNT = 4

// Top 30 English bigrams for typing signature
const TRACKED_BIGRAMS = new Set([
  'th', 'he', 'in', 'er', 'an', 're', 'on', 'at', 'en', 'nd',
  'ti', 'es', 'or', 'te', 'of', 'ed', 'is', 'it', 'al', 'ar',
  'st', 'to', 'nt', 'ng', 'se', 'ha', 'as', 'ou', 'io', 'le',
])

function calcMean(arr) {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function calcStd(arr) {
  if (arr.length < 2) return 0
  const mean = calcMean(arr)
  const variance = arr.reduce((sum, t) => sum + (t - mean) ** 2, 0) / arr.length
  return Math.sqrt(variance)
}

export function usePurityTracker() {
  const dataRef = useRef({
    humanChars: 0,
    alienChars: 0,
    flightTimes: [],
    dwellTimes: [],
    bigramTimings: {},
    fatigueWindows: [],
    lastKeyTime: 0,
    lastKeyChar: '',
    keyDownTimes: {},
    totalKeystrokes: 0,
    sessionStartTime: Date.now(),
  })
  const observerRef = useRef(null)
  const textareaRef = useRef(null)
  const listenersRef = useRef(null)

  // Compute current purity snapshot
  const getPurity = useCallback(() => {
    const { humanChars, alienChars, flightTimes } = dataRef.current
    const total = humanChars + alienChars

    // Not enough signal — return null
    if (total < MIN_CHARS_FOR_SCORE) {
      return { purity: null, jitter: null, humanChars, alienChars }
    }

    const purity = Math.round((humanChars / total) * 100 * 100) / 100

    // Calculate jitter (stddev of flight times)
    let jitter = null
    if (flightTimes.length >= 5) {
      const mean = flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length
      const variance = flightTimes.reduce((sum, t) => sum + (t - mean) ** 2, 0) / flightTimes.length
      jitter = Math.round(Math.sqrt(variance) * 100) / 100
    }

    return { purity, jitter, humanChars, alienChars }
  }, [])

  // Compute jitter profile for server submission
  const getJitterProfile = useCallback(() => {
    const data = dataRef.current
    const { flightTimes, dwellTimes, bigramTimings, fatigueWindows, totalKeystrokes, sessionStartTime } = data

    // Need minimum signal
    if (flightTimes.length < 10) {
      return null
    }

    const meanInterKey = Math.round(calcMean(flightTimes) * 100) / 100
    const stdInterKey = Math.round(calcStd(flightTimes) * 100) / 100

    const meanDwell = dwellTimes.length > 0 ? Math.round(calcMean(dwellTimes) * 100) / 100 : null
    const stdDwell = dwellTimes.length > 1 ? Math.round(calcStd(dwellTimes) * 100) / 100 : null

    // Build bigram signatures — only include bigrams with 2+ samples
    const bigramSignatures = {}
    const bigramKeys = Object.keys(bigramTimings)
    for (let i = 0; i < bigramKeys.length; i++) {
      const bigram = bigramKeys[i]
      const timings = bigramTimings[bigram]
      if (timings.length >= 2) {
        bigramSignatures[bigram] = {
          mean: Math.round(calcMean(timings) * 100) / 100,
          std: Math.round(calcStd(timings) * 100) / 100,
          n: timings.length,
        }
      }
    }

    // Calculate fatigue drift (slope of fatigue windows)
    let fatigueDrift = null
    if (fatigueWindows.length >= 2) {
      // Simple linear slope: (last - first) / (n - 1)
      const first = fatigueWindows[0]
      const last = fatigueWindows[fatigueWindows.length - 1]
      fatigueDrift = Math.round(((last - first) / (fatigueWindows.length - 1)) * 100) / 100
    }

    // Hour of day from session start
    const hourOfDay = new Date(sessionStartTime).getHours()

    return {
      total_keystrokes: totalKeystrokes,
      mean_inter_key: meanInterKey,
      std_inter_key: stdInterKey,
      mean_dwell: meanDwell,
      std_dwell: stdDwell,
      bigram_signatures: bigramSignatures,
      fatigue_drift: fatigueDrift,
      hour_of_day: hourOfDay,
      sample_size: flightTimes.length,
    }
  }, [])

  const handleKeydown = useCallback((e) => {
    const now = performance.now()
    const data = dataRef.current

    // Skip modifier-only keys and editing keys
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (EDITING_KEYS.has(e.key)) return
    // Skip non-printable (single char = printable)
    if (e.key.length !== 1) return

    data.humanChars++
    data.totalKeystrokes++

    // Record dwell start time for this key
    data.keyDownTimes[e.key.toLowerCase()] = now

    const currentChar = e.key.toLowerCase()

    // Record flight time
    if (data.lastKeyTime > 0) {
      const flight = now - data.lastKeyTime
      if (flight >= MIN_FLIGHT_MS && flight <= MAX_FLIGHT_MS) {
        data.flightTimes.push(flight)
        if (data.flightTimes.length > MAX_FLIGHT_TIMES) {
          data.flightTimes.shift()
        }

        // Track bigram timing
        if (data.lastKeyChar) {
          const bigram = data.lastKeyChar + currentChar
          if (TRACKED_BIGRAMS.has(bigram)) {
            if (!data.bigramTimings[bigram]) {
              data.bigramTimings[bigram] = []
            }
            data.bigramTimings[bigram].push(flight)
          }
        }

        // Update fatigue windows — every 25 keystrokes, record average flight time
        if (data.totalKeystrokes > 0 && data.totalKeystrokes % 25 === 0) {
          // Average of the last 25 flight times (or all available if fewer)
          const recentFlights = data.flightTimes.slice(-25)
          const avgFlight = recentFlights.reduce((a, b) => a + b, 0) / recentFlights.length
          data.fatigueWindows.push(Math.round(avgFlight * 100) / 100)
          // Keep only FATIGUE_WINDOW_COUNT windows
          if (data.fatigueWindows.length > FATIGUE_WINDOW_COUNT) {
            data.fatigueWindows.shift()
          }
        }
      }
    }

    data.lastKeyTime = now
    data.lastKeyChar = currentChar
  }, [])

  const handleKeyup = useCallback((e) => {
    const now = performance.now()
    const data = dataRef.current

    // Skip modifier-only keys and editing keys
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (EDITING_KEYS.has(e.key)) return
    if (e.key.length !== 1) return

    const keyLower = e.key.toLowerCase()
    const downTime = data.keyDownTimes[keyLower]

    if (downTime) {
      const dwell = now - downTime
      if (dwell >= MIN_DWELL_MS && dwell <= MAX_DWELL_MS) {
        data.dwellTimes.push(dwell)
        if (data.dwellTimes.length > MAX_DWELL_TIMES) {
          data.dwellTimes.shift()
        }
      }
      delete data.keyDownTimes[keyLower]
    }
  }, [])

  const handlePaste = useCallback((e) => {
    const pasted = e.clipboardData?.getData('text') || ''
    if (pasted.length > 0) {
      dataRef.current.alienChars += pasted.length
    }
  }, [])

  // Ref callback to attach/detach listeners
  const attachToTextarea = useCallback((node) => {
    // Cleanup previous
    if (listenersRef.current) {
      const { el, keydown, keyup, paste } = listenersRef.current
      el.removeEventListener('keydown', keydown)
      el.removeEventListener('keyup', keyup)
      el.removeEventListener('paste', paste)
      listenersRef.current = null
    }
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (!node) {
      textareaRef.current = null
      return
    }

    textareaRef.current = node

    // Attach keyboard + paste listeners
    node.addEventListener('keydown', handleKeydown)
    node.addEventListener('keyup', handleKeyup)
    node.addEventListener('paste', handlePaste)
    listenersRef.current = { el: node, keydown: handleKeydown, keyup: handleKeyup, paste: handlePaste }

    // MutationObserver for non-keyboard insertions (voice input, drag-drop, etc.)
    // Skip small mutations (autocorrect tolerance)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          const addedLength = (mutation.target.textContent || '').length -
            (mutation.oldValue || '').length
          if (addedLength > AUTOCORRECT_TOLERANCE) {
            dataRef.current.alienChars += addedLength
          }
        }
      }
    })

    observer.observe(node, {
      characterData: true,
      characterDataOldValue: true,
      subtree: true,
    })
    observerRef.current = observer
  }, [handleKeydown, handleKeyup, handlePaste])

  // Reset tracking data (for when review text is cleared)
  const reset = useCallback(() => {
    dataRef.current = {
      humanChars: 0,
      alienChars: 0,
      flightTimes: [],
      dwellTimes: [],
      bigramTimings: {},
      fatigueWindows: [],
      lastKeyTime: 0,
      lastKeyChar: '',
      keyDownTimes: {},
      totalKeystrokes: 0,
      sessionStartTime: Date.now(),
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        const { el, keydown, keyup, paste } = listenersRef.current
        el.removeEventListener('keydown', keydown)
        el.removeEventListener('keyup', keyup)
        el.removeEventListener('paste', paste)
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return { getPurity, getJitterProfile, attachToTextarea, reset }
}
