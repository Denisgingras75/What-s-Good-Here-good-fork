import { DishSearch } from '../DishSearch'
import { TownPicker } from '../TownPicker'

/**
 * SearchHero - Hero section with value proposition, search, town filter, and category scroll
 */
export function SearchHero({ town, onTownChange, loading, categoryScroll }) {
  return (
    <section
      className="pt-8 pb-5"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="mb-5 text-center px-4">
        <h1
          className="font-bold mb-1"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '22px',
            letterSpacing: '-0.02em',
          }}
        >
          What's Good Here
        </h1>
        <p
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: '13px',
          }}
        >
          Ranked by people who know
        </p>
      </div>

      <div className="px-4">
        <DishSearch loading={loading} placeholder="What are you craving?" town={town} />
      </div>

      <div className="mt-4 text-center">
        <TownPicker town={town} onTownChange={onTownChange} />
      </div>

      {categoryScroll && (
        <div className="mt-4">
          {categoryScroll}
        </div>
      )}
    </section>
  )
}
