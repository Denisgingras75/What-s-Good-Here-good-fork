import { RestaurantAvatar, getTownStyle } from './RestaurantAvatar'
import { getCategoryNeonImage } from '../constants/categories'

/**
 * Placeholder for dish cards without a user photo.
 * Shows full-bleed RestaurantAvatar with optional category neon icon overlay and photo CTA.
 */
export function DishPlaceholder({ restaurantName, restaurantTown, category, showCTA = false }) {
  const neonIcon = getCategoryNeonImage(category)
  const townStyle = getTownStyle(restaurantTown)

  return (
    <>
      {neonIcon ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: townStyle.bg }}
        >
          <img
            src={neonIcon}
            alt=""
            className="w-4/5 h-4/5 object-contain opacity-40"
          />
        </div>
      ) : (
        <RestaurantAvatar
          name={restaurantName}
          town={restaurantTown}
          fill
        />
      )}
      {showCTA && (
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
          <span className="text-xs font-medium text-white/90 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.04l-.821 1.315z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            Be first to snap this dish
          </span>
        </div>
      )}
    </>
  )
}
