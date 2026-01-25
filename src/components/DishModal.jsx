import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ReviewFlow } from './ReviewFlow'
import { PhotoUploadButton } from './PhotoUploadButton'
import { PhotoUploadConfirmation } from './PhotoUploadConfirmation'
import { dishPhotosApi } from '../api/dishPhotosApi'
import { logger } from '../utils/logger'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { getResponsiveImageProps } from '../utils/images'

export function DishModal({ dish, onClose, onVote, onLoginRequired }) {
  const [photoUploaded, setPhotoUploaded] = useState(null)
  const [featuredPhoto, setFeaturedPhoto] = useState(null)
  const [communityPhotos, setCommunityPhotos] = useState([])
  const [allPhotos, setAllPhotos] = useState([])
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [photoLoadError, setPhotoLoadError] = useState(false)

  // Fetch photos when modal opens
  useEffect(() => {
    if (!dish?.dish_id) return

    const fetchPhotos = async () => {
      try {
        setPhotoLoadError(false)
        const [featured, community, all] = await Promise.all([
          dishPhotosApi.getFeaturedPhoto(dish.dish_id),
          dishPhotosApi.getCommunityPhotos(dish.dish_id),
          dishPhotosApi.getAllVisiblePhotos(dish.dish_id),
        ])
        setFeaturedPhoto(featured)
        setCommunityPhotos(community)
        setAllPhotos(all)
      } catch (error) {
        logger.error('Failed to fetch photos:', error)
        setPhotoLoadError(true)
      }
    }

    fetchPhotos()
  }, [dish?.dish_id])

  if (!dish) return null

  const handlePhotoUploaded = async (photo) => {
    setPhotoUploaded(photo)
    // Refresh photos after upload
    try {
      const [featured, community, all] = await Promise.all([
        dishPhotosApi.getFeaturedPhoto(dish.dish_id),
        dishPhotosApi.getCommunityPhotos(dish.dish_id),
        dishPhotosApi.getAllVisiblePhotos(dish.dish_id),
      ])
      setFeaturedPhoto(featured)
      setCommunityPhotos(community)
      setAllPhotos(all)
    } catch (error) {
      logger.error('Failed to refresh photos after upload:', error)
    }
  }

  const handleRateNow = () => {
    setPhotoUploaded(null)
    onClose?.()
  }

  const handleLater = () => {
    setPhotoUploaded(null)
    onClose()
  }

  // Photos to display in the grid (first 4 of community, or all if showing all)
  const displayPhotos = showAllPhotos ? allPhotos : communityPhotos.slice(0, 4)
  const hasMorePhotos = allPhotos.length > 4 && !showAllPhotos

  const modalRef = useFocusTrap(!!dish, onClose)

  return createPortal(
    <div
      key={`modal-${dish.dish_id}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '16px',
      }}
      onClick={onClose}
      role="presentation"
    >
      {/* Modal card */}
      <div
        ref={(el) => {
          if (el) el.scrollTop = 0
          // Merge with focus trap ref
          if (modalRef) modalRef.current = el
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '360px',
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-surface-elevated)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-divider)',
            color: 'var(--color-text-secondary)',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>

        {/* Show photo confirmation if just uploaded */}
        {photoUploaded ? (
          <PhotoUploadConfirmation
            dishName={dish.dish_name}
            photoUrl={photoUploaded.photo_url}
            status={photoUploaded.analysisResults?.status}
            onRateNow={handleRateNow}
            onLater={handleLater}
          />
        ) : (
          <>
            {/* Dish name + restaurant */}
            <h2 id="dish-modal-title" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', paddingRight: '30px', color: 'var(--color-text-primary)' }}>
              {dish.dish_name}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              {dish.restaurant_name}
              {dish.price && ` · $${Number(dish.price).toFixed(0)}`}
            </p>

            {/* Photo load error feedback */}
            {photoLoadError && (
              <div style={{
                padding: '12px',
                marginBottom: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-danger-muted)',
                color: 'var(--color-danger)',
                fontSize: '13px',
                textAlign: 'center',
              }}>
                Unable to load photos
              </div>
            )}

            {/* Featured photo (hero) */}
            {featuredPhoto && (
              <button
                className="dish-hero-photo"
                onClick={() => setLightboxPhoto(featuredPhoto.photo_url)}
                aria-label={`View featured photo of ${dish.dish_name}`}
              >
                <img
                  {...getResponsiveImageProps(featuredPhoto.photo_url, [400, 600, 800])}
                  alt={dish.dish_name}
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, 600px"
                />
                {featuredPhoto.source_type === 'restaurant' && (
                  <span className="photo-badge restaurant">Official</span>
                )}
              </button>
            )}

            {/* Community photos grid */}
            {displayPhotos.length > 0 && (
              <div className="community-photos">
                <h4>
                  {showAllPhotos ? 'All Photos' : 'Community Photos'} ({displayPhotos.length})
                </h4>
                <div className="photo-grid">
                  {displayPhotos.map((photo) => (
                    <button
                      key={photo.id}
                      className="photo-grid-item"
                      onClick={() => setLightboxPhoto(photo.photo_url)}
                      aria-label={`View photo of ${dish.dish_name}`}
                    >
                      <img
                        {...getResponsiveImageProps(photo.photo_url, [200, 300, 400])}
                        alt={dish.dish_name}
                        loading="lazy"
                        sizes="150px"
                      />
                    </button>
                  ))}
                </div>
                {hasMorePhotos && (
                  <button
                    className="see-all-photos-btn"
                    onClick={() => setShowAllPhotos(true)}
                  >
                    See all {allPhotos.length} photos
                  </button>
                )}
              </div>
            )}

            {/* Review Flow - this is where thumbs up/down appears */}
            <ReviewFlow
              dishId={dish.dish_id}
              dishName={dish.dish_name}
              restaurantId={dish.restaurant_id}
              restaurantName={dish.restaurant_name}
              category={dish.category}
              price={dish.price}
              totalVotes={dish.total_votes || 0}
              yesVotes={dish.yes_votes || 0}
              onVote={onVote}
              onLoginRequired={onLoginRequired}
            />

            {/* Photo upload button */}
            <PhotoUploadButton
              dishId={dish.dish_id}
              onPhotoUploaded={handlePhotoUploaded}
              onLoginRequired={onLoginRequired}
            />
          </>
        )}
      </div>

      {/* Photo lightbox */}
      {lightboxPhoto && (
        <div
          className="photo-lightbox"
          onClick={() => setLightboxPhoto(null)}
          role="dialog"
          aria-label="Photo lightbox"
        >
          <button className="lightbox-close" aria-label="Close lightbox">×</button>
          <img
            {...getResponsiveImageProps(lightboxPhoto, [800, 1200, 1600])}
            alt={dish.dish_name}
            sizes="100vw"
          />
        </div>
      )}
    </div>,
    document.body
  )
}
