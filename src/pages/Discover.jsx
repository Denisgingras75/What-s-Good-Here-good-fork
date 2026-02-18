import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpecials } from '../hooks/useSpecials'
import { useEvents } from '../hooks/useEvents'
import { useTrendingDishes, useRecentDishes } from '../hooks/useTrendingDishes'
import { SpecialCard } from '../components/SpecialCard'
import { EventCard } from '../components/EventCard'
import { getCategoryEmoji } from '../constants/categories'
import { restaurantsApi } from '../api/restaurantsApi'
import { logger } from '../utils/logger'

const FILTER_CHIPS = [
  { value: 'all', label: 'All' },
  { value: 'specials', label: 'Specials' },
  { value: 'live_music', label: 'Live Music' },
  { value: 'trivia', label: 'Trivia' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'other_events', label: 'Other Events' },
]

export function Discover() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const { specials, loading: specialsLoading, error: specialsError } = useSpecials()
  const { events, loading: eventsLoading, error: eventsError } = useEvents()
  const { trending, loading: trendingLoading } = useTrendingDishes(10)
  const { recent, loading: recentLoading } = useRecentDishes(8)
  const [newRestaurants, setNewRestaurants] = useState([])

  useEffect(() => {
    restaurantsApi.getRecentlyAdded(8, 14)
      .then(setNewRestaurants)
      .catch((err) => logger.error('Failed to fetch new restaurants:', err))
  }, [])

  const loading = specialsLoading || eventsLoading
  const error = specialsError || eventsError

  // #1 This Week — top trending dish
  const topDish = trending.length > 0 ? trending[0] : null

  const feed = useMemo(() => {
    let filteredSpecials = specials
    let filteredEvents = events

    if (filter === 'specials') {
      filteredEvents = []
    } else if (filter === 'live_music' || filter === 'trivia' || filter === 'comedy') {
      filteredSpecials = []
      filteredEvents = events.filter(e => e.event_type === filter)
    } else if (filter === 'other_events') {
      filteredSpecials = []
      filteredEvents = events.filter(e =>
        e.event_type === 'karaoke' || e.event_type === 'open_mic' || e.event_type === 'other'
      )
    }

    const promoted = []
    const regular = []

    for (const s of filteredSpecials) {
      const item = { ...s, _type: 'special' }
      if (s.is_promoted) promoted.push(item)
      else regular.push(item)
    }
    for (const e of filteredEvents) {
      const item = { ...e, _type: 'event' }
      if (e.is_promoted) promoted.push(item)
      else regular.push(item)
    }

    return promoted.concat(regular)
  }, [specials, events, filter])

  // Format "Added X days ago"
  function timeAgo(dateStr) {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Added today'
    if (days === 1) return 'Added yesterday'
    if (days < 7) return `Added ${days} days ago`
    if (days < 14) return 'Added last week'
    return `Added ${Math.floor(days / 7)} weeks ago`
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">Discover</h1>

      {/* Header */}
      <header className="px-4 pt-6 pb-4" style={{ background: 'var(--color-bg)' }}>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Discover
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          What's trending
        </p>
      </header>

      {/* #1 This Week Hero Card */}
      {topDish && (
        <div className="px-4 pt-4">
          <button
            onClick={() => navigate(`/dish/${topDish.dish_id}`)}
            className="w-full rounded-2xl p-4 text-left transition-all active:scale-[0.99]"
            style={{
              background: 'var(--color-card)',
              border: '2px solid var(--color-accent-gold)',
              boxShadow: 'var(--glow-gold)',
            }}
          >
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent-gold)' }}>
                #1 This Week
              </span>
            </div>
            <div className="flex items-center gap-3">
              {topDish.photo_url ? (
                <img
                  src={topDish.photo_url}
                  alt={topDish.dish_name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                  style={{ background: 'var(--color-surface-elevated)' }}
                >
                  {getCategoryEmoji(topDish.category)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {topDish.dish_name}
                </h3>
                <p className="text-sm truncate" style={{ color: 'var(--color-accent-gold)' }}>
                  {topDish.restaurant_name}
                </p>
              </div>
              {topDish.avg_rating && (
                <div
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-lg"
                  style={{
                    background: 'var(--color-accent-gold-muted)',
                    color: 'var(--color-accent-gold)',
                  }}
                >
                  {topDish.avg_rating}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {topDish.recent_votes} votes this week
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                · {topDish.total_votes} total
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Trending Now Section */}
      {trending.length > 1 && (
        <div className="pt-5">
          <div className="px-4 mb-3 flex items-center gap-2">
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Trending Now
            </h3>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Most voted this week
            </span>
          </div>
          <div
            className="flex gap-3 overflow-x-auto px-4 pb-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {trending.slice(1).map((dish) => (
              <button
                key={dish.dish_id}
                onClick={() => navigate(`/dish/${dish.dish_id}`)}
                className="flex-shrink-0 w-36 rounded-xl overflow-hidden text-left transition-all active:scale-[0.97]"
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-divider)',
                }}
              >
                {dish.photo_url ? (
                  <img
                    src={dish.photo_url}
                    alt={dish.dish_name}
                    className="w-full h-24 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-full h-24 flex items-center justify-center text-3xl"
                    style={{ background: 'var(--color-surface-elevated)' }}
                  >
                    {getCategoryEmoji(dish.category)}
                  </div>
                )}
                <div className="p-2.5">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {dish.dish_name}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {dish.restaurant_name}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                      {dish.recent_votes} votes
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New on the Menu Section */}
      {recent.length > 0 && (
        <div className="px-4 pt-5">
          <h3 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            New on the Menu
          </h3>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-divider)',
            }}
          >
            {recent.map((dish, i) => (
              <button
                key={dish.dish_id}
                onClick={() => navigate(`/dish/${dish.dish_id}`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors active:scale-[0.99]"
                style={{
                  borderBottom: i < recent.length - 1 ? '1px solid var(--color-divider)' : 'none',
                }}
              >
                <span className="text-lg flex-shrink-0">{getCategoryEmoji(dish.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {dish.dish_name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {dish.restaurant_name}
                  </p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
                  {timeAgo(dish.created_at)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recently added restaurants */}
      {newRestaurants.length > 0 && (
        <div className="px-4 pt-5">
          <h3 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Recently Added
          </h3>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-divider)',
            }}
          >
            {newRestaurants.map((r, i) => (
              <button
                key={r.id}
                onClick={() => navigate(`/restaurants/${r.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors active:scale-[0.99]"
                style={{
                  borderBottom: i < newRestaurants.length - 1 ? '1px solid var(--color-divider)' : 'none',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{ background: 'var(--color-accent-gold-muted)', color: 'var(--color-accent-gold)' }}
                >
                  NEW
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {r.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {r.cuisine ? `${r.cuisine} · ` : ''}{r.town}
                  </p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
                  {timeAgo(r.created_at)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section Divider */}
      {(trending.length > 0 || recent.length > 0 || newRestaurants.length > 0) && (feed.length > 0 || !loading) && (
        <div className="px-4 pt-6 pb-1">
          <div style={{ borderTop: '1px solid var(--color-divider)' }} />
        </div>
      )}

      {/* Filter Chips */}
      <div className="px-4 pt-3 pb-1 overflow-x-auto">
        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setFilter(chip.value)}
              className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={filter === chip.value
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { background: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)' }
              }
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {error ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
              {error?.message || 'Unable to load content'}
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl animate-pulse"
                style={{ background: 'var(--color-card)' }}
              />
            ))}
          </div>
        ) : feed.length > 0 ? (
          <div className="space-y-3">
            {feed.map((item) =>
              item._type === 'special' ? (
                <SpecialCard
                  key={`special-${item.id}`}
                  special={item}
                  promoted={item.is_promoted}
                />
              ) : (
                <EventCard
                  key={`event-${item.id}`}
                  event={item}
                  promoted={item.is_promoted}
                />
              )
            )}
          </div>
        ) : (
          <div
            className="text-center py-16 rounded-xl"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-divider)'
            }}
          >
            <img src="/empty-plate.png" alt="" className="w-14 h-14 mx-auto mb-3 rounded-full object-cover" />
            <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
              Nothing happening yet
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Check back soon for specials & events from local restaurants
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
