import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'

// Top 10 Sidebar
export function Top10Sidebar({ dishes, showToggle, activeTab, onTabChange }) {
  const navigate = useNavigate()

  return (
    <aside aria-label="Top 10 dishes" className="mt-8 lg:mt-0 lg:w-72 lg:flex-shrink-0">
      <div
        className="rounded-2xl p-4 lg:sticky lg:top-4"
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-divider)',
        }}
      >
        {/* Toggle Buttons (only when user has preferences) */}
        {showToggle ? (
          <div role="tablist" aria-label="Top 10 list filter" className="flex gap-2 mb-4">
            <button
              role="tab"
              aria-selected={activeTab === 'ranked'}
              onClick={() => onTabChange('ranked')}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'ranked' ? 'shadow-md' : ''
              }`}
              style={{
                background: activeTab === 'ranked' ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                color: activeTab === 'ranked' ? 'white' : 'var(--color-text-secondary)',
              }}
            >
              Top 10
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'personal'}
              onClick={() => onTabChange('personal')}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'personal' ? 'shadow-md' : ''
              }`}
              style={{
                background: activeTab === 'personal' ? 'var(--color-accent-gold)' : 'var(--color-surface-elevated)',
                color: activeTab === 'personal' ? 'var(--color-text-on-primary)' : 'var(--color-text-secondary)',
              }}
            >
              My Top 10
            </button>
          </div>
        ) : (
          <h3
            className="font-bold text-base mb-4 pb-2"
            style={{
              color: 'var(--color-text-primary)',
              borderBottom: '2px solid var(--color-accent-gold)',
            }}
          >
            Top 10
          </h3>
        )}

        {/* Dishes list */}
        <div className="space-y-1">
          {dishes.length > 0 ? (
            dishes.map((dish, index) => (
              <Top10Row
                key={dish.dish_id}
                dish={dish}
                rank={index + 1}
                onClick={() => navigate(`/dish/${dish.dish_id}`)}
              />
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                No dishes found in your categories yet
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="mt-2 text-xs font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                Edit favorites →
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

// Compact row for Top 10 sidebar
const Top10Row = memo(function Top10Row({ dish, rank, onClick }) {
  const { dish_name, restaurant_name, avg_rating, total_votes } = dish
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING

  // Build accessible label
  const accessibleLabel = isRanked
    ? `Rank ${rank}: ${dish_name} at ${restaurant_name}, rated ${avg_rating} out of 10 with ${total_votes} votes`
    : `Rank ${rank}: ${dish_name} at ${restaurant_name}, ${total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'new dish'}`

  return (
    <button
      onClick={onClick}
      aria-label={accessibleLabel}
      className="w-full flex items-center gap-2 py-2 px-2 rounded-lg transition-colors text-left group"
      style={{ '--hover-bg': 'var(--color-surface-elevated)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {/* Rank - medals for top 3 */}
      {rank <= 3 ? (
        <span aria-hidden="true" className="text-base flex-shrink-0 w-5 text-center">
          {rank === 1 && '🥇'}
          {rank === 2 && '🥈'}
          {rank === 3 && '🥉'}
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          {rank}
        </span>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
          {dish_name}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
          {restaurant_name}
        </p>
      </div>

      {/* Rating or vote count */}
      <div className="flex-shrink-0 text-right">
        {isRanked ? (
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold leading-tight" style={{ color: getRatingColor(avg_rating) }}>
              {avg_rating}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {total_votes} votes
            </span>
          </div>
        ) : (
          <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
          </span>
        )}
      </div>
    </button>
  )
})
