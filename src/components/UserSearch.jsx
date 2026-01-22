import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { followsApi } from '../api'

/**
 * UserSearch - Search for users by name
 */
export function UserSearch({ onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Search as user types
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const search = async () => {
      setLoading(true)
      const users = await followsApi.searchUsers(query, 10)
      setResults(users)
      setLoading(false)
    }

    const timer = setTimeout(search, 200)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelectUser = (user) => {
    navigate(`/user/${user.id}`)
    onClose?.()
  }

  return (
    <div className="w-full">
      {/* Search Input */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-divider)',
        }}
      >
        <svg
          className="w-5 h-5 flex-shrink-0"
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--color-text-primary)' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-1"
          >
            <svg
              className="w-4 h-4"
              style={{ color: 'var(--color-text-tertiary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results */}
      {query.length >= 2 && (
        <div className="mt-3">
          {loading ? (
            <div className="py-4 text-center">
              <div
                className="w-5 h-5 border-2 rounded-full animate-spin mx-auto"
                style={{ borderColor: 'var(--color-divider)', borderTopColor: 'var(--color-primary)' }}
              />
            </div>
          ) : results.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No users found for "{query}"
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left"
                  style={{ background: 'var(--color-bg)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {user.display_name?.charAt(0).toUpperCase() || '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {user.display_name || 'Anonymous'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      {user.follower_count || 0} followers
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserSearch
