import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLocation } from '../hooks/useLocation'
import { useDishes } from '../hooks/useDishes'
import { DishFeed } from '../components/DishFeed'
import { LoginModal } from '../components/Auth/LoginModal'

export function Restaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const { location, radius } = useLocation()
  const { dishes, loading: dishesLoading, error: dishesError, refetch } = useDishes(
    location,
    radius,
    null,
    selectedRestaurant?.id
  )

  // Fetch restaurants with dish counts
  useEffect(() => {
    async function fetchRestaurants() {
      setLoading(true)
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          id,
          name,
          dishes (id)
        `)
        .order('name')

      if (!error && data) {
        // Transform to include dish count
        const restaurantsWithCounts = data.map(r => ({
          ...r,
          dishCount: r.dishes?.length || 0
        }))
        setRestaurants(restaurantsWithCounts)
      }
      setLoading(false)
    }
    fetchRestaurants()
  }, [])

  const handleVote = () => {
    refetch()
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  // Filter restaurants by search
  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.png" alt="What's Good Here" className="h-20 w-auto" />
        </div>

        {/* Search bar */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-neutral-100 rounded-xl border-0 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
          />
        </div>
      </header>

      {/* Restaurant List */}
      {!selectedRestaurant && (
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-neutral-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRestaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className="w-full bg-white rounded-xl border border-neutral-200 p-4 text-left hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors">
                        {restaurant.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {restaurant.dishCount} {restaurant.dishCount === 1 ? 'dish' : 'dishes'} rated
                      </p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-neutral-400 group-hover:text-orange-500 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </button>
              ))}

              {filteredRestaurants.length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                  No restaurants found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Restaurant View */}
      {selectedRestaurant && (
        <>
          {/* Back button and restaurant header */}
          <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                {selectedRestaurant.name}
              </h2>
              <p className="text-sm text-neutral-500">
                {selectedRestaurant.dishCount} dishes
              </p>
            </div>
          </div>

          {/* Dish Feed */}
          <DishFeed
            dishes={dishes}
            loading={dishesLoading}
            error={dishesError}
            onVote={handleVote}
            onLoginRequired={handleLoginRequired}
            selectedRestaurant={selectedRestaurant}
          />
        </>
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
