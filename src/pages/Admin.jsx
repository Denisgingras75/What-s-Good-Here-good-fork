import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { restaurantsApi, adminApi } from '../api'
import { CATEGORY_IMAGES } from '../constants/categoryImages'

const CATEGORIES = Object.keys(CATEGORY_IMAGES)

export function Admin() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [recentDishes, setRecentDishes] = useState([])

  // Admin status from database (matches RLS)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCheckDone, setAdminCheckDone] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  // Edit mode state
  const [editingDishId, setEditingDishId] = useState(null)

  // Form state
  const [restaurantId, setRestaurantId] = useState('')
  const [dishName, setDishName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

  // Check admin status from database (matches RLS policies)
  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      setAdminCheckDone(true)
      return
    }

    async function checkAdmin() {
      const result = await adminApi.isAdmin()
      setIsAdmin(result)
      setAdminCheckDone(true)
    }
    checkAdmin()
  }, [user])

  // Fetch restaurants on mount
  useEffect(() => {
    fetchRestaurants()
    fetchRecentDishes()
  }, [])

  async function fetchRestaurants() {
    try {
      const data = await restaurantsApi.getOpen()
      setRestaurants(data)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
      setMessage({ type: 'error', text: 'Failed to load restaurants' })
    } finally {
      setLoading(false)
    }
  }

  async function fetchRecentDishes() {
    try {
      const data = await adminApi.getRecentDishes(10)
      setRecentDishes(data)
    } catch (error) {
      console.error('Error fetching recent dishes:', error)
    }
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const results = await adminApi.searchDishes(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching dishes:', error)
      setMessage({ type: 'error', text: 'Search failed' })
    } finally {
      setSearching(false)
    }
  }

  function handleEdit(dish) {
    setEditingDishId(dish.id)
    setRestaurantId(dish.restaurant_id)
    setDishName(dish.name)
    setCategory(dish.category)
    setPrice(dish.price ? String(dish.price) : '')
    setPhotoUrl(dish.photo_url || '')
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingDishId(null)
    setRestaurantId('')
    setDishName('')
    setCategory('')
    setPrice('')
    setPhotoUrl('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!restaurantId || !dishName || !category) {
      setMessage({ type: 'error', text: 'Please fill in restaurant, dish name, and category' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      if (editingDishId) {
        // Update existing dish
        await adminApi.updateDish(editingDishId, {
          restaurantId,
          name: dishName,
          category,
          price: price ? parseFloat(price) : null,
          photoUrl,
        })
        setMessage({ type: 'success', text: `Updated "${dishName}" successfully!` })
        setEditingDishId(null)
      } else {
        // Add new dish
        await adminApi.addDish({
          restaurantId,
          name: dishName,
          category,
          price: price ? parseFloat(price) : null,
          photoUrl,
        })
        setMessage({ type: 'success', text: `Added "${dishName}" successfully!` })
      }
      // Reset form
      setRestaurantId('')
      setDishName('')
      setCategory('')
      setPrice('')
      setPhotoUrl('')
      // Refresh lists
      fetchRecentDishes()
      if (searchQuery) {
        const results = await adminApi.searchDishes(searchQuery)
        setSearchResults(results)
      }
    } catch (error) {
      console.error('Error saving dish:', error)
      setMessage({ type: 'error', text: `Failed to save dish: ${error.message}` })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(dishId, deletedDishName) {
    if (!confirm(`Delete "${deletedDishName}"? This cannot be undone.`)) return

    try {
      await adminApi.deleteDish(dishId)
      setMessage({ type: 'success', text: `Deleted "${deletedDishName}"` })
      fetchRecentDishes()
      // Also refresh search results if searching
      if (searchQuery) {
        const results = await adminApi.searchDishes(searchQuery)
        setSearchResults(results)
      }
      // Clear edit mode if deleting the dish being edited
      if (editingDishId === dishId) {
        handleCancelEdit()
      }
    } catch (error) {
      console.error('Error deleting dish:', error)
      setMessage({ type: 'error', text: `Failed to delete: ${error.message}` })
    }
  }

  // Show loading while checking auth or admin status
  if (authLoading || loading || !adminCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Unauthorized - not logged in or not an admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Access Denied
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            {!user
              ? "You need to be logged in to access this page."
              : "You don't have permission to access the admin area."
            }
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--color-surface)' }}>
      {/* Header */}
      <header className="px-4 py-4 border-b" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Admin - {editingDishId ? 'Edit Dish' : 'Add Dishes'}
            </h1>
          </div>
          {editingDishId && (
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Add Dish Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Restaurant */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Restaurant *
            </label>
            <select
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'var(--color-divider)', background: 'var(--color-bg)' }}
              required
            >
              <option value="">Select a restaurant...</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} - {r.address}
                </option>
              ))}
            </select>
          </div>

          {/* Dish Name */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Dish Name *
            </label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="e.g., Chicken Tendys"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'var(--color-divider)', background: 'var(--color-bg)' }}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'var(--color-divider)', background: 'var(--color-bg)' }}
              required
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Price ($)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 12.99"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'var(--color-divider)', background: 'var(--color-bg)' }}
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Photo URL (optional)
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'var(--color-divider)', background: 'var(--color-bg)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Leave blank to use category default image
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: editingDishId ? '#059669' : 'var(--color-primary)' }}
          >
            {submitting
              ? (editingDishId ? 'Updating...' : 'Adding...')
              : (editingDishId ? 'Update Dish' : 'Add Dish')
            }
          </button>
        </form>

        {/* Search Dishes */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Search Dishes
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by dish name..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'var(--color-divider)', background: 'var(--color-bg)' }}
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {searching ? '...' : 'Search'}
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 mb-6">
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
              {searchResults.map((dish) => (
                <div
                  key={dish.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    editingDishId === dish.id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {dish.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      {dish.restaurants?.name} · {dish.category} {dish.price ? `· $${dish.price}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => handleEdit(dish)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id, dish.name)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchQuery && searchResults.length === 0 && !searching && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>
              No dishes found for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Recent Dishes */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Recent Dishes
          </h2>
          <div className="space-y-2">
            {recentDishes.map((dish) => (
              <div
                key={dish.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  editingDishId === dish.id ? 'ring-2 ring-emerald-500' : ''
                }`}
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {dish.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {dish.restaurants?.name} · {dish.category} {dish.price ? `· $${dish.price}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={() => handleEdit(dish)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dish.id, dish.name)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {recentDishes.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>
                No dishes yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
