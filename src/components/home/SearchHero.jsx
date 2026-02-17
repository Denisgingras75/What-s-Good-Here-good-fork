import { DishSearch } from '../DishSearch'

/**
 * SearchHero - Hero section with value proposition, search, and category scroll
 */
export function SearchHero({ town, loading, categoryScroll, onSearchChange }) {
  return (
    <section
      className="pt-8 pb-0"
      style={{ background: '#FFFFFF' }}
    >
      <div className="mb-3 text-center px-4">
        <h1
          style={{
            fontFamily: "'aglet-sans', sans-serif",
            fontWeight: 800,
            color: 'var(--color-primary)',
            fontSize: '32px',
            letterSpacing: '-0.03em',
            marginBottom: '14px',
            lineHeight: 1.15,
          }}
        >
          What's Good Here
        </h1>
        <p
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: '11.5px',
            fontWeight: 400,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}
        >
          the #1 bite near you
        </p>
      </div>

      <div className="px-4">
        <DishSearch loading={loading} placeholder="What are you craving?" town={town} onSearchChange={onSearchChange} />
      </div>

      {categoryScroll && (
        <div className="mt-4" style={{ position: 'relative' }}>
          <div className="py-3">
            {categoryScroll}
          </div>
        </div>
      )}
    </section>
  )
}
