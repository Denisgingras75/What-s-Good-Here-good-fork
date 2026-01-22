import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { followsApi } from '../api'

/**
 * Modal to display followers or following list
 */
export function FollowListModal({ userId, type, onClose }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const isFollowers = type === 'followers'
  const title = isFollowers ? 'Followers' : 'Following'

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      const data = isFollowers
        ? await followsApi.getFollowers(userId)
        : await followsApi.getFollowing(userId)
      setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [userId, isFollowers])

  const handleUserClick = (user) => {
    onClose()
    navigate(`/user/${user.id}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-md max-h-[70vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--color-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-divider)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full"
            style={{ color: 'var(--color-text-secondary)' }}
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
            <div className="divide-y" style={{ borderColor: 'var(--color-divider)' }}>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                  style={{ background: 'var(--color-bg)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
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
          )}
        </div>
      </div>
    </div>
  )
}

export default FollowListModal
