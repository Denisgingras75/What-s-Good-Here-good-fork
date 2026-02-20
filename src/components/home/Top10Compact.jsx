import { useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'
import { CategoryIcon } from './CategoryIcons'
import { DishPhotoFade } from './DishPhotoFade'

/**
 * Top10Compact - Ranked dish list for the homepage
 *
 * Editorial layout: big rank numbers, bold names, rating colored by value.
 * Staggered row entrances for smooth reveal.
 */
export function Top10Compact({
  dishes,
  town,
  categoryLabel,
  startRank = 1,
}) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const allDishes = dishes || []

  const INITIAL_COUNT = 10
  const hasMore = categoryLabel && allDishes.length > INITIAL_COUNT
  const activeDishes = expanded ? allDishes : allDishes.slice(0, INITIAL_COUNT)

  if (!dishes?.length && !categoryLabel) return null

  // Stagger offset — accounts for hero sections above (title, search, categories, #1 hero = ~4 items)
  const staggerBase = 4

  return (
    <section>
      {/* Dishes list — podium cards (2-3) then clean rows (4+) */}
      <div className="flex flex-col" style={{ gap: '6px' }}>
        {activeDishes.length > 0 ? (
          activeDishes.map((dish, index) => {
            const rank = index + startRank
            const isPodiumBreak = rank === 3 && activeDishes.length > 3
            const isAfterPodium = rank > 3
            const isLastRow = index === activeDishes.length - 1
            const nextRank = index + startRank + 1
            const nextIsAfterPodium = nextRank > 3
            return (
              <div
                key={dish.dish_id}
                className="stagger-item"
                style={{
                  animationDelay: `${(staggerBase + 1 + index) * 50}ms`,
                  marginBottom: isPodiumBreak ? '12px' : 0,
                  borderBottom: 'none', // rows handle their own dividers
                }}
              >
                <Top10Row
                  dish={dish}
                  rank={rank}
                  town={town}
                  onClick={() => navigate(`/dish/${dish.dish_id}`)}
                />
              </div>
            )
          })
        ) : (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              {categoryLabel ? `No ${categoryLabel} ranked yet` : 'No dishes found'}
            </p>
          </div>
        )}
      </div>

      {/* Show more / Show less for category lists */}
      {hasMore && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="w-full mt-3 pt-3 text-sm font-bold transition-opacity hover:opacity-70"
          style={{
            color: 'var(--color-primary)',
            borderTop: '1px solid var(--color-divider)',
          }}
        >
          {expanded ? 'Show less' : `Show all ${allDishes.length} ${categoryLabel}`}
        </button>
      )}
    </section>
  )
}

// Podium colors — silver (#2) and bronze (#3) banner bars
const PODIUM_COLORS = {
  2: { bg: 'linear-gradient(135deg, var(--color-medal-silver) 0%, #C4CDD3 45%, var(--color-medal-silver) 55%, #7A8890 100%)', text: '#FFFFFF' },
  3: { bg: 'linear-gradient(135deg, var(--color-medal-bronze) 0%, #D4965A 45%, var(--color-medal-bronze) 55%, #8A5A2A 100%)', text: '#FFFFFF' },
}

