import { useMemo } from 'react'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { TopDishCard } from './TopDishCard'

// Restaurant menu view - dishes grouped by menu_section to mirror the restaurant's actual menu
export function RestaurantMenu({ dishes, loading, error, onVote, onLoginRequired, isFavorite, onToggleFavorite, user, searchQuery = '', friendsVotesByDish = {}, menuSectionOrder = [] }) {

  // Group dishes by menu_section, ordered by restaurant's menu_section_order
  const sectionGroups = useMemo(() => {
    if (!dishes?.length) return { sections: [], uncategorized: [] }

    // Filter by search query if provided
    let filteredDishes = dishes
    const query = searchQuery.toLowerCase().trim()
    if (query) {
      filteredDishes = dishes.filter(d =>
        (d.dish_name || '').toLowerCase().includes(query) ||
        (d.category || '').toLowerCase().includes(query) ||
        (d.menu_section || '').toLowerCase().includes(query)
      )
    }

    // Split into sectioned and uncategorized
    const groups = {}
    const uncategorized = []
    filteredDishes.forEach(dish => {
      const section = dish.menu_section
      if (!section) {
        uncategorized.push(dish)
        return
      }
      if (!groups[section]) {
        groups[section] = []
      }
      groups[section].push(dish)
    })

    // Sort dishes within each group
    const sortDishes = (arr) => {
      arr.sort((a, b) => {
        const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
        const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
        if (aRanked && !bRanked) return -1
        if (!aRanked && bRanked) return 1
        const aRating = a.avg_rating || 0
        const bRating = b.avg_rating || 0
        if (bRating !== aRating) return bRating - aRating
        const aPct = a.percent_worth_it || 0
        const bPct = b.percent_worth_it || 0
        if (bPct !== aPct) return bPct - aPct
        return (b.total_votes || 0) - (a.total_votes || 0)
      })
    }

    Object.values(groups).forEach(sortDishes)
    sortDishes(uncategorized)

    // Order sections by menu_section_order, then alphabetical for any not in the list
    const sectionKeys = Object.keys(groups)
    sectionKeys.sort((a, b) => {
      const aIndex = menuSectionOrder.indexOf(a)
      const bIndex = menuSectionOrder.indexOf(b)
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.localeCompare(b)
    })

    return {
      sections: sectionKeys.map(key => ({
        name: key,
        dishes: groups[key],
      })),
      uncategorized,
    }
  }, [dishes, searchQuery, menuSectionOrder])

  const handleToggleSave = async (dishId) => {
    if (!user) {
      onLoginRequired()
      return
    }
    await onToggleFavorite(dishId)
  }

  if (loading) {
    return (
      <div className="px-4 py-6" role="status" aria-label="Loading menu">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-divider)' }} aria-hidden="true" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error?.message || error}</p>
      </div>
    )
  }

  const hasSections = sectionGroups.sections.length > 0
  const hasUncategorized = sectionGroups.uncategorized.length > 0

  if (!hasSections && !hasUncategorized) {
    return (
      <div className="px-4 py-5">
        <div
          className="py-10 text-center rounded-xl"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200, 90, 84, 0.04) 0%, transparent 70%), var(--color-bg)',
            border: '1px solid var(--color-divider)',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.2)',
          }}
        >
          <p className="font-semibold" style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            {searchQuery
              ? `No dishes matching "${searchQuery}"`
              : 'Menu not set up yet'
            }
          </p>
          {!searchQuery && (
            <p className="mt-1.5 font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
              Check back soon
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-5">
      {sectionGroups.sections.map((section, sectionIndex) => (
        <div key={section.name} className={sectionIndex > 0 ? 'mt-6' : ''}>
          {/* Menu Section Header */}
          <div
            className="flex items-center gap-3 mb-3 pb-2"
            style={{
              borderBottom: '1px solid var(--color-divider)',
            }}
          >
            <div
              className="w-0.5 h-5 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(180deg, var(--color-accent-gold) 0%, rgba(217, 167, 101, 0.3) 100%)' }}
            />
            <h3
              className="font-bold"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: '15px',
                letterSpacing: '-0.01em',
              }}
            >
              {section.name}
            </h3>
            <span
              className="font-medium"
              style={{
                color: 'var(--color-text-tertiary)',
                fontSize: '12px',
              }}
            >
              {section.dishes.length}
            </span>
          </div>

          {/* Dishes in this section */}
          <div className="space-y-3.5">
            {section.dishes.map((dish) => (
              <TopDishCard
                key={dish.dish_id}
                dish={dish}
                rank={null}
                onVote={onVote}
                onLoginRequired={onLoginRequired}
                isFavorite={isFavorite ? isFavorite(dish.dish_id) : false}
                onToggleFavorite={handleToggleSave}
                friendVotes={friendsVotesByDish[dish.dish_id]}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Uncategorized dishes (no menu_section set) */}
      {hasUncategorized && (
        <div className={hasSections ? 'mt-6' : ''}>
          {hasSections && (
            <div
              className="flex items-center gap-3 mb-3 pb-2"
              style={{
                borderBottom: '1px solid var(--color-divider)',
              }}
            >
              <div
                className="w-0.5 h-5 rounded-full flex-shrink-0"
                style={{ background: 'linear-gradient(180deg, var(--color-accent-gold) 0%, rgba(217, 167, 101, 0.3) 100%)' }}
              />
              <h3
                className="font-bold"
                style={{
                  color: 'var(--color-text-primary)',
                  fontSize: '15px',
                  letterSpacing: '-0.01em',
                }}
              >
                Other
              </h3>
              <span
                className="font-medium"
                style={{
                  color: 'var(--color-text-tertiary)',
                  fontSize: '12px',
                }}
              >
                {sectionGroups.uncategorized.length}
              </span>
            </div>
          )}
          <div className="space-y-3.5">
            {sectionGroups.uncategorized.map((dish) => (
              <TopDishCard
                key={dish.dish_id}
                dish={dish}
                rank={null}
                onVote={onVote}
                onLoginRequired={onLoginRequired}
                isFavorite={isFavorite ? isFavorite(dish.dish_id) : false}
                onToggleFavorite={handleToggleSave}
                friendVotes={friendsVotesByDish[dish.dish_id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
