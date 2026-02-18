import { useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'
import { getCategoryEmoji } from '../../constants/categories'

/**
 * Top10Compact - Ranked dish list for the homepage
 *
 * Supports ranked vs Personal toggle for logged-in users with preferences.
 * Accepts categoryLabel for inline category filtering.
 */
export function Top10Compact({
  dishes,
  personalDishes,
  showToggle = false,
  town,
  categoryLabel,
  onSeeAll,
}) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ranked')

  const activeDishes = activeTab === 'personal' && showToggle
    ? personalDishes
    : dishes

  const hasAnyVotes = dishes?.some(d => (d.total_votes || 0) > 0)

  if (!dishes?.length && !categoryLabel) return null

  return (
    <section className="animate-fadeIn">
      {/* Micro-headline */}
      <p
        className="font-bold mb-1"
        style={{ color: 'var(--color-accent-gold)', fontSize: '13px' }}
      >
        {categoryLabel
          ? (town ? `The best ${categoryLabel} in ${town}` : `The best ${categoryLabel} near you`)
          : hasAnyVotes ? 'People have spoken' : 'Dishes near you'
        }
      </p>

      {/* Header */}
      {showToggle ? (
        <div role="tablist" aria-label="Top 10 list filter" className="flex gap-2 mb-4">
          <button
            role="tab"
            aria-selected={activeTab === 'ranked'}
            onClick={() => setActiveTab('ranked')}
            className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === 'ranked' ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
              color: activeTab === 'ranked' ? 'white' : 'var(--color-text-secondary)',
            }}
          >
            {town || 'Local'} Top 10
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'personal'}
            onClick={() => setActiveTab('personal')}
            className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === 'personal' ? 'var(--color-accent-gold)' : 'var(--color-surface-elevated)',
              color: activeTab === 'personal' ? 'var(--color-text-on-primary)' : 'var(--color-text-secondary)',
            }}
          >
            My Top 10
          </button>
        </div>
      ) : !categoryLabel ? (
        <h3
          className="font-bold mb-4"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '15px',
            letterSpacing: '-0.01em',
          }}
        >
          Top 10 {town ? `in ${town}` : 'Near You'}
        </h3>
      ) : null}

      {/* Dishes list */}
      <div>
        {activeDishes.length > 0 ? (
          activeDishes.map((dish, index) => {
            const rank = index + 1
            return (
              <div key={dish.dish_id} style={{ marginBottom: rank <= 3 ? '6px' : '0' }}>
                <Top10Row
                  dish={dish}
                  rank={rank}
                  onClick={() => navigate(`/dish/${dish.dish_id}`)}
                />
                {rank === 3 && activeDishes.length > 3 && (
                  <div
                    className="mt-3 mb-2 mx-2"
                    style={{ borderBottom: '1px solid var(--color-divider)' }}
                  />
                )}
              </div>
            )
          })
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
  1: { color: 'var(--color-medal-gold)', glow: '#D9A765', rankSize: '22px', nameSize: '16px', ratingSize: '16px', bgTint: 'rgba(217, 167, 101, 0.06)' },
  2: { color: 'var(--color-medal-silver)', glow: '#A8B5BF', rankSize: '20px', nameSize: '15px', ratingSize: '15px', bgTint: 'rgba(168, 181, 191, 0.05)' },
  3: { color: 'var(--color-medal-bronze)', glow: '#C4855C', rankSize: '18px', nameSize: '14px', ratingSize: '14px', bgTint: 'rgba(196, 133, 92, 0.05)' },
}

// Top 10 row — podium layout for 1-3, compact for 4+
const Top10Row = memo(function Top10Row({ dish, rank, onClick }) {
  const { dish_name, restaurant_name, avg_rating, total_votes, distance_miles } = dish
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
        className="w-full flex items-center gap-3 py-3 px-3 rounded-lg transition-all text-left hover:brightness-110"
        style={{
          background: podium.bgTint,
          borderLeft: `2px solid ${podium.glow}`,
        }}
      >
        {/* Rank number */}
        <span
          className="font-bold flex-shrink-0"
          style={{
            color: podium.color,
            fontSize: podium.rankSize,
            lineHeight: 1,
            minWidth: '24px',
            textAlign: 'center',
          }}
        >
          {rank}
        </span>

        {/* Dish info */}
        <div className="flex-1 min-w-0">
          <p
            className="font-bold truncate"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: podium.nameSize,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            <span style={{ fontSize: '14px', marginRight: '4px' }}>{getCategoryEmoji(dish.category)}</span>
            {dish_name}
          </p>
          <p
            className="truncate font-medium"
            style={{
              color: 'var(--color-text-tertiary)',
              fontSize: '11px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            {restaurant_name}{distance_miles != null && ` · ${Number(distance_miles).toFixed(1)} mi`}
          </p>
        </div>

        {/* Rating */}
        <div className="flex-shrink-0 text-right">
          {isRanked ? (
            <span
              className="font-bold"
              style={{
                color: getRatingColor(avg_rating),
                fontSize: podium.ratingSize,
              }}
            >
              {avg_rating}
            </span>
          ) : (
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
            </span>
          )}
        </div>
      </button>
    )
  }

  // Compact row for ranks 4+
  return (
    <button
      onClick={onClick}
      aria-label={accessibleLabel}
      className="w-full flex items-center gap-3 py-2.5 px-2 rounded-lg transition-all text-left hover:bg-[var(--color-surface-elevated)]"
      style={{ opacity: 0.9 }}
    >
      <span
        className="w-6 text-center text-sm font-bold flex-shrink-0"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
          <span style={{ fontSize: '12px', marginRight: '3px' }}>{getCategoryEmoji(dish.category)}</span>
          {dish_name}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
          {restaurant_name}{distance_miles != null && ` · ${Number(distance_miles).toFixed(1)} mi`}
        </p>
      </div>

      <div className="flex-shrink-0 text-right">
        {isRanked ? (
          <span className="text-sm font-bold" style={{ color: getRatingColor(avg_rating) }}>
            {avg_rating}
          </span>
        ) : (
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
          </span>
        )}
      </div>
    </button>
  )
})
