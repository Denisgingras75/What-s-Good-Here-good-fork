/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { capture } from '../lib/analytics'
import { logger } from '../utils/logger'

// Default location: Martha's Vineyard center (between Vineyard Haven, Oak Bluffs, Edgartown)
const DEFAULT_LOCATION = {
  lat: 41.43,
  lng: -70.56,
}

const STORAGE_KEY = 'whats-good-here-location-permission'
const RADIUS_STORAGE_KEY = 'wgh_radius'

const LocationContext = createContext(null)

// Get saved radius from localStorage, default to 5 miles
function getSavedRadius() {
  try {
    const saved = localStorage.getItem(RADIUS_STORAGE_KEY)
    console.log('[getSavedRadius] localStorage value:', saved, 'type:', typeof saved)
    if (saved) {
      const parsed = parseInt(saved, 10)
      console.log('[getSavedRadius] parsed:', parsed)
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
        console.log('[getSavedRadius] returning:', parsed)
        return parsed
      }
    }
  } catch (e) {
    console.log('[getSavedRadius] error:', e)
    // localStorage may be unavailable
  }
  console.log('[getSavedRadius] returning default: 5')
  return 5
}

export function LocationProvider({ children }) {
  // Start with default location immediately - don't block on geolocation
  const [location, setLocation] = useState(DEFAULT_LOCATION)
  const [radius, setRadiusState] = useState(() => {
    const saved = localStorage.getItem(RADIUS_STORAGE_KEY)
    console.log('[LocationProvider init] localStorage wgh_radius:', saved)
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
        console.log('[LocationProvider init] using saved radius:', parsed)
        return parsed
      }
    }
    console.log('[LocationProvider init] using default: 5')
    return 5
  })

  // Wrap setRadius to track filter changes and persist to localStorage
  const setRadius = useCallback((newRadius) => {
    setRadiusState(prevRadius => {
      if (newRadius !== prevRadius) {
        capture('filter_applied', {
          filter_type: 'radius',
          radius_miles: newRadius,
          previous_radius: prevRadius,
        })
        // Save to localStorage
        try {
          localStorage.setItem(RADIUS_STORAGE_KEY, String(newRadius))
        } catch {
          // localStorage may be unavailable
        }
      }
      return newRadius
    })
  }, [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [permissionState, setPermissionState] = useState('prompt') // 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [hasAskedBefore, setHasAskedBefore] = useState(false)

  // Check if we've asked before
  useEffect(() => {
    try {
      const asked = localStorage.getItem(STORAGE_KEY)
      if (asked) {
        setHasAskedBefore(true)
      }
    } catch {
      // localStorage may be unavailable in private browsing or restricted contexts
    }
  }, [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setPermissionState('unsupported')
      setLocation(DEFAULT_LOCATION)
      return
    }

    setLoading(true)
    setError(null)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // localStorage may be unavailable in private browsing or restricted contexts
    }
    setHasAskedBefore(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setPermissionState('granted')
        setLoading(false)
        setError(null)
      },
      (err) => {
        logger.warn('Geolocation error:', err.message)
        setPermissionState('denied')
        setError('denied')
        setLocation(DEFAULT_LOCATION)
        setLoading(false)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000, // 5 second timeout - don't make users wait
        maximumAge: 300000, // Cache for 5 minutes
      }
    )
  }, [])

  // Check permission state on mount (non-blocking - dishes load with default location immediately)
  // NOTE: For now, always use default MV location so app works off-island
  // To enable real geolocation, uncomment the auto-request logic below
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState('unsupported')
      return
    }

    let permissionStatus = null
    let handlePermissionChange = null

    // Check permission API if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        permissionStatus = result
        setPermissionState(result.state)

        // DISABLED: Auto-requesting location when off-island shows no dishes
        // if (result.state === 'granted') {
        //   requestLocation()
        // }

        // Listen for permission changes
        handlePermissionChange = () => {
          setPermissionState(result.state)
          // DISABLED: Auto-requesting location when off-island shows no dishes
          // if (result.state === 'granted') {
          //   requestLocation()
          // }
        }

        result.addEventListener('change', handlePermissionChange)
      }).catch(() => {
        // Permission API not supported, will prompt on request
      })
    }

    // Cleanup function to remove listener when component unmounts
    return () => {
      if (permissionStatus && handlePermissionChange) {
        permissionStatus.removeEventListener('change', handlePermissionChange)
      }
    }
    // No else needed - we already have default location and loading is false
  }, [])

  const useDefaultLocation = useCallback(() => {
    setLocation(DEFAULT_LOCATION)
    setError(null)
    setLoading(false)
  }, [])

  const isUsingDefault = location?.lat === DEFAULT_LOCATION.lat && location?.lng === DEFAULT_LOCATION.lng

  return (
    <LocationContext.Provider value={{
      location,
      radius,
      setRadius,
      loading,
      error,
      permissionState,
      hasAskedBefore,
      requestLocation,
      useDefaultLocation,
      isUsingDefault,
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocationContext() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider')
  }
  return context
}
