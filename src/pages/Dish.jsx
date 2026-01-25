import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { capture } from '../lib/analytics'
import { useAuth } from '../context/AuthContext'
import { logger } from '../utils/logger'
import { dishesApi } from '../api/dishesApi'
import { followsApi } from '../api/followsApi'
import { dishPhotosApi } from '../api/dishPhotosApi'
import { votesApi } from '../api/votesApi'
import { useFavorites } from '../hooks/useFavorites'
import { ReviewFlow } from '../components/ReviewFlow'
import { PhotoUploadButton } from '../components/PhotoUploadButton'
import { PhotoUploadConfirmation } from '../components/PhotoUploadConfirmation'
import { LoginModal } from '../components/Auth/LoginModal'
import { VariantSelector } from '../components/VariantPicker'
import { getCategoryImage } from '../constants/categoryImages'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor, formatScore10 } from '../utils/ranking'
import { formatRelativeTime } from '../utils/formatters'
import { ThumbsUpIcon } from '../components/ThumbsUpIcon'
import { ThumbsDownIcon } from '../components/ThumbsDownIcon'

/**
 * Transform raw dish data from API to component format
 */
function transformDish(data) {
  return {
    dish_id: data.id,
    dish_name: data.name,
    restaurant_id: data.restaurant_id,
    restaurant_name: data.restaurants?.name || 'Unknown',
    restaurant_address: data.restaurants?.address,
    category: data.category,
    price: data.price,
    photo_url: data.photo_url,
    total_votes: data.total_votes || 0,
    yes_votes: data.yes_votes || 0,
    percent_worth_it: data.total_votes > 0
      ? Math.round((data.yes_votes / data.total_votes) * 100)
      : 0,
    avg_rating: data.avg_rating,
    parent_dish_id: data.parent_dish_id,
    has_variants: data.has_variants,
  }
}

