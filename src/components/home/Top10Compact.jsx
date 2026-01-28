import { useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'

/**
 * Top10Compact - Collapsible top 10 list for the homepage
 *
 * Shows top 3 by default, expands to show all 10.
 * Supports MV vs Personal toggle for logged-in users with preferences.
 */
export function Top10Compact({
  dishes,
  personalDishes,
  showToggle = false,
  initialCount = 3,
}) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('mv') // 'mv' or 'personal'
  const [expanded, setExpanded] = useState(false)

  // Which dishes to show based on active tab
  const activeDishes = activeTab === 'personal' && showToggle
    ? personalDishes
    : dishes

  const displayedDishes = expanded
    ? activeDishes
    : activeDishes.slice(0, initialCount)

  const hasMore = activeDishes.length > initialCount

  if (!dishes?.length) return null

  return (
    <section
      className="rounded-2xl p-4"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-divider)',
      }}
    >
      {/* Header with optional toggle */}
      {showToggle ? (
        <div role="tablist" aria-label="Top 10 list filter" className="flex gap-2 mb-4">
          <button
            role="tab"
            aria-selected={activeTab === 'mv'}
            onClick={() => {
              setActiveTab('mv')
              setExpanded(false)
            }}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'mv' ? 'shadow-md' : ''
            }`}
            style={{
              background: activeTab === 'mv' ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
              color: activeTab === 'mv' ? 'white' : 'var(--color-text-secondary)',
            }}
          >
            MV Top 10
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'personal'}
            onClick={() => {
              setActiveTab('personal')
              setExpanded(false)
            }}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'personal' ? 'shadow-md' : ''
            }`}
            style={{
              background: activeTab === 'personal' ? 'var(--color-accent-gold)' : 'var(--color-surface-elevated)',
              color: activeTab === 'personal' ? '#1F1F1F' : 'var(--color-text-secondary)',
            }}
          >
            My Top 10
          </button>
        </div>
      ) : (
        <h3
          className="font-bold text-base mb-4 pb-2 flex items-center gap-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '2px solid var(--color-accent-gold)',
          }}
        >
          <span aria-hidden="true">🏆</span>
          Top 10 on the Island
        </h3>
      )}

      {/* Dishes list */}
      <div className="space-y-1">
        {displayedDishes.length > 0 ? (
          displayedDishes.map((dish, index) => (
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
              Edit favorites
            </button>
          </div>
        )}
      </div>

      {/* Expand/collapse button */}
      {hasMore && displayedDishes.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 pt-3 border-t text-sm font-medium flex items-center justify-center gap-1 transition-colors"
          style={{
            borderColor: 'var(--color-divider)',
            color: 'var(--color-primary)',
          }}
        >
          {expanded ? (
            <>
              Show less
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              Show all {activeDishes.length}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </section>
  )
}

// Compact row for Top 10 list
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
