/**
 * Skeleton loading components for placeholder UI
 */

// DishRowSkeleton - matches DishRow layout (rank circle, image, text, rating area, arrow)
export function DishRowSkeleton() {
  return (
    <div
      className="w-full flex items-center gap-3 p-2.5 rounded-xl border"
      style={{
        background: 'var(--color-bg)',
        borderColor: 'var(--color-divider)'
      }}
    >
      {/* Rank circle */}
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 animate-pulse"
        style={{ background: 'var(--color-divider)' }}
      />

      {/* Photo */}
      <div
        className="w-12 h-12 rounded-lg flex-shrink-0 animate-pulse"
        style={{ background: 'var(--color-divider)' }}
      />

      {/* Dish + Restaurant text */}
      <div className="flex-1 min-w-0 space-y-2">
        <div
          className="h-4 rounded w-3/4 animate-pulse"
          style={{ background: 'var(--color-divider)' }}
        />
        <div
          className="h-3 rounded w-1/2 animate-pulse"
          style={{ background: 'var(--color-divider)' }}
        />
      </div>

      {/* Rating + Votes area */}
      <div className="flex-shrink-0 space-y-1.5 text-right">
        <div
          className="h-4 rounded w-14 ml-auto animate-pulse"
          style={{ background: 'var(--color-divider)' }}
        />
        <div
          className="h-2.5 rounded w-16 ml-auto animate-pulse"
          style={{ background: 'var(--color-divider)' }}
        />
      </div>

      {/* Arrow indicator */}
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 animate-pulse"
        style={{ background: 'var(--color-divider)' }}
      />
    </div>
  )
}

// DishCardSkeleton - matches BrowseCard layout (image, content area)
export function DishCardSkeleton() {
  return (
    <div
      className="w-full bg-white rounded-2xl overflow-hidden border"
      style={{ borderColor: 'var(--color-divider)' }}
    >
      {/* Image area with 16/10 aspect ratio */}
      <div
        className="aspect-[16/10] animate-pulse"
        style={{ background: 'var(--color-divider)' }}
      />

      {/* Content area */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Dish name */}
            <div
              className="h-5 rounded w-4/5 animate-pulse"
              style={{ background: 'var(--color-divider)' }}
            />
            {/* Restaurant + price */}
            <div
              className="h-4 rounded w-3/5 animate-pulse"
              style={{ background: 'var(--color-divider)' }}
            />
            {/* Rating info */}
            <div
              className="h-3 rounded w-2/5 animate-pulse"
              style={{ background: 'var(--color-divider)' }}
            />
          </div>

          {/* Tap indicator placeholder */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <div
              className="w-10 h-10 rounded-full animate-pulse"
              style={{ background: 'var(--color-divider)' }}
            />
            <div
              className="h-2 rounded w-6 animate-pulse"
              style={{ background: 'var(--color-divider)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
