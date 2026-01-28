import { useRef, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { BrowseCard } from './BrowseCard'

// Estimated row height - BrowseCard needs ~450px at full desktop width to show all content
const ROW_HEIGHT = 450

/**
 * Virtualized dish list using react-window
 * Only renders visible items for better performance with large lists
 */
export function VirtualizedDishList({
  dishes,
  onDishClick,
  isFavorite,
  onToggleFavorite,
  columns = 2,
}) {
  const listRef = useRef(null)

  // Ensure dishes is always an array for hooks consistency
  const safeDishes = Array.isArray(dishes) ? dishes : []

  // Calculate items per row based on columns
  const itemsPerRow = columns
  const rowCount = Math.ceil(safeDishes.length / itemsPerRow)

  // Row renderer - renders 1 or 2 cards per row
  // Must be called unconditionally to satisfy React hooks rules
  const Row = useCallback(({ index, style }) => {
    const startIndex = index * itemsPerRow
    const rowDishes = safeDishes.slice(startIndex, startIndex + itemsPerRow)

    return (
      <div style={style} className="px-1">
        <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {rowDishes.map((dish) => (
            <BrowseCard
              key={dish.dish_id}
              dish={dish}
              onClick={() => onDishClick(dish)}
              isFavorite={isFavorite ? isFavorite(dish.dish_id) : false}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    )
  }, [safeDishes, itemsPerRow, columns, onDishClick, isFavorite, onToggleFavorite])

  // Early return AFTER all hooks to satisfy React hooks rules
  if (safeDishes.length === 0) {
    return null
  }

  // Don't virtualize lists under 500 items - virtualization creates a fixed-height
  // scroll container that causes card clipping issues at various screen widths
  if (safeDishes.length <= 500) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {safeDishes.map((dish) => (
          <BrowseCard
            key={dish?.dish_id || Math.random()}
            dish={dish}
            onClick={() => onDishClick(dish)}
            isFavorite={isFavorite ? isFavorite(dish?.dish_id) : false}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    )
  }

  return (
    <List
      ref={listRef}
      height={Math.min(rowCount * ROW_HEIGHT, window.innerHeight * 0.8)}
      itemCount={rowCount}
      itemSize={ROW_HEIGHT}
      width="100%"
      overscanCount={2}
      className="virtualized-dish-list"
    >
      {Row}
    </List>
  )
}
