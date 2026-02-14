import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tasteApi } from '../api/tasteApi'
import { followsApi } from '../api/followsApi'
import { logger } from '../utils/logger'

function getCompatColor(pct) {
  if (pct >= 75) return 'var(--color-emerald)'
  if (pct >= 50) return 'var(--color-amber)'
  return 'var(--color-red)'
}

export function SimilarTasteUsers() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [followingMap, setFollowingMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setUsers([])
      setLoading(false)
      return
    }

    let cancelled = false
    tasteApi.getSimilarTasteUsers(5)
      .then(data => {
        if (!cancelled) {
          setUsers(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [user])

  const handleFollow = async (userId) => {
    try {
      await followsApi.follow(userId)
      setFollowingMap(prev => ({ ...prev, [userId]: true }))
    } catch (err) {
      logger.error('Failed to follow user:', err)
    }
  }

  if (!user || loading || users.length === 0) return null

  return (
    <div className="px-4 py-4" style={{ background: 'var(--color-surface)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
        Similar Taste
      </p>
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {users.map((u) => {
          const isFollowing = followingMap[u.user_id]
          const compatColor = getCompatColor(u.compatibility_pct)

          return (
            <div
              key={u.user_id}
              className="flex-shrink-0 w-[130px] rounded-xl p-3 flex flex-col items-center gap-2"
              style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}
            >
              {/* Avatar */}
              <button
                onClick={() => navigate(`/user/${u.user_id}`)}
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold transition-transform active:scale-95"
                style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
              >
                {u.display_name?.charAt(0).toUpperCase() || '?'}
              </button>

              {/* Name */}
              <button
                onClick={() => navigate(`/user/${u.user_id}`)}
                className="text-sm font-medium truncate max-w-full"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {u.display_name?.split(' ')[0] || 'User'}
              </button>

              {/* Compatibility */}
              <span className="text-lg font-bold" style={{ color: compatColor }}>
                {u.compatibility_pct}%
              </span>

              {/* Shared dishes */}
              <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                {u.shared_dishes} shared
              </span>

              {/* Follow button */}
              <button
                onClick={() => !isFollowing && handleFollow(u.user_id)}
                disabled={isFollowing}
                className="w-full py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                style={isFollowing
                  ? { background: 'var(--color-surface)', color: 'var(--color-text-tertiary)', border: '1px solid var(--color-divider)' }
                  : { background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }
                }
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
