import { useState, useEffect } from 'react'
import { dishesApi } from '../api'
import { withRetry, getUserMessage } from '../utils/errorHandler'

export function useDishes(location, radius, category = null, restaurantId = null) {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!location) {
      setLoading(false)
      return
    }

    async function fetchDishes() {
      try {
        setLoading(true)
        setError(null)

        let data
        try {
          if (restaurantId) {
            // Fetch dishes for a specific restaurant
            data = await withRetry(() =>
              dishesApi.getDishesForRestaurant({ restaurantId, category })
            )
          } else {
            // Fetch ranked dishes by location
            data = await withRetry(() =>
              dishesApi.getRankedDishes({
                lat: location.lat,
                lng: location.lng,
                radiusMiles: radius,
                category,
              })
            )
          }
          setDishes(data || [])
        } catch (apiError) {
          const errorMessage = getUserMessage(apiError, 'loading dishes')
          setError({
            message: errorMessage,
            originalError: apiError,
            type: apiError.type,
          })
          console.error('Error fetching dishes:', apiError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDishes()
  }, [location, radius, category, restaurantId])

  const refetch = async () => {
    if (!location) return

    try {
      setLoading(true)

      let data
      if (restaurantId) {
        data = await withRetry(() =>
          dishesApi.getDishesForRestaurant({ restaurantId, category })
        )
      } else {
        data = await withRetry(() =>
          dishesApi.getRankedDishes({
            lat: location.lat,
            lng: location.lng,
            radiusMiles: radius,
            category,
          })
        )
      }

      setDishes(data || [])
      setError(null)
    } catch (err) {
      const errorMessage = getUserMessage(err, 'refreshing dishes')
      setError({
        message: errorMessage,
        originalError: err,
        type: err.type,
      })
      console.error('Error refetching dishes:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    dishes,
    loading,
    error,
    refetch,
  }
}