export function Dish() {
  const { dishId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [dish, setDish] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Variant state
  const [variants, setVariants] = useState([])
  const [parentDish, setParentDish] = useState(null)
  const [isVariant, setIsVariant] = useState(false)

  const [photoUploaded, setPhotoUploaded] = useState(null)
  const [featuredPhoto, setFeaturedPhoto] = useState(null)
  const [communityPhotos, setCommunityPhotos] = useState([])
  const [allPhotos, setAllPhotos] = useState([])
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [friendsVotes, setFriendsVotes] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const { isFavorite, toggleFavorite } = useFavorites(user?.id)

  // Fetch dish data
  useEffect(() => {
    if (!dishId) return

    const fetchDish = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await dishesApi.getDishById(dishId)
        const transformedDish = transformDish(data)
        setDish(transformedDish)

        // Track dish view - valuable for restaurants!
        capture('dish_viewed', {
          dish_id: transformedDish.dish_id,
          dish_name: transformedDish.dish_name,
          restaurant_id: transformedDish.restaurant_id,
          restaurant_name: transformedDish.restaurant_name,
          category: transformedDish.category,
          price: transformedDish.price,
          avg_rating: transformedDish.avg_rating,
          total_votes: transformedDish.total_votes,
          percent_worth_it: transformedDish.percent_worth_it,
        })
      } catch (err) {
        logger.error('Error fetching dish:', err)
        setError('Dish not found')
      } finally {
        setLoading(false)
      }
    }

    fetchDish()
  }, [dishId])

  // Fetch variant data (if parent has variants, or if this dish is a variant)
  useEffect(() => {
    if (!dish) {
      setVariants([])
      setParentDish(null)
      setIsVariant(false)
      return
    }

    const fetchVariantData = async () => {
      // Check if this dish has variants (is a parent)
      if (dish.has_variants) {
        try {
          const variantData = await dishesApi.getVariants(dish.dish_id || dish.id)
          setVariants(variantData)
          setIsVariant(false)
          setParentDish(null)
        } catch (err) {
          logger.error('Failed to fetch variants:', err)
          setVariants([])
        }
      }
      // Check if this dish is a variant (has a parent)
      else if (dish.parent_dish_id) {
        try {
          const [siblings, parent] = await Promise.all([
            dishesApi.getSiblingVariants(dish.dish_id || dish.id),
            dishesApi.getParentDish(dish.dish_id || dish.id),
          ])
          setVariants(siblings)
          setParentDish(parent)
          setIsVariant(true)
        } catch (err) {
          logger.error('Failed to fetch sibling variants:', err)
          setVariants([])
          setParentDish(null)
        }
      } else {
        setVariants([])
        setParentDish(null)
        setIsVariant(false)
      }
    }

    fetchVariantData()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only re-run on specific dish properties
  }, [dish?.dish_id, dish?.id, dish?.has_variants, dish?.parent_dish_id])

  // Fetch friends' votes for this dish
  useEffect(() => {
    if (!dishId || !user) {
      setFriendsVotes([])
      return
    }

    const fetchFriendsVotes = async () => {
      try {
        const votes = await followsApi.getFriendsVotesForDish(dishId)
        setFriendsVotes(votes)
      } catch (err) {
        logger.error('Failed to fetch friends votes:', err)
        setFriendsVotes([]) // Graceful degradation
      }
    }

    fetchFriendsVotes()
  }, [dishId, user])

  // Fetch reviews
  useEffect(() => {
    if (!dishId) return

    const fetchReviews = async () => {
      setReviewsLoading(true)
      try {
        const data = await votesApi.getReviewsForDish(dishId, { limit: 20 })
        setReviews(data)
      } catch (error) {
        logger.error('Failed to fetch reviews:', error)
        setReviews([])
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [dishId])

  // Fetch photos
  useEffect(() => {
    if (!dishId) return

    const fetchPhotos = async () => {
      try {
        const [featured, community, all] = await Promise.all([
          dishPhotosApi.getFeaturedPhoto(dishId),
          dishPhotosApi.getCommunityPhotos(dishId),
          dishPhotosApi.getAllVisiblePhotos(dishId),
        ])
        setFeaturedPhoto(featured)
        setCommunityPhotos(community)
        setAllPhotos(all)
      } catch (error) {
        logger.error('Failed to fetch photos:', error)
        // Gracefully degrade - show no photos
      }
    }

    fetchPhotos()
  }, [dishId])

  const handlePhotoUploaded = async (photo) => {
    setPhotoUploaded(photo)
    // Refresh photos
    try {
      const [featured, community, all] = await Promise.all([
        dishPhotosApi.getFeaturedPhoto(dishId),
        dishPhotosApi.getCommunityPhotos(dishId),
        dishPhotosApi.getAllVisiblePhotos(dishId),
      ])
      setFeaturedPhoto(featured)
      setCommunityPhotos(community)
      setAllPhotos(all)
    } catch (error) {
      logger.error('Failed to refresh photos after upload:', error)
    }
  }

  const handleVote = async () => {
    // Refetch dish data and reviews after voting
    try {
      const [data, reviewsData] = await Promise.all([
        dishesApi.getDishById(dishId),
        votesApi.getReviewsForDish(dishId, { limit: 20 }),
      ])
      const transformedDish = transformDish(data)
      setDish(transformedDish)
      setReviews(reviewsData)
    } catch (err) {
      logger.error('Failed to refresh dish data after vote:', err)
      // UI continues with stale data - vote was still recorded
    }
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  const handleToggleSave = async () => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    await toggleFavorite(dishId)
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  // Photos to display
  const displayPhotos = showAllPhotos ? allPhotos : communityPhotos.slice(0, 4)
  const hasMorePhotos = allPhotos.length > 4 && !showAllPhotos

  // Hero image
  const heroImage = featuredPhoto?.photo_url || dish?.photo_url || getCategoryImage(dish?.category)

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
        <div className="animate-pulse p-4">
          <div className="h-8 w-24 rounded mb-4" style={{ background: 'var(--color-divider)' }} />
          <div className="h-64 rounded-2xl mb-4" style={{ background: 'var(--color-divider)' }} />
          <div className="h-6 w-48 rounded mb-2" style={{ background: 'var(--color-divider)' }} />
          <div className="h-4 w-32 rounded" style={{ background: 'var(--color-divider)' }} />
        </div>
      </div>
    )
  }

  if (error || !dish) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
        <div className="text-center p-4">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-bg)' }}
          >
            <span className="text-2xl">🍽️</span>
          </div>
          <p className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Dish not found
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 text-sm font-medium rounded-lg"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const isRanked = dish.total_votes >= MIN_VOTES_FOR_RANKING

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--color-surface)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)' }}
      >
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {dish.dish_name}
        </span>

        {/* Favorite button */}
        <button
          onClick={handleToggleSave}
          aria-label={isFavorite?.(dishId) ? 'Remove from favorites' : 'Add to favorites'}
          className="ml-auto w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={isFavorite?.(dishId)
            ? { background: 'var(--color-danger)', color: 'white' }
            : { background: 'var(--color-surface-elevated)', color: 'var(--color-text-tertiary)' }
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFavorite?.(dishId) ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        </button>
      </header>

      {/* Photo confirmation after upload */}
      {photoUploaded ? (
        <div className="p-4">
          <PhotoUploadConfirmation
            dishName={dish.dish_name}
            photoUrl={photoUploaded.photo_url}
            status={photoUploaded.analysisResults?.status}
            onRateNow={() => setPhotoUploaded(null)}
            onLater={() => setPhotoUploaded(null)}
          />
        </div>
      ) : (
        <>
          {/* Hero Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={heroImage}
              alt={dish.dish_name}
              loading="lazy"
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Rating badge */}
            {isRanked && (
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
                <span className="text-lg font-bold" style={{ color: dish.avg_rating ? getRatingColor(dish.avg_rating) : 'white' }}>
                  {dish.avg_rating || `${dish.percent_worth_it}%`}
                </span>
                <span className="text-xs text-white/80 ml-1">
                  {dish.avg_rating ? 'rating' : 'say good here'}
                </span>
              </div>
            )}

            {/* Official badge if featured from restaurant */}
            {featuredPhoto?.source_type === 'restaurant' && (
              <div className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm">
                <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                  Official Photo
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Dish Info */}
            <div className="mb-6">
              {/* Parent dish breadcrumb if this is a variant */}
              {isVariant && parentDish && (
                <button
                  onClick={() => navigate(`/dish/${parentDish.id}`)}
                  className="flex items-center gap-1 text-xs font-medium mb-2 hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  {parentDish.name}
                </button>
              )}

              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {dish.dish_name}
              </h1>
              <button
                onClick={() => navigate(`/restaurants/${dish.restaurant_id}`)}
                className="text-base hover:underline"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {dish.restaurant_name}
              </button>
              {dish.price && (
                <span className="ml-2 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  · ${Number(dish.price).toFixed(0)}
                </span>
              )}

              {/* Vote info */}
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                {dish.total_votes === 0
                  ? 'Be the first to vote on this dish'
                  : isRanked
                    ? `${dish.total_votes} votes · ${dish.percent_worth_it}% say it's good here`
                    : `Early · ${dish.total_votes} vote${dish.total_votes === 1 ? '' : 's'} so far`
                }
              </p>

              {/* Variant Selector - show for parents with variants or variants with siblings */}
              {variants.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                    {isVariant ? 'Other flavors' : 'Available flavors'}
                  </p>
                  <VariantSelector
                    variants={variants}
                    currentDishId={dish.dish_id}
                    onSelect={(variant) => navigate(`/dish/${variant.dish_id}`)}
                  />
                </div>
              )}
            </div>

            {/* Friends who rated this */}
            {friendsVotes.length > 0 && (
              <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Friends who rated this
                </h3>
                <div className="space-y-3">
                  {friendsVotes.map((vote) => (
                    <Link
                      key={vote.user_id}
                      to={`/user/${vote.user_id}`}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-lg transition-colors hover:bg-[color:var(--color-surface-elevated)]"
                    >
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: 'var(--color-primary)' }}
                      >
                        {vote.display_name?.charAt(0).toUpperCase() || '?'}
                      </div>

                      {/* Name and verdict */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {vote.display_name || 'Anonymous'}
                        </p>
                        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          {vote.would_order_again ? <><ThumbsUpIcon size={20} /> Would order again</> : <><ThumbsDownIcon size={20} /> Would skip</>}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="text-right">
                        <span className="text-lg font-bold" style={{ color: getRatingColor(vote.rating_10) }}>
                          {formatScore10(vote.rating_10)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>/10</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Community Photos */}
            {displayPhotos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {showAllPhotos ? 'All Photos' : 'Community Photos'} ({displayPhotos.length})
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {displayPhotos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setLightboxPhoto(photo.photo_url)}
                      aria-label={`View photo of ${dish.dish_name}`}
                      className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={photo.photo_url}
                        alt={dish.dish_name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                {hasMorePhotos && (
                  <button
                    onClick={() => setShowAllPhotos(true)}
                    className="mt-3 text-sm font-medium"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    See all {allPhotos.length} photos
                  </button>
                )}
              </div>
            )}

            {/* Review Flow */}
            <div
              className="p-4 rounded-2xl mb-4"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}
            >
              <ReviewFlow
                dishId={dish.dish_id}
                dishName={dish.dish_name}
                restaurantId={dish.restaurant_id}
                restaurantName={dish.restaurant_name}
                category={dish.category}
                price={dish.price}
                totalVotes={dish.total_votes}
                yesVotes={dish.yes_votes}
                onVote={handleVote}
                onLoginRequired={handleLoginRequired}
              />
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Reviews ({reviews.length})
                </h3>
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 rounded-xl"
                      style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}
                    >
                      {/* Header: User info and rating */}
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          to={`/profile/${review.user_id}`}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                          {/* Avatar */}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ background: 'var(--color-primary)' }}
                          >
                            {review.profiles?.display_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              @{review.profiles?.display_name || 'Anonymous'}
                            </p>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{review.would_order_again ? <ThumbsUpIcon size={26} /> : <ThumbsDownIcon size={26} />}</span>
                          <span className="text-lg font-bold" style={{ color: getRatingColor(review.rating_10) }}>
                            {review.rating_10 ? formatScore10(review.rating_10) : ''}
                          </span>
                        </div>
                      </div>

                      {/* Review text */}
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {review.review_text}
                      </p>

                      {/* Timestamp */}
                      <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        {formatRelativeTime(review.review_created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No reviews message */}
            {!reviewsLoading && reviews.length === 0 && dish.total_votes > 0 && (
              <div
                className="mb-6 p-4 rounded-xl text-center"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}
              >
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  No written reviews yet — be the first to share your thoughts!
                </p>
              </div>
            )}

            {/* Photo Upload */}
            <PhotoUploadButton
              dishId={dish.dish_id}
              onPhotoUploaded={handlePhotoUploaded}
              onLoginRequired={handleLoginRequired}
            />
          </div>
        </>
      )}

      {/* Photo Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
          role="dialog"
          aria-label="Photo lightbox"
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl"
            onClick={() => setLightboxPhoto(null)}
            aria-label="Close lightbox"
          >
            ×
          </button>
          <img
            src={lightboxPhoto}
            alt={dish.dish_name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
