import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { restaurantsApi } from '../api/restaurantsApi'
import { logger } from '../utils/logger'
import { AddDishModal } from './AddDishModal'
import { LoginModal } from './Auth/LoginModal'

/**
 * AddDishFlow — 2-step flow for adding a dish from anywhere in the app
 * Step 1: Search and select a restaurant
 * Step 2: Add dish details (delegates to AddDishModal)
 */
export function AddDishFlow({ isOpen, onClose }) {
  const { user } = useAuth()
  const [step, setStep] = useState('restaurant') // 'restaurant' | 'dish'
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const inputRef = useRef(null)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep('restaurant')
      setSearchQuery('')
      setResults([])
      setSelectedRestaurant(null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Search restaurants with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([])
      return
    }

    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const data = await restaurantsApi.search(searchQuery, 10)
        setResults(data)
      } catch (err) {
        logger.error('Restaurant search failed:', err)
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [searchQuery])

  if (!isOpen) return null

  // Auth gate
  if (!user) {
    return (
      <LoginModal
        isOpen={true}
        onClose={onClose}
        pendingAction="add a dish"
      />
    )
  }

  // Step 2: Add dish form
  if (step === 'dish' && selectedRestaurant) {
    return (
      <AddDishModal
        isOpen={true}
        onClose={() => {
          onClose()
        }}
        restaurantId={selectedRestaurant.id}
        restaurantName={selectedRestaurant.name}
        onDishCreated={() => {
          onClose()
        }}
      />
    )
  }

  // Step 1: Restaurant picker
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-divider)' }}
        >
          <div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
              Add a Dish
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              First, find the restaurant
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 flex-shrink-0">
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
            style={{
              background: 'var(--color-bg)',
              border: '1.5px solid var(--color-divider)',
            }}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              style={{ color: 'var(--color-text-tertiary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none border-none text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {searching && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>
              Searching...
            </p>
          )}

          {!searching && searchQuery.length >= 2 && results.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>
              No restaurants found for "{searchQuery}"
            </p>
          )}

          {!searchQuery.trim() && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>
              Type a restaurant name to get started
            </p>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => {
                    setSelectedRestaurant(restaurant)
                    setStep('dish')
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl transition-colors"
                  style={{ background: 'var(--color-bg)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {restaurant.name}
                  </p>
                  {restaurant.address && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                      {restaurant.address}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
