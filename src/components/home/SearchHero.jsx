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
          className="font-bold"
          style={{
            color: 'var(--color-primary)',
            fontSize: '22px',
            letterSpacing: '-0.02em',
            marginBottom: '6px',
          }}
        >
          What's Good Here
        </h1>
        <p
          className="font-medium"
          style={{
            color: '#C08B7A',
            opacity: 0.94,
            fontSize: '13px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
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
