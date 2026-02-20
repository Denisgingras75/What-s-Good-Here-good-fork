import { memo, useState, useEffect, useRef } from 'react'
import { ReviewFlow } from './ReviewFlow'
import { getWorthItBadge, formatScore10, calculateWorthItScore10, getRatingColor } from '../utils/ranking'
import { getCategoryImage } from '../constants/categoryImages'
import { ThumbsUpIcon } from './ThumbsUpIcon'
import { HearingIcon } from './HearingIcon'
import { getResponsiveImageProps } from '../utils/images'
import { EarIconTooltip } from './EarIconTooltip'
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../lib/storage'

export const DishCard = memo(function DishCard({ dish, onVote, onLoginRequired, isFavorite, onToggleFavorite, showOrderAgainPercent = false }) {
  const {
    dish_id,
    dish_name,
    restaurant_id,
    restaurant_name,
    category,
    price,
    photo_url,
    total_votes,
    yes_votes,
    percent_worth_it,
    avg_rating,
    distance_miles,
  } = dish

  const totalVotes = total_votes || 0
  const worthItScore10 = calculateWorthItScore10(percent_worth_it || 0)
  const badge = getWorthItBadge(worthItScore10, totalVotes)

  // Ear icon tooltip — show once per device
  const [showEarTooltip, setShowEarTooltip] = useState(false)
  const tooltipChecked = useRef(false)

  useEffect(() => {
    if (onToggleFavorite && !tooltipChecked.current) {
      tooltipChecked.current = true
      if (!getStorageItem(STORAGE_KEYS.HAS_SEEN_EAR_TOOLTIP)) {
        setShowEarTooltip(true)
      }
    }
  }, [onToggleFavorite])

  function dismissEarTooltip() {
    setShowEarTooltip(false)
    setStorageItem(STORAGE_KEYS.HAS_SEEN_EAR_TOOLTIP, '1')
  }

  // Use photo_url if dish has one, otherwise use category-based image
  const imageUrl = photo_url || getCategoryImage(category)

  // Get responsive image props (srcSet for Unsplash, regular src for others)
  const imageProps = getResponsiveImageProps(imageUrl, [400, 600, 800])

  return (
    <article className="card-elevated overflow-hidden mb-6 stagger-item dish-card-virtualized">
      {/* Dish Photo - Hero Element */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden group">
        <img
          {...imageProps}
          alt={dish_name}
          className="w-full h-full object-cover image-zoom"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />

        {/* Subtle gradient for badge contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Rating badge - bottom left (only show if 10+ votes) */}
        {totalVotes >= 10 && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white flex items-center gap-1">
              <ThumbsUpIcon size={24} /> {Math.round(percent_worth_it)}%
            </span>
          </div>
        )}

        {/* Top badges row */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {/* Heard it was good here button */}
          {onToggleFavorite && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (showEarTooltip) dismissEarTooltip()
                  onToggleFavorite(dish_id)
                }}
                aria-label={isFavorite ? 'Remove from heard list' : 'Mark as heard it was good'}
                className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                  isFavorite
                    ? 'bg-black/90 backdrop-blur-sm ring-2 ring-[var(--color-primary)]/50'
                    : 'bg-black/60 backdrop-blur-sm hover:bg-black/80'
                }`}
              >
                <HearingIcon size={26} className="md:w-7 md:h-7" active={isFavorite} />
              </button>
              <EarIconTooltip visible={showEarTooltip} onDismiss={dismissEarTooltip} />
            </div>
          )}

          {/* Distance badge */}
          {distance_miles && (
            <div className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm shadow-lg">
              <span className="text-xs font-semibold text-neutral-700">
                {Number(distance_miles).toFixed(1)} mi
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Dish Name - Primary Focus (2 lines max) */}
        <h3
          className="text-xl font-bold leading-snug line-clamp-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {dish_name}
        </h3>

        {/* Restaurant & Meta Info */}
        <div className="mt-1.5 space-y-0.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {restaurant_name}
            </span>
            {price && (
              <>
                <span style={{ color: 'var(--color-divider)' }}>•</span>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  ${Number(price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Rating summary line - subtle, not a big box */}
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {totalVotes === 0
              ? 'Be first to rate'
              : totalVotes < 10
                ? `${totalVotes} ${totalVotes === 1 ? 'vote' : 'votes'} so far`
                : `${totalVotes} votes · ${Math.round(percent_worth_it)}% would order again`
            }
          </p>
        </div>

        {/* Detailed Rating Section - only for 10+ votes */}
        {totalVotes >= 10 && (
          <div
            className="mt-4 p-4 rounded-xl"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)'
            }}
          >
            {/* Badge row */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xl">{badge.emoji}</span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {badge.label}
              </span>
            </div>

            {/* Stats Grid - Order based on view context */}
            <div className="grid grid-cols-2 gap-4">
              {showOrderAgainPercent ? (
                <>
                  {/* Confidence view: Order Again % is primary (ranking criterion) */}
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                      {Math.round(percent_worth_it)}%
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      would order again
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: getRatingColor(avg_rating) }}>
                      {avg_rating ? formatScore10(avg_rating) : '—'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      avg rating
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Discovery view: Avg Rating is primary (ranking criterion) */}
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: getRatingColor(avg_rating) }}>
                      {avg_rating ? formatScore10(avg_rating) : '—'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      avg rating
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {Math.round(percent_worth_it)}%
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      would order again
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Review Flow */}
        <div className="mt-4">
          <ReviewFlow
            dishId={dish_id}
            dishName={dish_name}
            restaurantId={restaurant_id}
            restaurantName={restaurant_name}
            category={category}
            price={price}
            totalVotes={totalVotes}
            yesVotes={yes_votes || 0}
            avgRating={avg_rating || null}
            onVote={onVote}
            onLoginRequired={onLoginRequired}
          />
        </div>
      </div>
    </article>
  )
})
