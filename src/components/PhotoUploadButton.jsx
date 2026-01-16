import { useRef } from 'react'
import { useDishPhotos } from '../hooks/useDishPhotos'
import { useAuth } from '../context/AuthContext'

export function PhotoUploadButton({
  dishId,
  onPhotoUploaded,
  onLoginRequired,
  compact = false,
}) {
  const fileInputRef = useRef(null)
  const { user } = useAuth()
  const { uploadPhoto, uploading, analyzing, uploadProgress, error, clearError } = useDishPhotos()

  const handleClick = () => {
    if (!user) {
      onLoginRequired?.()
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    clearError()

    try {
      const result = await uploadPhoto(dishId, file)

      // If rejected by quality checks, error is set in the hook
      if (result?.rejected) {
        // Error already displayed via the hook's error state
        return
      }

      onPhotoUploaded?.(result)
    } catch {
      // Error is already set in the hook
    }

    // Clear the input so the same file can be selected again
    e.target.value = ''
  }

  const isProcessing = analyzing || uploading

  if (compact) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          onClick={handleClick}
          disabled={isProcessing}
          className="photo-upload-btn-compact"
          title="Add photo"
        >
          {isProcessing ? (
            <span className="upload-spinner" />
          ) : (
            <span>📷</span>
          )}
        </button>
      </>
    )
  }

  const getButtonText = () => {
    if (analyzing) return 'Checking photo quality...'
    if (uploading) return `Uploading... ${uploadProgress}%`
    return 'Add Photo'
  }

  return (
    <div className="photo-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        onClick={handleClick}
        disabled={isProcessing}
        className="photo-upload-btn"
      >
        {isProcessing ? (
          <>
            <span className="upload-spinner" />
            <span>{getButtonText()}</span>
          </>
        ) : (
          <>
            <span>📷</span>
            <span>Add Photo</span>
          </>
        )}
      </button>

      {error && (
        <div className="photo-upload-error-container">
          <p className="photo-upload-error">{error}</p>
          <button
            onClick={handleClick}
            className="photo-upload-retry-btn"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
