// Sound system for bite sounds

let crunchSound = null

// Initialize sounds on first user interaction
export function preloadSounds() {
  crunchSound = new Audio('/sounds/crunch.wav')
  crunchSound.preload = 'auto'
  crunchSound.volume = 0.5
}

// Check if sounds are muted
export function isSoundMuted() {
  try {
    return localStorage.getItem('soundMuted') === 'true'
  } catch {
    return false
  }
}

// Set mute state
export function setSoundMuted(muted) {
  try {
    localStorage.setItem('soundMuted', String(muted))
  } catch {
    // localStorage may be unavailable
  }
}

// Toggle mute state
export function toggleSoundMute() {
  const newState = !isSoundMuted()
  setSoundMuted(newState)
  return newState
}

// Play the bite sound
export function playBiteSound() {
  if (isSoundMuted()) return
  if (!crunchSound) return

  crunchSound.currentTime = 0
  crunchSound.play().catch(() => {})
}


