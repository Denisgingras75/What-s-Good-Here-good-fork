import { useState, useMemo } from 'react'
import { useSpecials } from '../hooks/useSpecials'
import { useEvents } from '../hooks/useEvents'
import { SpecialCard } from '../components/SpecialCard'
import { EventCard } from '../components/EventCard'

const FILTER_CHIPS = [
  { value: 'all', label: 'All' },
  { value: 'specials', label: 'Specials' },
  { value: 'live_music', label: 'Live Music' },
  { value: 'trivia', label: 'Trivia' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'other_events', label: 'Other Events' },
]

export function Discover() {
  const [filter, setFilter] = useState('all')
  const { specials, loading: specialsLoading, error: specialsError } = useSpecials()
  const { events, loading: eventsLoading, error: eventsError } = useEvents()

  const loading = specialsLoading || eventsLoading
  const error = specialsError || eventsError

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

    // Single pass: tag type and partition promoted vs regular
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

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">Local Hub</h1>

      {/* Header */}
      <header className="px-4 pt-6 pb-4" style={{ background: 'var(--color-bg)' }}>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Local Hub
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Specials, events & happenings on the island
        </p>
      </header>

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
