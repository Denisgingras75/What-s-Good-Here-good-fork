import { DishSearch } from '../DishSearch'

/**
 * SearchHero - Hero section with value proposition, search, and category scroll
 */
export function SearchHero({ town, loading, categoryScroll }) {
  return (
    <section
      className="pt-8 pb-5"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="mb-3 text-center px-4">
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            color: 'var(--color-primary)',
            fontSize: '28px',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            lineHeight: 1.2,
          }}
        >
          What's Good Here
        </h1>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            opacity: 0.7,
            fontSize: '12.5px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}
        >
          the #1 bite near you
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
