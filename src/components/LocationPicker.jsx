import { useState } from 'react'

const RADIUS_OPTIONS = [1, 5, 10, 20]

export function LocationPicker({
  radius,
  onRadiusChange,
  location,
  error,
  permissionState,
  isUsingDefault,
  onRequestLocation,
  onUseDefault,
  loading
}) {
  const [showRadiusSheet, setShowRadiusSheet] = useState(false)
  const [showLocationSheet, setShowLocationSheet] = useState(false)

  const handleRadiusSelect = (newRadius) => {
    onRadiusChange(newRadius)
    setShowRadiusSheet(false)
  }

  // Determine what to show in the location chip
  const getLocationChip = () => {
    if (loading) {
      return (
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border animate-pulse"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-divider)',
            color: 'var(--color-text-tertiary)'
          }}
        >
          <span>📍</span>
          <span>Finding location...</span>
        </div>
      )
    }

    // Permission denied or error state
    if (permissionState === 'denied' || error === 'denied') {
      return (
        <button
          onClick={() => setShowLocationSheet(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-colors hover:bg-orange-50"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 10%, white)',
            borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
            color: 'var(--color-primary)'
          }}
        >
          <span>📍</span>
          <span>Martha's Vineyard</span>
          <span className="text-xs opacity-70">(tap to update)</span>
        </button>
      )
    }

    // Using default location (never asked or chose default)
    if (isUsingDefault || !location) {
      return (
        <button
          onClick={() => setShowLocationSheet(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-colors hover:bg-gray-50"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-divider)',
            color: 'var(--color-text-primary)'
          }}
        >
          <span>📍</span>
          <span>Martha's Vineyard</span>
          <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )
    }

    // Has real location
    return (
      <button
        onClick={() => setShowLocationSheet(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-colors hover:bg-gray-50"
        style={{
          background: 'color-mix(in srgb, var(--color-success) 10%, white)',
          borderColor: 'color-mix(in srgb, var(--color-success) 30%, transparent)',
          color: 'var(--color-success)'
        }}
      >
        <span>📍</span>
        <span>Near you</span>
        <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </button>
    )
  }

  return (
    <>
      {/* Filter Chips Row */}
      <div className="bg-white border-b px-4 py-3" style={{ borderColor: 'var(--color-divider)' }}>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* Location Chip */}
          {getLocationChip()}

          {/* Radius Chip */}
          <button
            onClick={() => setShowRadiusSheet(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-all hover:border-neutral-300"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-divider)',
              color: 'var(--color-text-primary)'
            }}
          >
            <span>Within {radius} mi</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Location Bottom Sheet */}
      {showLocationSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLocationSheet(false)}
          />

          {/* Sheet Content */}
          <div
            className="relative w-full max-w-lg rounded-t-3xl animate-slide-up"
            style={{ background: 'var(--color-bg)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-divider)' }} />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Your location
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Find the best dishes near you
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Use My Location Button */}
              <button
                onClick={() => {
                  onRequestLocation()
                  setShowLocationSheet(false)
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:border-orange-300"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 5%, white)',
                  borderColor: 'var(--color-primary)'
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ background: 'var(--color-primary)' }}
                >
                  <span>📍</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Use my location
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Find dishes closest to you
                  </p>
                </div>
                <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Use Default Location */}
              <button
                onClick={() => {
                  onUseDefault()
                  setShowLocationSheet(false)
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:border-gray-300"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-divider)'
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ background: 'var(--color-divider)' }}
                >
                  <span>🏝️</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Martha's Vineyard center
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Browse all island dishes
                  </p>
                </div>
              </button>

              {/* Help text for denied state */}
              {permissionState === 'denied' && (
                <div
                  className="p-4 rounded-xl text-sm"
                  style={{ background: 'color-mix(in srgb, var(--color-warning) 10%, white)' }}
                >
                  <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Location access blocked?
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Go to your browser settings → Site Settings → Location, and allow access for this site. Then tap "Use my location" above.
                  </p>
                </div>
              )}
            </div>

            {/* Safe area padding */}
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* Radius Bottom Sheet */}
      {showRadiusSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRadiusSheet(false)}
          />

          {/* Sheet Content */}
          <div
            className="relative w-full max-w-lg rounded-t-3xl animate-slide-up"
            style={{ background: 'var(--color-bg)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-divider)' }} />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Search radius
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                How far should we look for dishes?
              </p>
            </div>

            {/* Radius Options */}
            <div className="p-4 space-y-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRadiusSelect(r)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    radius === r ? 'border-transparent' : 'border-transparent hover:border-neutral-200'
                  }`}
                  style={radius === r ? {
                    background: 'color-mix(in srgb, var(--color-primary) 10%, white)',
                    borderColor: 'var(--color-primary)'
                  } : {
                    background: 'var(--color-surface)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: radius === r
                          ? 'var(--color-primary)'
                          : 'var(--color-divider)'
                      }}
                    >
                      <span className={radius === r ? 'text-white' : ''}>
                        {r <= 5 ? '🚶' : r <= 10 ? '🚗' : '🛣️'}
                      </span>
                    </div>
                    <div className="text-left">
                      <p
                        className="font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        Within {r} {r === 1 ? 'mile' : 'miles'}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {r === 1 ? 'Walking distance' : r === 5 ? 'Quick drive' : r === 10 ? 'Short trip' : 'Anywhere on island'}
                      </p>
                    </div>
                  </div>
                  {radius === r && (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Safe area padding */}
            <div className="h-8" />
          </div>
        </div>
      )}
    </>
  )
}
