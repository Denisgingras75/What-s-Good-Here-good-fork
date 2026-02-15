import { useState, useEffect } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useAuth } from '../context/AuthContext'
import { dishesApi } from '../api/dishesApi'
import { ALL_CATEGORIES } from '../constants/categories'
import { validateUserContent } from '../lib/reviewBlocklist'
import { capture } from '../lib/analytics'
import { logger } from '../utils/logger'
import { LoginModal } from './Auth/LoginModal'

/**
 * Modal for adding a dish to a restaurant
 * Auth-gated — shows LoginModal if not logged in
 */
export function AddDishModal({ isOpen, onClose, restaurantId, restaurantName, onDishCreated, existingDishes = [] }) {
  const { user } = useAuth()
  const containerRef = useFocusTrap(isOpen, onClose)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [duplicateWarning, setDuplicateWarning] = useState(null)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setName('')
      setCategory('')
      setPrice('')
      setError(null)
      setDuplicateWarning(null)
    }
  }, [isOpen])

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Dish name is required')
      return
    }
    if (!category) {
      setError('Please select a category')
      return
    }

    // Client-side content validation
    const contentError = validateUserContent(name.trim(), 'Dish name')
    if (contentError) {
      setError(contentError)
      return
    }

    // Duplicate dish check (warn but don't block)
    if (!duplicateWarning && existingDishes.length > 0) {
      const trimmedName = name.trim().toLowerCase()
      const duplicate = existingDishes.find(d => d.dish_name?.toLowerCase() === trimmedName || d.name?.toLowerCase() === trimmedName)
      if (duplicate) {
        setDuplicateWarning(`A dish named "${duplicate.dish_name || duplicate.name}" already exists here. Add anyway?`)
        return
      }
    }

    setSubmitting(true)
    setError(null)

    try {
      const dish = await dishesApi.create({
        restaurantId,
        name: name.trim(),
        category,
        price: price ? parseFloat(price) : null,
      })

      capture('dish_created_by_user', {
        restaurant_id: restaurantId,
        category,
        dish_id: dish.id,
      })

      onDishCreated?.(dish)
      onClose()
    } catch (err) {
      logger.error('Error creating dish:', err)
      setError(err?.message || 'Failed to create dish. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add a dish"
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-divider)' }}
        >
          <div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
              Add a Dish
            </h2>
            {restaurantName && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                at {restaurantName}
              </p>
            )}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(200, 90, 84, 0.15)', color: 'var(--color-primary)' }}>
              {error}
            </div>
          )}

          {duplicateWarning && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(217, 167, 101, 0.15)', color: 'var(--color-accent-gold)' }}>
              {duplicateWarning}
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 rounded text-xs font-semibold"
                  style={{ background: 'var(--color-accent-gold)', color: 'var(--color-bg)' }}
                >
                  Add Anyway
                </button>
                <button
                  type="button"
                  onClick={() => { setDuplicateWarning(null); setName('') }}
                  className="px-3 py-1 rounded text-xs font-semibold"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Dish Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setDuplicateWarning(null) }}
              placeholder="e.g. Classic Cheeseburger"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-divider)', color: 'var(--color-text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm appearance-none"
              style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-divider)', color: category ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
            >
              <option value="">Select a category...</option>
              {ALL_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Price (optional)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 rounded-lg text-sm"
              style={{ background: 'var(--color-bg)', border: '1.5px solid var(--color-divider)', color: 'var(--color-text-primary)' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim() || !category}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            {submitting ? 'Adding...' : 'Add Dish'}
          </button>
        </form>
      </div>
    </div>
  )
}
