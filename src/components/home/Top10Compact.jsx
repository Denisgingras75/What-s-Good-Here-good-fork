import { useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'

/**
 * Top10Compact - Ranked dish list for the homepage
 *
 * Supports MV vs Personal toggle for logged-in users with preferences.
 * Accepts categoryLabel for inline category filtering.
 */
export function Top10Compact({
  dishes,
  personalDishes,
  showToggle = false,
  town,
  categoryLabel,
  onSeeAll,
  startRank = 1,
}) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('mv')

  const activeDishes = activeTab === 'personal' && showToggle
    ? (personalDishes || [])
    : (dishes || [])

  if (!dishes?.length && !categoryLabel) return null

  return (
    <section className="animate-fadeIn">
      {/* Micro-headline — only for category filtering */}
      {categoryLabel && (
        <p
          className="font-bold mb-3"
          style={{ color: 'var(--color-primary)', fontSize: '19px', letterSpacing: '-0.02em' }}
        >
          {town ? `Best ${categoryLabel} in ${town}` : `Best ${categoryLabel} on the Vineyard`}
        </p>
      )}

      {/* Header */}
      {showToggle ? (
        <div role="tablist" aria-label="Top 10 list filter" className="flex gap-2 mb-4">
          <button
            role="tab"
            aria-selected={activeTab === 'mv'}
            onClick={() => setActiveTab('mv')}
            className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === 'mv' ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
              color: activeTab === 'mv' ? '#FFFFFF' : 'var(--color-text-secondary)',
            }}
          >
            {town || 'MV'} Top 10
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'personal'}
            onClick={() => setActiveTab('personal')}
            className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === 'personal' ? 'var(--color-accent-gold)' : 'var(--color-surface-elevated)',
              color: activeTab === 'personal' ? '#FFFFFF' : 'var(--color-text-secondary)',
            }}
          >
            My Top 10
          </button>
        </div>
      ) : !categoryLabel ? (
        <h3
          className="font-bold mb-4"
          style={{
            color: 'var(--color-primary)',
            fontSize: '19px',
            letterSpacing: '-0.02em',
          }}
        >
          The Contenders
        </h3>
      ) : null}

      {/* Dishes list */}
      <div>
        {activeDishes.length > 0 ? (
          <>
            {/* Podium rows — up to 3 with medal styling */}
            {activeDishes.slice(0, Math.max(0, 4 - startRank)).map((dish, index) => (
              <div key={dish.dish_id} style={{ marginBottom: '6px' }}>
                <Top10Row
                  dish={dish}
                  rank={index + startRank}
                  onClick={() => navigate(`/dish/${dish.dish_id}`)}
                />
              </div>
            ))}

            {/* Finalists — grouped Apple-style list */}
            {activeDishes.length > Math.max(0, 4 - startRank) && (
              <div
                className="mt-3 rounded-xl overflow-hidden"
              >
                {activeDishes.slice(Math.max(0, 4 - startRank)).map((dish, index) => (
                  <Top10Row
                    key={dish.dish_id}
                    dish={dish}
                    rank={index + startRank + Math.max(0, 4 - startRank)}
                    onClick={() => navigate(`/dish/${dish.dish_id}`)}
                    isLast={index === activeDishes.length - Math.max(0, 4 - startRank) - 1}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              {categoryLabel ? `No ${categoryLabel} ranked yet` : 'No dishes found in your categories yet'}
            </p>
            {!categoryLabel && (
              <button
                onClick={() => navigate('/profile')}
                className="mt-2 text-xs font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                Edit favorites
              </button>
            )}
          </div>
        )}
      </div>

      {/* See all link for category filtering */}
      {onSeeAll && categoryLabel && (
        <button
          onClick={onSeeAll}
          className="w-full mt-3 pt-3 text-sm font-medium transition-opacity hover:opacity-70"
          style={{
            color: 'var(--color-accent-gold)',
            borderTop: '1px solid var(--color-divider)',
          }}
        >
          See all {categoryLabel} →
        </button>
      )}
    </section>
  )
}

const PODIUM_STYLE = {
  1: { color: 'var(--color-medal-gold)', glow: '#E9A115', rankSize: '25px', nameSize: '16px', ratingSize: '16px' },
  2: { color: 'var(--color-medal-silver)', glow: '#A8B5BF', rankSize: '22px', nameSize: '15px', ratingSize: '15px' },
  3: { color: 'var(--color-medal-bronze)', glow: '#C4855C', rankSize: '20px', nameSize: '14px', ratingSize: '14px' },
}

// Top 10 row — podium layout for 1-3, compact for 4+
const Top10Row = memo(function Top10Row({ dish, rank, onClick, isLast }) {
  const { dish_name, restaurant_name, avg_rating, total_votes } = dish
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING
  const podium = PODIUM_STYLE[rank]

  const accessibleLabel = isRanked
    ? `Rank ${rank}: ${dish_name} at ${restaurant_name}, rated ${avg_rating} out of 10 with ${total_votes} votes`
    : `Rank ${rank}: ${dish_name} at ${restaurant_name}, ${total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'new dish'}`

  if (podium) {
    return (
      <button
        onClick={onClick}
        aria-label={accessibleLabel}
        className="w-full flex items-center gap-3 py-3 px-3 rounded-lg transition-colors text-left"
        style={{
          background: `linear-gradient(to right, var(--color-surface-elevated) ${(avg_rating || 0) * 10}%, var(--color-surface) ${(avg_rating || 0) * 10}%)`,
          borderLeft: `2px solid ${podium.glow}`,
        }}
      >
        {/* Large rank number with glow */}
        <span
          className="font-bold flex-shrink-0"
          style={{
            color: podium.color,
            fontSize: podium.rankSize,
            lineHeight: 1,
            minWidth: '24px',
            textAlign: 'center',
            textShadow: `0 0 6px ${podium.glow}20, 0 0 12px ${podium.glow}10`,
          }}
        >
          {rank}
        </span>

        {/* Dish + restaurant + rating info */}
        <div className="flex-1 min-w-0">
          <p
            className="font-bold truncate"
            style={{
              color: podium.color,
              fontSize: podium.nameSize,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {dish_name}
          </p>
          <p
            className="truncate font-medium"
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '11px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            {restaurant_name}
          </p>
          <p style={{ marginTop: '3px', fontSize: '13px' }}>
            {isRanked ? (
              <>
                <span className="font-bold" style={{ color: getRatingColor(avg_rating) }}>
                  {avg_rating}
                </span>
                <span style={{ color: 'var(--color-text-tertiary)' }}> · {total_votes} votes</span>
              </>
            ) : (
              <span style={{ color: 'var(--color-text-tertiary)' }}>
                {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
              </span>
            )}
          </p>
        </div>
      </button>
    )
  }

  // Respected finalists for ranks 4+
  return (
    <button
      onClick={onClick}
      aria-label={accessibleLabel}
      className="w-full flex items-center gap-3 py-3.5 px-3 transition-colors text-left active:scale-[0.99]"
      style={{
        background: 'var(--color-surface)',
        borderBottom: isLast ? 'none' : '1px solid var(--color-divider)',
      }}
    >
      <span
        className="font-bold flex-shrink-0"
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: '15px',
          minWidth: '24px',
          textAlign: 'center',
        }}
      >
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {dish_name}
        </p>
        <p
          className="truncate font-medium"
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: '11px',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            marginTop: '1px',
          }}
        >
          {restaurant_name}
        </p>
        <p style={{ marginTop: '3px', fontSize: '13px' }}>
          {isRanked ? (
            <>
              <span className="font-bold" style={{ color: getRatingColor(avg_rating) }}>
                {avg_rating}
              </span>
              <span style={{ color: 'var(--color-text-tertiary)' }}> · {total_votes} votes</span>
            </>
          ) : (
            <span style={{ color: 'var(--color-text-tertiary)' }}>
              {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
            </span>
          )}
        </p>
      </div>
    </button>
  )
})
