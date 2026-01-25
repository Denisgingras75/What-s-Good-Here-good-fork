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

  const addFavorite = async (dishId) => {
    if (!userId) return { error: 'Not logged in' }

    try {
      await favoritesApi.addFavorite(userId, dishId)
      // Optimistically update IDs
      setFavoriteIds(prev => [...prev, dishId])
      // Refetch to get full dish data for favorites list
      const { favorites: dishes } = await favoritesApi.getFavorites()
      setFavorites(dishes)

      // Track dish saved - shows intent to try
      const favoriteDish = dishes.find(d => d.dish_id === dishId)
      capture('dish_saved', {
        dish_id: dishId,
        dish_name: favoriteDish?.dish_name,
        restaurant_name: favoriteDish?.restaurant_name,
        category: favoriteDish?.category,
      })

      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const removeFavorite = async (dishId) => {
    if (!userId) return { error: 'Not logged in' }

    // Get dish info before removing
    const dishToRemove = favorites.find(d => d.dish_id === dishId)

    try {
      await favoritesApi.removeFavorite(userId, dishId)
      setFavoriteIds(prev => prev.filter(id => id !== dishId))
      setFavorites(prev => prev.filter(d => d.dish_id !== dishId))

      // Track dish unsaved
      capture('dish_unsaved', {
        dish_id: dishId,
        dish_name: dishToRemove?.dish_name,
        restaurant_name: dishToRemove?.restaurant_name,
        category: dishToRemove?.category,
      })

      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const toggleFavorite = async (dishId) => {
    if (isFavorite(dishId)) {
      return removeFavorite(dishId)
    } else {
      return addFavorite(dishId)
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
