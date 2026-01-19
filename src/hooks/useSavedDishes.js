import { useState, useEffect, useCallback } from 'react'
import { favoritesApi } from '../api'

export function useSavedDishes(userId) {
  const [savedDishIds, setSavedDishIds] = useState([])
  const [savedDishes, setSavedDishes] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch saved dish IDs
  useEffect(() => {
    if (!userId) {
      setSavedDishIds([])
      setSavedDishes([])
      setLoading(false)
      return
    }

    async function fetchSaved() {
      setLoading(true)
      try {
        const { savedDishIds: ids, savedDishes: dishes } = await favoritesApi.getSavedDishes()
        setSavedDishIds(ids)
        setSavedDishes(dishes)
      } catch (err) {
        console.error('Error fetching saved dishes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSaved()
  }, [userId])

  const isSaved = useCallback((dishId) => savedDishIds.includes(dishId), [savedDishIds])

  const saveDish = async (dishId) => {
    if (!userId) return { error: 'Not logged in' }

    try {
      await favoritesApi.saveDish(dishId)
      // Optimistically update IDs
      setSavedDishIds(prev => [...prev, dishId])
      // Refetch to get full dish data for savedDishes list
      const { savedDishes: dishes } = await favoritesApi.getSavedDishes()
      setSavedDishes(dishes)
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const unsaveDish = async (dishId) => {
    if (!userId) return { error: 'Not logged in' }

    try {
      await favoritesApi.unsaveDish(dishId)
      setSavedDishIds(prev => prev.filter(id => id !== dishId))
      setSavedDishes(prev => prev.filter(d => d.dish_id !== dishId))
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const toggleSave = async (dishId) => {
    if (isSaved(dishId)) {
      return unsaveDish(dishId)
    } else {
      return saveDish(dishId)
    }
  }

  const refetch = async () => {
    if (!userId) return

    try {
      const { savedDishIds: ids, savedDishes: dishes } = await favoritesApi.getSavedDishes()
      setSavedDishIds(ids)
      setSavedDishes(dishes)
    } catch (err) {
      console.error('Error refetching saved dishes:', err)
    }
  }

  return {
    savedDishIds,
    savedDishes,
    loading,
    isSaved,
    saveDish,
    unsaveDish,
    toggleSave,
    refetch,
  }
}
