import { RestaurantAvatar } from '../RestaurantAvatar'
import { CameraIcon } from '../CameraIcon'

/**
 * Card for unrated dishes (dishes with photos but no vote)
 * Shows the user's photo and prompts them to rate
 *
 * Props:
 * - dish: Dish data with photo info
 * - onClick: Callback when clicking to rate
 * - onDelete: Callback to delete the photo
 */
export function UnratedDishCard({ dish, onClick, onDelete }) {
  const imageUrl = dish.user_photo_url || dish.photo_url

  // Format time since photo was taken
  const timeSince = dish.photo_created_at
    ? new Date(dish.photo_created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <div
      className="w-full rounded-xl border overflow-hidden flex text-left hover:shadow-md transition-shadow"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
    >
      {/* Image with photo indicator - clickable to rate */}
      <button
        onClick={onClick}
        className="w-24 h-24 flex-shrink-0 relative"
        style={{ background: 'var(--color-surface-elevated)' }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={dish.dish_name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <RestaurantAvatar name={dish.restaurant_name} town={dish.restaurant_town} fill />
        )}
        {dish.user_photo_url && (
          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <CameraIcon size={14} />
            <span>Your photo</span>
          </div>
        )}
      </button>

      {/* Info - clickable to rate */}
      <button onClick={onClick} className="flex-1 p-3 flex flex-col justify-between min-w-0 text-left" aria-label={`Rate ${dish.dish_name} from ${dish.restaurant_name}`}>
        <div>
          <h3 className="font-semibold text-[color:var(--color-text-primary)] truncate">{dish.dish_name}</h3>
          <p className="text-sm text-[color:var(--color-text-secondary)] truncate">{dish.restaurant_name}</p>
        </div>

        <div className="flex items-center justify-between">
          {timeSince && (
            <span className="text-xs text-[color:var(--color-text-tertiary)]">Added {timeSince}</span>
          )}
          <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            Rate now →
          </span>
        </div>
      </button>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="px-3 flex items-center justify-center transition-colors"
        style={{ borderLeft: '1px solid var(--color-divider)', color: 'var(--color-red)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-red-muted)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        aria-label="Delete photo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

export default UnratedDishCard
