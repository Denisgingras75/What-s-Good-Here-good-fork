import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { followsApi } from '../api'

/**
 * Modal to display followers or following list with pagination
 */
export function FollowListModal({ userId, type, onClose }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [cursor, setCursor] = useState(null)

  const isFollowers = type === 'followers'
  const title = isFollowers ? 'Followers' : 'Following'

  // Initial fetch
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      setError(null)
      setUsers([])
      setCursor(null)
      try {
        const result = isFollowers
          ? await followsApi.getFollowers(userId)
          : await followsApi.getFollowing(userId)
        setUsers(result.users)
        setHasMore(result.hasMore)
        if (result.users.length > 0) {
          setCursor(result.users[result.users.length - 1].followed_at)
        }
      } catch (err) {
        setError('Unable to load. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [userId, isFollowers])

  // Load more handler
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursor) return

    setLoadingMore(true)
    try {
      const result = isFollowers
        ? await followsApi.getFollowers(userId, { cursor })
        : await followsApi.getFollowing(userId, { cursor })

      setUsers(prev => [...prev, ...result.users])
      setHasMore(result.hasMore)
      if (result.users.length > 0) {
        setCursor(result.users[result.users.length - 1].followed_at)
      }
    } catch (err) {
      // Silently fail on load more - user can retry
    } finally {
      setLoadingMore(false)
    }
  }, [userId, isFollowers, cursor, hasMore, loadingMore])

  const handleUserClick = (user) => {
    onClose()
    navigate(`/user/${user.id}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden flex flex-col shadow-2xl border"
        style={{
          background: 'var(--color-surface-elevated)',
          maxHeight: 'calc(100vh - 120px)',
          borderColor: 'rgba(255,255,255,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4 border-b"
          style={{
            borderColor: 'rgba(255,255,255,0.1)',
            background: 'rgba(244, 162, 97, 0.08)'
          }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div
                className="w-6 h-6 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--color-divider)', borderTopColor: 'var(--color-primary)' }}
              />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {error}
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-2">
                {isFollowers ? '👥' : '🔍'}
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {isFollowers ? 'No followers yet' : 'Not following anyone yet'}
              </p>
            </div>
          ) : (
            <div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left hover:bg-white/5 active:scale-[0.99]"
                  >
                    {/* Avatar */}
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      {user.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {user.display_name || 'Anonymous'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
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

              {/* Load More Button */}
              {hasMore && (
                <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full py-2.5 rounded-xl font-medium text-sm transition-all"
                    style={{
                      background: 'var(--color-primary)',
                      color: 'white',
                      opacity: loadingMore ? 0.7 : 1
                    }}
                  >
                    {loadingMore ? (
                      <span className="flex items-center justify-center gap-2">
                        <div
                          className="w-4 h-4 border-2 rounded-full animate-spin"
                          style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}
                        />
                        Loading...
                      </span>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FollowListModal
