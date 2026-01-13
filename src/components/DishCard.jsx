import { ReviewFlow } from './ReviewFlow'
import { getWorthItBadge, formatScore10, calculateWorthItScore10 } from '../utils/ranking'
import { getCategoryImage } from '../constants/categoryImages'

export function DishCard({ dish, onVote, onLoginRequired }) {
  const {
    dish_id,
    dish_name,
    restaurant_name,
    category,
    price,
    photo_url,
    total_votes,
    yes_votes,
    percent_worth_it,
    avg_rating_10,
    distance_miles,
  } = dish

  const totalVotes = total_votes || 0
  const worthItScore10 = calculateWorthItScore10(percent_worth_it || 0)
  const badge = getWorthItBadge(worthItScore10, totalVotes)

  // Use photo_url if dish has one, otherwise use category-based image
  const imageUrl = photo_url || getCategoryImage(category)

  return (
    <article className="card-elevated overflow-hidden mb-6 stagger-item">
      {/* Dish Photo - Hero Element */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden group">
        <img
          src={imageUrl}
          alt={dish_name}
          className="w-full h-full object-cover image-zoom"
          loading="lazy"
        />

        {/* Subtle overlay for better text contrast if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Distance badge - floating on image */}
        {distance_miles && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-lg">
            <span className="text-xs font-semibold text-neutral-700">
              {Number(distance_miles).toFixed(1)} mi
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Dish Name - Primary Focus */}
        <h3 className="text-xl font-bold text-neutral-900 mb-1 leading-snug font-serif">
          {dish_name}
        </h3>

        {/* Restaurant & Price - Secondary Info */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
          <span className="font-medium">{restaurant_name}</span>
          {price && (
            <>
              <span className="text-neutral-300">•</span>
              <span className="font-semibold text-neutral-900">
                ${Number(price).toFixed(2)}
              </span>
            </>
          )}
        </div>

        {/* Rating Section */}
        {totalVotes === 0 ? (
          /* No votes yet */
          <div className="mb-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 border-dashed">
            <p className="text-sm text-neutral-500 text-center font-medium">
              No votes yet — be the first!
            </p>
          </div>
        ) : totalVotes < 10 ? (
          /* Not enough votes (1-9 votes) */
          <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">📊</span>
              <p className="text-sm text-amber-700 font-medium">
                Not enough votes yet ({totalVotes} {totalVotes === 1 ? 'vote' : 'votes'})
              </p>
            </div>
          </div>
        ) : (
          /* 10+ votes - Show full stats */
          <div className="mb-4 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100 space-y-3">
            {/* Worth-It Badge with Emoji */}
            <div className="flex items-center justify-center gap-2 pb-2 border-b border-orange-200/50">
              <span className="text-2xl">{badge.emoji}</span>
              <span className="text-lg font-bold text-neutral-800">{badge.label}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Would Order Again % */}
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900">
                  {percent_worth_it}%
                </div>
                <div className="text-xs text-neutral-500">would order again</div>
              </div>

              {/* Average Rating */}
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900">
                  {avg_rating_10 ? formatScore10(avg_rating_10) : '—'}
                  <span className="text-sm text-neutral-400">/10</span>
                </div>
                <div className="text-xs text-neutral-500">avg rating</div>
              </div>
            </div>

            {/* Vote count */}
            <div className="text-center pt-2 border-t border-orange-200/50">
              <span className="text-xs text-neutral-500 font-medium">
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
              </span>
            </div>
          </div>
        )}

        {/* Review Flow (replaces VoteButtons) */}
        <ReviewFlow
          dishId={dish_id}
          dishName={dish_name}
          category={category}
          totalVotes={totalVotes}
          yesVotes={yes_votes || 0}
          onVote={onVote}
          onLoginRequired={onLoginRequired}
        />
      </div>
    </article>
  )
}
