/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// Default location: Martha's Vineyard center (between Vineyard Haven, Oak Bluffs, Edgartown)
const DEFAULT_LOCATION = {
  lat: 41.43,
  lng: -70.56,
}

const STORAGE_KEY = 'whats-good-here-location-permission'

const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  // Start with default location immediately - don't block on geolocation
  const [location, setLocation] = useState(DEFAULT_LOCATION)
  const [radius, setRadius] = useState(5) // Default 5 miles
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
        console.warn('Geolocation error:', err.message)
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

    // Check permission API if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state)

        // DISABLED: Auto-requesting location when off-island shows no dishes
        // if (result.state === 'granted') {
        //   requestLocation()
        // }

        // Listen for permission changes - with proper cleanup
        const handlePermissionChange = () => {
          setPermissionState(result.state)
          // DISABLED: Auto-requesting location when off-island shows no dishes
          // if (result.state === 'granted') {
          //   requestLocation()
          // }
        }

        result.addEventListener('change', handlePermissionChange)

        // Cleanup function to remove listener when component unmounts
        return () => {
          result.removeEventListener('change', handlePermissionChange)
        }
      }).catch(() => {
        // Permission API not supported, will prompt on request
      })
    }
    // No else needed - we already have default location and loading is false
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