// Podium (2-3) get banner cards, ranks 4+ are clean rows
const Top10Row = memo(function Top10Row({ dish, rank, town, onClick }) {
  const { dish_name, restaurant_name, avg_rating, total_votes, category, featured_photo_url } = dish
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING
  const podium = PODIUM_COLORS[rank]
  const [photoFailed, setPhotoFailed] = useState(false)
  const showPhoto = podium && featured_photo_url && !photoFailed

  const accessibleLabel = isRanked
    ? `Rank ${rank}: ${dish_name} at ${restaurant_name}, rated ${avg_rating} out of 10 with ${total_votes} votes`
    : `Rank ${rank}: ${dish_name} at ${restaurant_name}, ${total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'new dish'}`

  if (podium) {
    return (
      <button
        onClick={onClick}
        aria-label={accessibleLabel}
        className="w-full text-left rounded-xl overflow-hidden card-press"
        style={{
          position: 'relative',
          background: 'var(--color-surface-elevated)',
          border: 'none',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Colored banner bar */}
        <div
          className="px-5 py-2"
          style={{
            position: 'relative',
            zIndex: 1,
            background: podium.bg,
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: podium.text,
            }}
          >
            #{rank} {town ? `in ${town}` : 'on the Vineyard'}
          </span>
        </div>

        {showPhoto && (
          <DishPhotoFade photoUrl={featured_photo_url} dishName={dish_name} width="50%" onPhotoError={() => setPhotoFailed(true)} />
        )}

        {/* Content — text left, icon right (only when no photo) */}
        <div
          className={`flex items-center gap-3 ${rank === 2 ? 'py-5 px-5' : 'py-3 px-5'}`}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div className="flex-1 min-w-0" style={showPhoto ? { maxWidth: '55%' } : undefined}>
            <p
              className="font-bold"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: rank === 2 ? '18px' : '15px',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {dish_name}
            </p>
            <p
              className="truncate font-medium"
              style={{
                color: 'var(--color-text-tertiary)',
                fontSize: '11px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: '3px',
              }}
            >
              {restaurant_name}
            </p>
            {isRanked ? (
              <div className="flex items-start gap-0 mt-3">
                <div style={{ paddingRight: '12px' }}>
                  <span style={{ fontFamily: "'aglet-sans', sans-serif", fontWeight: 800, fontSize: rank === 2 ? '20px' : '17px', lineHeight: 1, color: getRatingColor(avg_rating) }}>
                    {avg_rating}
                  </span>
                  <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '1px' }}>avg rating</p>
                </div>
                <div style={{ paddingLeft: '12px', paddingRight: '12px', borderLeft: '1px solid var(--color-divider)' }}>
                  <span style={{ fontFamily: "'aglet-sans', sans-serif", fontWeight: 800, fontSize: rank === 2 ? '20px' : '17px', lineHeight: 1, color: getRatingColor(dish.percent_worth_it / 10) }}>
                    {dish.percent_worth_it}%
                  </span>
                  <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '1px' }}>would reorder</p>
                </div>
                <div style={{ paddingLeft: '12px', borderLeft: '1px solid var(--color-divider)' }}>
                  <span style={{ fontFamily: "'aglet-sans', sans-serif", fontWeight: 800, fontSize: rank === 2 ? '20px' : '17px', lineHeight: 1, color: 'var(--color-text-primary)' }}>
                    {total_votes}
                  </span>
                  <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '1px' }}>votes</p>
                </div>
              </div>
            ) : (
              <p className="text-xs font-medium mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
              </p>
            )}
          </div>
          {!showPhoto && (
            <CategoryIcon categoryId={category} dishName={dish_name} size={rank === 2 ? 72 : 60} color="var(--color-primary)" />
          )}
        </div>
      </button>
    )
  }

  // Ranks 4+ — clean rows with divider line, editorial list feel
  return (
    <button
      onClick={onClick}
      aria-label={accessibleLabel}
      className="w-full py-3 px-4 text-left card-press"
      style={{
        background: 'var(--color-surface-elevated)',
        borderBottom: '1px solid var(--color-divider)',
      }}
    >
      {/* Top row: rank + name + icon */}
      <div className="flex gap-3 items-center">
        <span
          className="font-bold flex-shrink-0"
          style={{
            fontFamily: "'aglet-sans', sans-serif",
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            fontSize: '14px',
            lineHeight: 1.3,
            minWidth: '20px',
            textAlign: 'center',
          }}
        >
          #{rank}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="font-bold truncate"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: '15px',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {dish_name}
          </p>
          <p
            className="truncate font-medium"
            style={{
              color: 'var(--color-text-tertiary)',
              fontSize: '11px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginTop: '3px',
            }}
          >
            {restaurant_name}
          </p>
        </div>
        <CategoryIcon categoryId={category} dishName={dish_name} size={72} color="var(--color-primary)" />
      </div>
      {/* Rating — compact for list rows */}
      <div className="flex items-baseline gap-2 mt-1 pl-8">
        {isRanked ? (
          <>
            <span style={{ fontFamily: "'aglet-sans', sans-serif", fontWeight: 800, fontSize: '18px', color: getRatingColor(avg_rating) }}>
              {avg_rating}
            </span>
            <span style={{ width: '1px', height: '14px', background: 'var(--color-divider)', display: 'inline-block', verticalAlign: 'middle' }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
              {total_votes} vote{total_votes === 1 ? '' : 's'}
            </span>
          </>
        ) : (
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
            {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
          </span>
        )}
      </div>
    </button>
  )
})
