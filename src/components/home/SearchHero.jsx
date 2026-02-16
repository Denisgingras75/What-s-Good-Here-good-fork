import { DishSearch } from '../DishSearch'

/**
 * SearchHero - Hero section with value proposition, search, and category scroll
 */
export function SearchHero({ town, loading, categoryScroll }) {
  return (
    <section
      className="pt-8 pb-5 gradient-hero"
    >
      <div className="mb-5 text-center px-4">
        <h1
          className="font-bold mb-1 text-shadow-warm"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '30px',
            letterSpacing: '-0.02em',
          }}
        >
          What's <span className="glow-gold-text" style={{ color: 'var(--color-accent-gold)' }}>Good</span> Here
        </h1>
        <p
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: '14px',
          }}
        >
          Find what's actually good
        </p>
      </div>

      <div className="px-4">
        <DishSearch loading={loading} placeholder="What are you craving?" town={town} />
      </div>

      {categoryScroll && (
        <div className="mt-4">
          {categoryScroll}
        </div>
      )}
    </section>
  )
}
