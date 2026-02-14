import { useState } from 'react'
import { getCategoryById } from '../../constants/categories'
import { CategoryPicker } from '../CategoryPicker'

/**
 * Edit Favorites Section for personalized Top 10
 * Allows users to select their favorite food categories
 *
 * Props:
 * - currentCategories: Array of current category IDs
 * - editing: Boolean for edit mode
 * - editedCategories: Array of categories being edited
 * - onStartEdit: Callback to start editing
 * - onCancelEdit: Callback to cancel editing
 * - onSave: Async callback to save changes
 * - onCategoriesChange: Callback when categories change during edit
 */
export function EditFavoritesSection({
  currentCategories,
  editing,
  editedCategories,
  onStartEdit,
  onCancelEdit,
  onSave,
  onCategoriesChange,
}) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave()
    setSaving(false)
  }

  // Get category info for display
  const displayCategories = currentCategories.map(id => getCategoryById(id)).filter(Boolean)

  return (
    <div className="border-b" style={{ borderColor: 'var(--color-divider)' }}>
      <button
        onClick={editing ? null : onStartEdit}
        className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
          editing ? '' : 'hover:bg-[color:var(--color-surface-elevated)]'
        }`}
      >
        <div className="text-left">
          <span className="font-medium text-[color:var(--color-text-primary)]">Favorite Categories</span>
          {!editing && displayCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {displayCategories.map(cat => (
                <span
                  key={cat.id}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}
                >
                  {cat.label}
                </span>
              ))}
            </div>
          )}
          {!editing && displayCategories.length === 0 && (
            <p className="text-xs text-[color:var(--color-text-tertiary)]">
              Set your favorites for a personalized Top 10
            </p>
          )}
        </div>
        {!editing && (
          <svg className="w-5 h-5 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Expanded editor */}
      {editing && (
        <div className="px-4 pb-4">
          <CategoryPicker
            selectedCategories={editedCategories}
            onSelectionChange={onCategoriesChange}
            showHeader={true}
            compact={true}
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 font-medium rounded-xl transition-colors disabled:opacity-50"
              style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onCancelEdit}
              disabled={saving}
              className="px-4 py-2 font-medium rounded-xl"
              style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-elevated)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditFavoritesSection
