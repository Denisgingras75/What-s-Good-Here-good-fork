import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { TopDishCard } from './TopDishCard'

const TOP_DISHES_COUNT = 5

// Restaurant dishes component - Job #2: "What should I order?"
export function RestaurantDishes({ dishes, loading, error, onVote, onLoginRequired, isFavorite, onToggleFavorite, user, searchQuery = '', friendsVotesByDish = {}, restaurantName, restaurantTown }) {
  const [showAllDishes, setShowAllDishes] = useState(false)

  // Filter and sort dishes
  const sortedDishes = useMemo(() => {
    if (!dishes?.length) return { top: [], rest: [], filtered: false }

    // Filter by search query if provided
    let filteredDishes = dishes
    const query = searchQuery.toLowerCase().trim()
    if (query) {
      filteredDishes = dishes.filter(d =>
        (d.dish_name || '').toLowerCase().includes(query) ||
        (d.category || '').toLowerCase().includes(query)
      )
    }

    const sorted = [...filteredDishes].sort((a, b) => {
      const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      // Ranked dishes first
      if (aRanked && !bRanked) return -1
      if (!aRanked && bRanked) return 1
      // Then by granular rating score (avg_rating)
      const aRating = a.avg_rating || 0
      const bRating = b.avg_rating || 0
      if (bRating !== aRating) return bRating - aRating
      // Tie-breaker: percent_worth_it
      const aPct = a.percent_worth_it || 0
      const bPct = b.percent_worth_it || 0
      if (bPct !== aPct) return bPct - aPct
      // Final tie-breaker: vote count
      return (b.total_votes || 0) - (a.total_votes || 0)
    })

    return {
      top: sorted.slice(0, TOP_DISHES_COUNT),
      rest: sorted.slice(TOP_DISHES_COUNT),
      filtered: query.length > 0,
      totalMatches: filteredDishes.length,
    }
  }, [dishes, searchQuery])

  const rankedCount = dishes?.filter(d => (d.total_votes || 0) >= MIN_VOTES_FOR_RANKING).length || 0

  // Count unique friends who rated dishes here
  const uniqueFriends = useMemo(() => {
    const friendIds = new Set()
    Object.values(friendsVotesByDish).forEach(votes => {
      votes.forEach(v => friendIds.add(v.user_id))
    })
    return friendIds.size
  }, [friendsVotesByDish])

  if (loading) {
    return (
      <div className="px-4 py-6" role="status" aria-label="Loading dishes">
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

  const handleToggleSave = async (dishId) => {
    if (!user) {
      onLoginRequired()
      return
    }
    await onToggleFavorite(dishId)
  }

  return (
    <div className="px-4 py-5">
      {/* Section Header */}
      <div className="mb-5">
        <h3
          className="font-bold"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '18px',
            letterSpacing: '-0.01em',
          }}
        >
          {sortedDishes.filtered
            ? `Results for "${searchQuery}"`
            : rankedCount > 0
              ? "What's Good Here"
              : 'Help decide what to order here'
          }
        </h3>
        <p className="mt-1 font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
          {sortedDishes.filtered
            ? `${sortedDishes.totalMatches} ${sortedDishes.totalMatches === 1 ? 'dish' : 'dishes'} found`
            : rankedCount > 0
              ? `Top picks based on ${rankedCount} rated ${rankedCount === 1 ? 'dish' : 'dishes'}`
              : 'Vote on dishes to shape the rankings'
          }
        </p>
      </div>

      {/* Friends banner */}
      {uniqueFriends > 0 && (
        <div
          className="mb-4 px-3.5 py-3 rounded-xl flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(232, 102, 60, 0.06) 0%, rgba(232, 102, 60, 0.03) 100%)',
            border: '1px solid rgba(232, 102, 60, 0.12)',
          }}
        >
          {/* Stacked avatars */}
          <div className="flex -space-x-2 flex-shrink-0">
            {(() => {
              const seen = new Set()
              const friendList = []
              Object.values(friendsVotesByDish).forEach(votes => {
                votes.forEach(v => {
                  if (!seen.has(v.user_id)) {
                    seen.add(v.user_id)
                    friendList.push(v)
                  }
                })
              })
              return friendList.slice(0, 3).map((friend, i) => (
                <Link
                  key={friend.user_id}
                  to={`/user/${friend.user_id}`}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-2"
                  style={{
                    background: 'var(--color-primary)',
                    color: 'var(--color-text-on-primary)',
                    ringColor: 'var(--color-bg)',
                    zIndex: 3 - i,
                  }}
                >
                  {friend.display_name?.charAt(0).toUpperCase() || '?'}
                </Link>
              ))
            })()}
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {uniqueFriends} {uniqueFriends === 1 ? 'friend has' : 'friends have'} been here
          </p>
        </div>
      )}

      {/* Top Dishes */}
      {sortedDishes.top.length > 0 ? (
        <div className="space-y-3.5">
          {sortedDishes.top.map((dish, index) => (
            <TopDishCard
              key={dish.dish_id}
              dish={dish}
              rank={index + 1}
              onVote={onVote}
              onLoginRequired={onLoginRequired}
              isFavorite={isFavorite ? isFavorite(dish.dish_id) : false}
              onToggleFavorite={handleToggleSave}
              friendVotes={friendsVotesByDish[dish.dish_id]}
              restaurantName={restaurantName}
              restaurantTown={restaurantTown}
            />
          ))}
        </div>
      ) : (
        <div
          className="py-10 text-center rounded-xl"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232, 102, 60, 0.04) 0%, transparent 70%), var(--color-bg)`,
            border: '1px solid var(--color-divider)',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
          }}
        >
          <p className="font-semibold" style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            {sortedDishes.filtered
              ? `No dishes matching "${searchQuery}"`
              : 'No dishes at this restaurant yet'
            }
          </p>
          {sortedDishes.filtered && (
            <p className="mt-1.5 font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
              Try a different search term
            </p>
          )}
        </div>
      )}

      {/* More Dishes */}
      {sortedDishes.rest.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowAllDishes(!showAllDishes)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all active:scale-[0.99] hover:opacity-80"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-divider)',
              fontSize: '13px',
            }}
          >
            {showAllDishes ? 'Show less' : `See ${sortedDishes.rest.length} more dishes`}
            <svg
              className={`w-4 h-4 transition-transform ${showAllDishes ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAllDishes && (
            <div className="mt-4 space-y-3.5">
              {sortedDishes.rest.map((dish, index) => (
                <TopDishCard
                  key={dish.dish_id}
                  dish={dish}
                  rank={TOP_DISHES_COUNT + index + 1}
                  onVote={onVote}
                  onLoginRequired={onLoginRequired}
                  isFavorite={isFavorite ? isFavorite(dish.dish_id) : false}
                  onToggleFavorite={handleToggleSave}
                  friendVotes={friendsVotesByDish[dish.dish_id]}
                  restaurantName={restaurantName}
                  restaurantTown={restaurantTown}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
