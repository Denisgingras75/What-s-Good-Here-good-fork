import { useState } from 'react'
import { MAIN_CATEGORIES } from '../../constants/categories'

export function DishesManager({ restaurantId, dishes, onAdd, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function resetForm() {
    setName('')
    setCategory('')
    setPrice('')
    setPhotoUrl('')
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(dish) {
    setEditingId(dish.id)
    setName(dish.name || '')
    setCategory(dish.category || '')
    setPrice(dish.price ? String(dish.price) : '')
    setPhotoUrl(dish.photo_url || '')
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || (!editingId && !category)) return

    setSubmitting(true)
    try {
      if (editingId) {
        await onUpdate(editingId, {
          name: name.trim(),
          price: price || null,
          photoUrl: photoUrl || null,
        })
      } else {
        await onAdd({
          restaurantId,
          name: name.trim(),
          category,
          price: price || null,
          photoUrl: photoUrl || null,
        })
      }
      resetForm()
    } catch {
      // Parent handles error display via setMessage
    } finally {
      setSubmitting(false)
    }
  }

  // Group dishes by category
  const grouped = {}
  for (const dish of dishes) {
    const cat = dish.category || 'other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(dish)
  }
  const categoryKeys = Object.keys(grouped).sort()

  return (
    <div>
      {/* Add/Edit Form Toggle */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed transition-all mb-4"
          style={{ borderColor: 'var(--color-divider)', color: 'var(--color-primary)' }}
        >
          <span className="font-semibold text-sm">+ Add Dish</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-xl border" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
            {editingId ? 'Edit Dish' : 'New Dish'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dish name"
              required
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'var(--color-divider)', background: 'var(--color-surface)' }}
            />
            {!editingId && (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--color-divider)', background: 'var(--color-surface)' }}
              >
                <option value="">Select category...</option>
                {MAIN_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-3">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price ($)"
                step="0.01"
                min="0"
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--color-divider)', background: 'var(--color-surface)' }}
              />
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Photo URL"
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--color-divider)', background: 'var(--color-surface)' }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
                style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
              >
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Add Dish'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-elevated)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Dishes grouped by category */}
      {categoryKeys.map((cat) => (
        <div key={cat} className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
            {cat}
          </h3>
          <div className="space-y-1.5">
            {grouped[cat].map((dish) => (
              <button
                key={dish.id}
                onClick={() => handleEdit(dish)}
                className="w-full text-left p-3 rounded-xl border transition-colors"
                style={{ background: 'var(--color-bg)', borderColor: editingId === dish.id ? 'var(--color-primary)' : 'var(--color-divider)' }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {dish.name}
                  </p>
                  {dish.price && (
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      ${Number(dish.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {dishes.length === 0 && !showForm && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            No dishes yet. Add your first one!
          </p>
        </div>
      )}
    </div>
  )
}
