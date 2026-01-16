import { useState, useCallback } from 'react'
import posthog from 'posthog-js'
import { dishPhotosApi } from '../api/dishPhotosApi'
import { analyzeImage } from '../utils/imageAnalysis'

/**
 * Hook for managing photo uploads for dishes
 */
export function useDishPhotos() {
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)

  const uploadPhoto = useCallback(async (dishId, file) => {
    setAnalyzing(true)
    setUploading(false)
    setUploadProgress(0)
    setError(null)

    // Track upload attempt
    posthog.capture('photo_upload_attempt', {
      dish_id: dishId,
      file_size_bytes: file.size,
      mime_type: file.type,
    })

    try {
      // Step 1: Analyze the image
      const analysis = await analyzeImage(file)

      // If rejected by quality checks, don't upload
      if (analysis.status === 'rejected') {
        // Track rejection with metrics for tuning
        posthog.capture('photo_upload_rejected', {
          dish_id: dishId,
          reason: analysis.rejectReason,
          avg_brightness: analysis.avgBrightness,
          dark_pixel_pct: analysis.darkPixelPct,
          bright_pixel_pct: analysis.brightPixelPct,
          width: analysis.width,
          height: analysis.height,
          file_size_bytes: analysis.fileSize,
        })

        setError(analysis.rejectReason)
        return { rejected: true, reason: analysis.rejectReason }
      }

      // Step 2: Upload the photo with analysis results
      setAnalyzing(false)
      setUploading(true)
      setUploadProgress(30)

      const result = await dishPhotosApi.uploadPhoto({
        dishId,
        file,
        analysisResults: analysis,
      })

      // Track accepted upload with full metrics
      posthog.capture('photo_upload_accepted', {
        dish_id: dishId,
        status: analysis.status,
        quality_score: analysis.qualityScore,
        avg_brightness: analysis.avgBrightness,
        dark_pixel_pct: analysis.darkPixelPct,
        bright_pixel_pct: analysis.brightPixelPct,
        width: analysis.width,
        height: analysis.height,
        file_size_bytes: analysis.fileSize,
      })

      setUploadProgress(100)
      return { ...result, analysisResults: analysis }
    } catch (err) {
      setError(err.message || 'Failed to upload photo')
      throw err
    } finally {
      setAnalyzing(false)
      setUploading(false)
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 500)
    }
  }, [])

  const getUserPhotoForDish = useCallback(async (dishId) => {
    try {
      return await dishPhotosApi.getUserPhotoForDish(dishId)
    } catch (err) {
      console.error('Error getting user photo:', err)
      return null
    }
  }, [])

  const deletePhoto = useCallback(async (photoId) => {
    try {
      await dishPhotosApi.deletePhoto(photoId)
      return { success: true }
    } catch (err) {
      setError(err.message || 'Failed to delete photo')
      throw err
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    uploadPhoto,
    getUserPhotoForDish,
    deletePhoto,
    uploading,
    analyzing,
    uploadProgress,
    error,
    clearError,
  }
}
