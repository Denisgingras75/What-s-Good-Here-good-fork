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
import { PhotoUploadConfirmation } from '../components/PhotoUploadConfirmation'
import { LoginModal } from '../components/Auth/LoginModal'
import { VariantSelector } from '../components/VariantPicker'
import { DishPlaceholder } from '../components/DishPlaceholder'
import { PhotoUploadButton } from '../components/PhotoUploadButton'
import { TrustBadge, TrustSummary } from '../components/TrustBadge'
import { ValueBadge } from '../components/browse/ValueBadge'
import { CATEGORY_INFO } from '../constants/categories'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor, formatScore10 } from '../utils/ranking'
import { formatRelativeTime } from '../utils/formatters'
import { ThumbsUpIcon } from '../components/ThumbsUpIcon'
import { ThumbsDownIcon } from '../components/ThumbsDownIcon'
import { HearingIcon } from '../components/HearingIcon'
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
    restaurant_town: data.restaurants?.town,
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

  // Hero image — only use real photos, fall back to RestaurantAvatar placeholder
  const heroImage = featuredPhoto?.photo_url || dish?.photo_url

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-surface-elevated)' }}>
        <div className="animate-pulse">
          <div className="aspect-[4/3] w-full" style={{ background: 'var(--color-divider)' }} />
          <div
            className="mx-4 -mt-5 rounded-xl p-5 space-y-3"
            style={{ background: 'var(--color-surface-elevated)', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}
          >
            <div className="h-6 w-48 rounded" style={{ background: 'var(--color-divider)' }} />
            <div className="h-4 w-32 rounded" style={{ background: 'var(--color-divider)' }} />
            <div className="flex items-end justify-between pt-2">
              <div className="h-10 w-14 rounded" style={{ background: 'var(--color-divider)' }} />
              <div className="h-4 w-24 rounded" style={{ background: 'var(--color-divider)' }} />
            </div>
          </div>
          <div className="p-4 mt-4 space-y-3">
            <div className="h-4 w-48 rounded" style={{ background: 'var(--color-divider)' }} />
            <div className="h-4 w-32 rounded" style={{ background: 'var(--color-divider)' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !dish) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
        <div className="text-center p-4">
          <img
            src="/empty-plate.png"
            alt=""
            className="w-16 h-16 mx-auto mb-4 rounded-full object-cover"
          />
          <p className="font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Dish not found
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-5 py-2.5 text-sm font-bold rounded-lg card-press"
            style={{
              background: 'var(--color-primary)',
              color: '#FFFFFF',
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const isRanked = dish.total_votes >= MIN_VOTES_FOR_RANKING

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--color-surface-elevated)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3 top-bar"
        style={{
          background: 'var(--color-surface-elevated)',
        }}
      >
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {dish.dish_name}
        </span>

        <div className="ml-auto flex items-center gap-1">
          {/* Share button */}
          <button
            onClick={handleShare}
            aria-label="Share dish"
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{ color: 'var(--color-text-primary)' }}
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
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ background: 'var(--color-surface-elevated)' }}
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
          {/* Hero Image — full photo when available, compact strip when not */}
          {heroImage ? (
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={heroImage}
                alt={dish.dish_name}
                loading="lazy"
                className="w-full h-full object-cover"
              />

              {/* Official badge if featured from restaurant */}
              {featuredPhoto?.source_type === 'restaurant' && (
                <div
                  className="absolute top-4 right-4 px-2.5 py-1 rounded-lg"
                  style={{
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-divider)',
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                    Official Photo
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="relative overflow-hidden flex items-center justify-center"
              style={{ height: '48px', background: 'var(--color-surface)' }}
            >
              <DishPlaceholder restaurantName={dish.restaurant_name} restaurantTown={dish.restaurant_town} category={dish.category} />
            </div>
          )}

          {/* Stats Card — overlapping hero when photo exists, flush when no photo */}
          <div
            className="mx-4 rounded-xl px-5 py-3"
            style={{
              background: 'var(--color-surface-elevated)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
              marginTop: heroImage ? '-20px' : '0',
              position: 'relative',
              zIndex: 5,
            }}
          >
            {/* Parent dish breadcrumb if this is a variant */}
            {isVariant && parentDish && (
              <button
                onClick={() => navigate(`/dish/${parentDish.id}`)}
                className="flex items-center gap-1 text-xs font-bold mb-3"
                style={{ color: 'var(--color-primary)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {parentDish.name}
              </button>
            )}

            {/* Dish name + price */}
            <div className="flex items-start justify-between gap-3">
              <h1
                style={{
                  fontFamily: "'aglet-sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '24px',
                  letterSpacing: '-0.02em',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                {dish.dish_name}
              </h1>
              {dish.price ? (
                <span
                  className="flex-shrink-0 font-bold"
                  style={{ color: 'var(--color-text-primary)', fontSize: '18px' }}
                >
                  ${Number(dish.price).toFixed(0)}
                </span>
              ) : null}
            </div>

            {/* Restaurant link */}
            <button
              onClick={() => navigate(`/restaurants/${dish.restaurant_id}`)}
              className="flex items-center gap-1 mt-1.5"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-tertiary)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {dish.restaurant_name}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Rating + votes row — only show when ranked */}
            {isRanked && dish.avg_rating ? (
              <div className="flex items-end justify-between mt-3">
                <div className="flex-shrink-0">
                  <span
                    style={{
                      fontFamily: "'aglet-sans', sans-serif",
                      fontWeight: 800,
                      fontSize: '44px',
                      lineHeight: 1,
                      color: getRatingColor(dish.avg_rating),
                    }}
                  >
                    {formatScore10(dish.avg_rating)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {dish.total_votes} vote{dish.total_votes === 1 ? '' : 's'}
                  </p>
                  <ValueBadge valuePercentile={dish.value_percentile} />
                </div>
              </div>
            ) : null}

          </div>

          {/* Content */}
          <div className="p-4">
            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {isVariant ? 'Other flavors' : 'Available flavors'}
                </p>
                <VariantSelector
                  variants={variants}
                  currentDishId={dish.dish_id}
                  onSelect={(variant) => navigate(`/dish/${variant.dish_id}`)}
                />
              </div>
            )}

            {/* Friends who rated this */}
            {friendsVotes.length > 0 && (
              <div
                className="mb-6 p-4 rounded-xl"
                style={{
                  background: 'var(--color-surface-elevated)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                }}
              >
                <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
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
                        className="flex items-center gap-3 p-2 -mx-2 rounded-lg"
                      >
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                          style={{ background: 'var(--color-primary)', color: '#FFFFFF' }}
                        >
                          {vote.display_name?.charAt(0).toUpperCase() || '?'}
                        </div>

                        {/* Name, expertise, and verdict */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {vote.display_name || 'Anonymous'}
                            </p>
                            {expertiseLabel && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                                style={{
                                  background: vote.category_expertise === 'authority' ? 'rgba(147, 51, 234, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                                  color: vote.category_expertise === 'authority' ? '#9333EA' : '#3B82F6',
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
                                &middot; {friendsCompat[vote.user_id]}% match
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Rating */}
                        <div className="text-right">
                          <span className="text-lg font-bold" style={{ color: getRatingColor(vote.rating_10) }}>
                            {formatScore10(vote.rating_10)}
                          </span>
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
                <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Photos ({displayPhotos.length})
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {displayPhotos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setLightboxPhoto(photo.photo_url)}
                      aria-label={`View photo of ${dish.dish_name}`}
                      className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                      style={{ border: '1px solid var(--color-divider)' }}
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
                    className="mt-3 text-sm font-bold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    See all {allPhotos.length} photos
                  </button>
                )}
              </div>
            )}

            {/* Review Flow */}
            <div
              className="p-4 rounded-xl mb-4"
              style={{
                background: 'var(--color-surface-elevated)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
              }}
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
                percentWorthIt={dish.percent_worth_it}
                isRanked={isRanked}
                hasPhotos={allPhotos.length > 0}
                onVote={handleVote}
                onLoginRequired={handleLoginRequired}
                onPhotoUploaded={handlePhotoUploaded}
                onToggleFavorite={handleToggleSave}
                isFavorite={isFavorite?.(dishId)}
              />
            </div>

            {/* Reviews Section — flowing list with dividers */}
            {reviews.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Reviews ({reviews.length})
                  </h3>
                  <TrustSummary
                    verifiedCount={reviews.filter(r => r.trust_badge === 'human_verified' || r.trust_badge === 'trusted_reviewer').length}
                    aiCount={reviews.filter(r => r.trust_badge === 'ai_estimated').length}
                  />
                </div>
                <div>
                  {reviews.map((review, index) => (
                    <div
                      key={review.id}
                      className="py-4"
                      style={index < reviews.length - 1 ? { borderBottom: '1px solid var(--color-divider)' } : undefined}
                    >
                      {/* Header: User info and rating */}
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          to={`/user/${review.user_id}`}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                          {/* Avatar */}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                            style={{ background: 'var(--color-primary)', color: '#FFFFFF' }}
                          >
                            {review.profiles?.display_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                @{review.profiles?.display_name || 'Anonymous'}
                              </p>
                              <TrustBadge type={review.trust_badge} />
                            </div>
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
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}
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
            style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }}
            onClick={() => setLightboxPhoto(null)}
            aria-label="Close lightbox"
          >
            &times;
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
