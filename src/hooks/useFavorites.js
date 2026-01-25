import { useState, useEffect, useCallback } from 'react'
import { capture } from '../lib/analytics'
import { favoritesApi } from '../api/favoritesApi'
import { logger } from '../utils/logger'

export function useFavorites(userId) {
  const [favoriteIds, setFavoriteIds] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch favorite dish IDs
  useEffect(() => {
    if (!userId) {
      setFavoriteIds([])
      setFavorites([])
      setLoading(false)
      return
    }

    async function fetchFavorites() {
      setLoading(true)
      try {
        const { favoriteIds: ids, favorites: dishes } = await favoritesApi.getFavorites()
        setFavoriteIds(ids)
        setFavorites(dishes)
      } catch (err) {
        logger.error('Error fetching favorites:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [userId])

  const isFavorite = useCallback((dishId) => favoriteIds.includes(dishId), [favoriteIds])

  const addFavorite = async (dishId, dishData = null) => {
    if (!userId) return { error: 'Not logged in' }

    // Optimistic update FIRST - instant UI feedback
    setFavoriteIds(prev => [...prev, dishId])

    // Track immediately for snappy feel
    capture('dish_saved', {
      dish_id: dishId,
      dish_name: dishData?.dish_name,
      restaurant_name: dishData?.restaurant_name,
      category: dishData?.category,
    })

    try {
      await favoritesApi.addFavorite(userId, dishId)
      // Background refetch for full dish data (non-blocking)
      favoritesApi.getFavorites().then(({ favorites: dishes }) => {
        setFavorites(dishes)
      }).catch(() => {}) // Silent fail - we already have the ID
      return { error: null }
    } catch (err) {
      // Revert on failure
      setFavoriteIds(prev => prev.filter(id => id !== dishId))
      return { error: err.message }
    }
  }

  const removeFavorite = async (dishId) => {
    if (!userId) return { error: 'Not logged in' }

    // Get dish info before removing (for analytics and potential revert)
    const dishToRemove = favorites.find(d => d.dish_id === dishId)
    const previousIds = favoriteIds
    const previousFavorites = favorites

    // Optimistic update FIRST - instant UI feedback
    setFavoriteIds(prev => prev.filter(id => id !== dishId))
    setFavorites(prev => prev.filter(d => d.dish_id !== dishId))

    // Track immediately
    capture('dish_unsaved', {
      dish_id: dishId,
      dish_name: dishToRemove?.dish_name,
      restaurant_name: dishToRemove?.restaurant_name,
      category: dishToRemove?.category,
    })

    try {
      await favoritesApi.removeFavorite(userId, dishId)
      return { error: null }
    } catch (err) {
      // Revert on failure
      setFavoriteIds(previousIds)
      setFavorites(previousFavorites)
      return { error: err.message }
    }
  }

  const toggleFavorite = async (dishId, dishData = null) => {
    if (isFavorite(dishId)) {
      return removeFavorite(dishId)
    } else {
      return addFavorite(dishId, dishData)
    }
  }

  const refetch = async () => {
    if (!userId) return

    try {
      const { favoriteIds: ids, favorites: dishes } = await favoritesApi.getFavorites()
      setFavoriteIds(ids)
      setFavorites(dishes)
    } catch (err) {
      logger.error('Error refetching favorites:', err)
    }
  }

  return {
    favoriteIds,
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch,
  }
}
