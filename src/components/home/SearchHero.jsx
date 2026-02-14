import { DishSearch } from '../DishSearch'

/**
 * SearchHero - Hero section with value proposition, search, and category scroll
 */
export function SearchHero({ town, loading, categoryScroll }) {
  return (
    <section
      className="pt-8 pb-5"
      style={{
        background: 'linear-gradient(180deg, rgba(232, 102, 60, 0.08) 0%, var(--color-bg) 100%)',
      }}
    >
      <div className="mb-5 text-center px-4">
        <h1
          className="font-bold mb-1"
          style={{
            color: 'var(--color-primary)',
            fontSize: '22px',
            letterSpacing: '-0.02em',
          }}
        >
          What's Good Here
        </h1>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '13px',
          }}
        >
          Ranked by people who know
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
