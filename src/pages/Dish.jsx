import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { capture } from '../lib/analytics'
import { useAuth } from '../context/AuthContext'
import { logger } from '../utils/logger'
import { getCompatColor } from '../utils/formatters'
import { shareOrCopy, buildDishShareData } from '../utils/share'
import { toast } from 'sonner'
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
import { CATEGORY_INFO, getCategoryEmoji } from '../constants/categories'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor, formatScore10 } from '../utils/ranking'
import { formatRelativeTime } from '../utils/formatters'
import { ThumbsUpIcon } from '../components/ThumbsUpIcon'
import { ThumbsDownIcon } from '../components/ThumbsDownIcon'
import { HearingIcon } from '../components/HearingIcon'
import { ValueBadge } from '../components/browse/ValueBadge'
import { EarIconTooltip } from '../components/EarIconTooltip'
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../lib/storage'

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
    value_percentile: data.value_percentile,
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
  const [friendsCompat, setFriendsCompat] = useState({}) // { userId: compatibility_pct }
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const { isFavorite, toggleFavorite } = useFavorites(user?.id)

  // Ear icon tooltip — show once per device
  const [showEarTooltip, setShowEarTooltip] = useState(false)
  const tooltipChecked = useRef(false)

  useEffect(() => {
    if (dish && !tooltipChecked.current) {
      tooltipChecked.current = true
      if (!getStorageItem(STORAGE_KEYS.HAS_SEEN_EAR_TOOLTIP)) {
        setShowEarTooltip(true)
      }
    }
  }, [dish])

  function dismissEarTooltip() {
    setShowEarTooltip(false)
    setStorageItem(STORAGE_KEYS.HAS_SEEN_EAR_TOOLTIP, '1')
  }

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

  // Fetch photos, reviews, and friends' votes in parallel (all independent of each other)
  useEffect(() => {
    if (!dishId) return

    const fetchSecondaryData = async () => {
      setReviewsLoading(true)

      // Run all independent fetches in parallel
      const [photosResult, reviewsResult, friendsResult] = await Promise.allSettled([
        // Photos (3 calls, already parallelized internally)
        Promise.all([
          dishPhotosApi.getFeaturedPhoto(dishId),
          dishPhotosApi.getCommunityPhotos(dishId),
          dishPhotosApi.getAllVisiblePhotos(dishId),
        ]),
        // Reviews
        votesApi.getReviewsForDish(dishId, { limit: 20 }),
        // Friends' votes (only if user is logged in)
        user ? followsApi.getFriendsVotesForDish(dishId) : Promise.resolve([]),
      ])

      // Handle photos result
      if (photosResult.status === 'fulfilled') {
        const [featured, community, all] = photosResult.value
        setFeaturedPhoto(featured)
        setCommunityPhotos(community)
        setAllPhotos(all)
      } else {
        logger.error('Failed to fetch photos:', photosResult.reason)
      }

      // Handle reviews result
      if (reviewsResult.status === 'fulfilled') {
        setReviews(reviewsResult.value)
      } else {
        logger.error('Failed to fetch reviews:', reviewsResult.reason)
        setReviews([])
      }
      setReviewsLoading(false)

      // Handle friends' votes result
      if (friendsResult.status === 'fulfilled') {
        setFriendsVotes(friendsResult.value)
      } else {
        logger.error('Failed to fetch friends votes:', friendsResult.reason)
        setFriendsVotes([])
      }
    }

    fetchSecondaryData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishId, user, dish?.category])

  // Fetch taste compatibility for each friend who voted
  useEffect(() => {
    if (!user || friendsVotes.length === 0) {
      setFriendsCompat({})
      return
    }

    async function fetchCompat() {
      try {
        const results = await Promise.allSettled(
          friendsVotes.map(fv => followsApi.getTasteCompatibility(fv.user_id))
        )
        const compatMap = {}
        friendsVotes.forEach((fv, i) => {
          if (results[i].status === 'fulfilled' && results[i].value?.compatibility_pct != null) {
            compatMap[fv.user_id] = results[i].value.compatibility_pct
          }
        })
        setFriendsCompat(compatMap)
      } catch (err) {
        logger.error('Failed to fetch friends compatibility:', err)
      }
    }

    fetchCompat()
  }, [user, friendsVotes])

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
    } else if (dish?.restaurant_id) {
      navigate(`/restaurants/${dish.restaurant_id}`)
    } else {
      navigate('/')
    }
  }

  const handleShare = async () => {
    const shareData = buildDishShareData(dish)
    const result = await shareOrCopy(shareData)

    capture('dish_shared', {
      dish_id: dish.dish_id,
      dish_name: dish.dish_name,
      restaurant_name: dish.restaurant_name,
      context: 'dish_page',
      method: result.method,
      success: result.success,
    })

    if (result.success && result.method !== 'native') {
      toast.success('Link copied!', { duration: 2000 })
    }
  }

  // Photos to display
  const displayPhotos = showAllPhotos ? allPhotos : communityPhotos.slice(0, 4)
  const hasMorePhotos = allPhotos.length > 4 && !showAllPhotos

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
          <img
            src="/empty-plate.png"
            alt=""
            className="w-16 h-16 mx-auto mb-4 rounded-full object-cover"
          />
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

        <div className="ml-auto flex items-center gap-1">
          {/* Share button */}
          <button
            onClick={handleShare}
            aria-label="Share dish"
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 opacity-80 hover:opacity-100"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>

          {/* Heard it was good here button */}
          <div className="relative">
            <button
              onClick={(e) => {
                if (showEarTooltip) dismissEarTooltip()
                handleToggleSave(e)
              }}
              aria-label={isFavorite?.(dishId) ? 'Remove from heard list' : 'Mark as heard it was good'}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                isFavorite?.(dishId)
                  ? 'ring-2 ring-[var(--color-primary)]/50'
                  : 'opacity-80 hover:opacity-100'
              }`}
              style={{ background: 'var(--color-bg)' }}
            >
              <HearingIcon size={28} active={isFavorite?.(dishId)} />
            </button>
            <EarIconTooltip visible={showEarTooltip} onDismiss={dismissEarTooltip} />
          </div>
        </div>
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
          {/* Rating-First Header */}
          <div className="p-4">
            <div className="mb-6">
              {/* Parent dish breadcrumb if this is a variant */}
              {isVariant && parentDish && (
                <button
                  onClick={() => navigate(`/dish/${parentDish.id}`)}
                  className="flex items-center gap-1 text-xs font-medium mb-3 hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  {parentDish.name}
                </button>
              )}

              {/* Emoji + Name + Featured thumbnail */}
              <div className="flex items-start gap-3">
                <span style={{ fontSize: '44px', lineHeight: 1 }}>
                  {getCategoryEmoji(dish.category)}
                </span>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {dish.dish_name}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <button
                      onClick={() => navigate(`/restaurants/${dish.restaurant_id}`)}
                      className="text-sm hover:underline"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {dish.restaurant_name}
                    </button>
                    {dish.price && (
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        · ${Number(dish.price).toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
                {/* Small featured photo thumbnail if exists */}
                {featuredPhoto?.photo_url && (
                  <button
                    onClick={() => setLightboxPhoto(featuredPhoto.photo_url)}
                    className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden"
                    aria-label="View featured photo"
                  >
                    <img
                      src={featuredPhoto.photo_url}
                      alt={dish.dish_name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
              </div>

              {/* Rating Hero Block */}
              <div
                className="mt-4 p-4 rounded-xl flex items-center gap-4"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}
              >
                {isRanked ? (
                  <>
                    <div className="text-center">
                      <span
                        className="text-4xl font-bold"
                        style={{ color: getRatingColor(dish.avg_rating) }}
                      >
                        {dish.avg_rating}
                      </span>
                      <span className="text-lg" style={{ color: 'var(--color-text-tertiary)' }}>/10</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {dish.percent_worth_it}% would order again
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {dish.total_votes} votes
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {dish.percent_worth_it >= 90 && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                          style={{ background: 'var(--color-accent-gold-muted)', color: 'var(--color-accent-gold)' }}
                        >
                          GREAT
                        </span>
                      )}
                      {dish.percent_worth_it >= 80 && dish.percent_worth_it < 90 && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide"
                          style={{ background: 'rgba(107, 179, 132, 0.15)', color: 'var(--color-rating)' }}
                        >
                          Good Here
                        </span>
                      )}
                      <ValueBadge valuePercentile={dish.value_percentile} />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 text-center py-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {dish.total_votes === 0
                        ? 'Be the first to rate this dish'
                        : `Early · ${dish.total_votes} vote${dish.total_votes === 1 ? '' : 's'} so far`
                      }
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      {MIN_VOTES_FOR_RANKING - dish.total_votes} more vote{MIN_VOTES_FOR_RANKING - dish.total_votes === 1 ? '' : 's'} to rank
                    </p>
                  </div>
                )}
              </div>

              {/* Variant Selector */}
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
                  {friendsVotes.map((vote) => {
                    const categoryLabel = CATEGORY_INFO[dish.category]?.label || dish.category
                    const expertiseLabel = vote.category_expertise === 'authority'
                      ? `${categoryLabel} Authority`
                      : vote.category_expertise === 'specialist'
                        ? `${categoryLabel} Specialist`
                        : null

                    return (
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

                        {/* Name, expertise, and verdict */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {vote.display_name || 'Anonymous'}
                            </p>
                            {expertiseLabel && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                                style={{
                                  background: vote.category_expertise === 'authority' ? 'rgba(147, 51, 234, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                                  color: vote.category_expertise === 'authority' ? 'var(--color-purple)' : 'var(--color-blue)',
                                }}
                              >
                                {expertiseLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
                            {vote.would_order_again ? <><ThumbsUpIcon size={20} /> Would order again</> : <><ThumbsDownIcon size={20} /> Would skip</>}
                            {friendsCompat[vote.user_id] != null && (
                              <span className="ml-1.5 font-medium" style={{ color: getCompatColor(friendsCompat[vote.user_id]) }}>
                                · {friendsCompat[vote.user_id]}% match
                              </span>
                            )}
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
                    )
                  })}
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
                        onError={(e) => {
                          // Hide broken images
                          e.target.parentElement.style.display = 'none'
                        }}
                      />
                    </button>
                  ))}
                </div>
                {hasMorePhotos && (
                  <button
                    onClick={() => setShowAllPhotos(true)}
                    className="mt-3 text-sm font-medium"
                    style={{ color: 'var(--color-link-secondary)' }}
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
                          to={`/user/${review.user_id}`}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.9)' }}
          onClick={() => setLightboxPhoto(null)}
          role="dialog"
          aria-label="Photo lightbox"
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-2xl"
            style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'var(--color-text-primary)' }}
            onClick={() => setLightboxPhoto(null)}
            aria-label="Close lightbox"
          >
            ×
          </button>
          <img
            src={lightboxPhoto}
            alt={dish.dish_name}
            className="max-w-full max-h-full object-contain"
            onError={() => {
              // Close lightbox if image fails to load
              setLightboxPhoto(null)
            }}
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
