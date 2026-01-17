import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dishesApi } from '../api'
import { dishPhotosApi } from '../api/dishPhotosApi'
import { useSavedDishes } from '../hooks/useSavedDishes'
import { ReviewFlow } from '../components/ReviewFlow'
import { PhotoUploadButton } from '../components/PhotoUploadButton'
import { PhotoUploadConfirmation } from '../components/PhotoUploadConfirmation'
import { LoginModal } from '../components/Auth/LoginModal'
import { getCategoryImage } from '../constants/categoryImages'

export function Dish() {
  const { dishId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [dish, setDish] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [photoUploaded, setPhotoUploaded] = useState(null)
  const [featuredPhoto, setFeaturedPhoto] = useState(null)
  const [communityPhotos, setCommunityPhotos] = useState([])
  const [allPhotos, setAllPhotos] = useState([])
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const { isSaved, toggleSave } = useSavedDishes(user?.id)

  // Fetch dish data
  useEffect(() => {
    if (!dishId) return

    const fetchDish = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await dishesApi.getDishById(dishId)

        // Transform to match expected format
        const transformedDish = {
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
        }

        setDish(transformedDish)
      } catch (err) {
        console.error('Error fetching dish:', err)
        setError('Dish not found')
      } finally {
        setLoading(false)
      }
    }

    fetchDish()
  }, [dishId])

  // Fetch photos
  useEffect(() => {
    if (!dishId) return

    const fetchPhotos = async () => {
      const [featured, community, all] = await Promise.all([
        dishPhotosApi.getFeaturedPhoto(dishId),
        dishPhotosApi.getCommunityPhotos(dishId),
        dishPhotosApi.getAllVisiblePhotos(dishId),
      ])
      setFeaturedPhoto(featured)
      setCommunityPhotos(community)
      setAllPhotos(all)
    }

    fetchPhotos()
  }, [dishId])

  const handlePhotoUploaded = async (photo) => {
    setPhotoUploaded(photo)
    // Refresh photos
    const [featured, community, all] = await Promise.all([
      dishPhotosApi.getFeaturedPhoto(dishId),
      dishPhotosApi.getCommunityPhotos(dishId),
      dishPhotosApi.getAllVisiblePhotos(dishId),
    ])
    setFeaturedPhoto(featured)
    setCommunityPhotos(community)
    setAllPhotos(all)
  }

  const handleVote = async () => {
    // Refetch dish data after voting
    const data = await dishesApi.getDishById(dishId)
    const transformedDish = {
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
    }
    setDish(transformedDish)
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  const handleToggleSave = async () => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    await toggleSave(dishId)
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

  const MIN_VOTES_FOR_RANKING = 5
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
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors"
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
          className={`ml-auto w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isSaved?.(dishId)
              ? 'bg-red-500 text-white'
              : 'bg-neutral-100 text-neutral-400 hover:text-red-500'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isSaved?.(dishId) ? 'currentColor' : 'none'}
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
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Rating badge */}
            {isRanked && (
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
                <span className="text-lg font-bold text-white">
                  {dish.avg_rating ? `${dish.avg_rating}/10` : `${dish.percent_worth_it}%`}
                </span>
                <span className="text-xs text-white/80 ml-1">
                  {dish.avg_rating ? 'rating' : 'would order again'}
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
                  ? 'Be the first to rate this dish'
                  : isRanked
                    ? `${dish.total_votes} votes · ${dish.percent_worth_it}% would order again`
                    : `${dish.total_votes} of ${MIN_VOTES_FOR_RANKING} votes to rank`
                }
              </p>
            </div>

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
                      className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={photo.photo_url}
                        alt={dish.dish_name}
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
                category={dish.category}
                totalVotes={dish.total_votes}
                yesVotes={dish.yes_votes}
                onVote={handleVote}
                onLoginRequired={handleLoginRequired}
              />
            </div>

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
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl"
            onClick={() => setLightboxPhoto(null)}
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
