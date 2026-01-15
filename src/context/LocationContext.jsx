import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// Default location: Martha's Vineyard center (between Vineyard Haven, Oak Bluffs, Edgartown)
const DEFAULT_LOCATION = {
  lat: 41.43,
  lng: -70.56,
}

const STORAGE_KEY = 'whats-good-here-location-permission'

const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null)
  const [radius, setRadius] = useState(5) // Default 5 miles
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [permissionState, setPermissionState] = useState('prompt') // 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [hasAskedBefore, setHasAskedBefore] = useState(false)

  // Check if we've asked before
  useEffect(() => {
    const asked = localStorage.getItem(STORAGE_KEY)
    if (asked) {
      setHasAskedBefore(true)
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
    localStorage.setItem(STORAGE_KEY, 'true')
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
        console.warn('Geolocation error:', err.message)
        setPermissionState('denied')
        setError('denied')
        setLocation(DEFAULT_LOCATION)
        setLoading(false)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    )
  }, [])

  // Check permission state on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState('unsupported')
      setLocation(DEFAULT_LOCATION)
      setLoading(false)
      return
    }

    // Check permission API if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state)

        // If already granted, get location automatically
        if (result.state === 'granted') {
          requestLocation()
        } else if (result.state === 'denied') {
          // Already denied, use default
          setLocation(DEFAULT_LOCATION)
          setLoading(false)
        } else {
          // Prompt state - wait for user action
          setLoading(false)
        }

        // Listen for permission changes
        result.onchange = () => {
          setPermissionState(result.state)
          if (result.state === 'granted') {
            requestLocation()
          }
        }
      }).catch(() => {
        // Permission API not supported, will prompt on request
        setLoading(false)
      })
    } else {
      // No permission API, just stop loading
      setLoading(false)
    }
  }, [requestLocation])

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
