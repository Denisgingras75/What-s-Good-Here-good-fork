import { useRef, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { BrowseCard } from './BrowseCard'

// Estimated row height - BrowseCard is roughly this tall
const ROW_HEIGHT = 320

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

  // Defensive: ensure dishes is an array before any operations
  if (!Array.isArray(dishes)) {
    console.error('VirtualizedDishList received non-array dishes:', dishes)
    return null
  }

  // Calculate items per row based on columns
  const itemsPerRow = columns
  const rowCount = Math.ceil(dishes.length / itemsPerRow)

  // Row renderer - renders 1 or 2 cards per row
  const Row = useCallback(({ index, style }) => {
    const startIndex = index * itemsPerRow
    const rowDishes = dishes.slice(startIndex, startIndex + itemsPerRow)

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
  }, [dishes, itemsPerRow, columns, onDishClick, isFavorite, onToggleFavorite])

  // Don't virtualize small lists - overhead not worth it
  if (dishes.length <= 10) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {dishes.map((dish) => (
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
