import { DishSearch } from '../DishSearch'

/**
 * SearchHero - Massive editorial title + compact search
 * Staggered entrance for premium feel
 */
export function SearchHero({ town, loading, onSearchChange }) {
  return (
    <section
      className="pt-10 pb-0"
      style={{ background: '#FFFFFF' }}
    >
      <div className="px-4 mb-4 stagger-item">
        <h1
          style={{
            fontFamily: "'aglet-sans', sans-serif",
            fontWeight: 800,
            color: '#1A1A1A',
            fontSize: '44px',
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
          }}
        >
          What's Good{' '}
          <span style={{ color: '#E4440A' }}>Here</span>
        </h1>
      </div>

      <div className="px-4 stagger-item">
        <DishSearch loading={loading} placeholder="What are you craving?" town={town} onSearchChange={onSearchChange} />
      </div>
    </section>
  )
}
