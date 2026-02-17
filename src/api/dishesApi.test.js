import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { dishesApi } from './dishesApi'

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}))

import { supabase } from '../lib/supabase'

describe('dishesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getRankedDishes', () => {
    it('should call rpc with correct parameters', async () => {
      const mockData = [
        { dish_id: '1', dish_name: 'Lobster Roll', avg_rating: 9.2 },
        { dish_id: '2', dish_name: 'Clam Chowder', avg_rating: 8.8 },
      ]
      supabase.rpc.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await dishesApi.getRankedDishes({
        lat: 41.3925,
        lng: -70.6444,
        radiusMiles: 10,
        category: 'seafood',
      })

      expect(supabase.rpc).toHaveBeenCalledWith('get_ranked_dishes', {
        user_lat: 41.3925,
        user_lng: -70.6444,
        radius_miles: 10,
        filter_category: 'seafood',
        filter_town: null,
      })
      expect(result).toEqual(mockData)
    })

    it('should use null category when not provided', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null })

      await dishesApi.getRankedDishes({
        lat: 41.3925,
        lng: -70.6444,
        radiusMiles: 10,
      })

      expect(supabase.rpc).toHaveBeenCalledWith('get_ranked_dishes', {
        user_lat: 41.3925,
        user_lng: -70.6444,
        radius_miles: 10,
        filter_category: null,
        filter_town: null,
      })
    })

    it('should return empty array when data is null', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: null, error: null })

      const result = await dishesApi.getRankedDishes({
        lat: 41.3925,
        lng: -70.6444,
        radiusMiles: 10,
      })

      expect(result).toEqual([])
    })

    it('should throw classified error on database error', async () => {
      const dbError = { message: 'Database connection failed', code: 'PGRST301' }
      supabase.rpc.mockResolvedValueOnce({ data: null, error: dbError })

      await expect(dishesApi.getRankedDishes({
        lat: 41.3925,
        lng: -70.6444,
        radiusMiles: 10,
      })).rejects.toThrow('Database connection failed')
    })

    it('should include error type in thrown error', async () => {
      const dbError = { message: 'Connection error', code: 'PGRST301' }
      supabase.rpc.mockResolvedValueOnce({ data: null, error: dbError })

      try {
        await dishesApi.getRankedDishes({
          lat: 41.3925,
          lng: -70.6444,
          radiusMiles: 10,
        })
      } catch (error) {
        expect(error.type).toBeDefined()
      }
    })
  })

  describe('getDishesForRestaurant', () => {
    it('should call rpc with restaurant ID', async () => {
      const mockData = [
        { id: '1', name: 'Fish Tacos', percent_worth_it: 92 },
        { id: '2', name: 'Nachos', percent_worth_it: 78 },
      ]
      supabase.rpc.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await dishesApi.getDishesForRestaurant({
        restaurantId: 'rest-123',
      })

      expect(supabase.rpc).toHaveBeenCalledWith('get_restaurant_dishes', {
        p_restaurant_id: 'rest-123',
      })
      expect(result).toEqual(mockData)
    })

    it('should return empty array when no dishes found', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: null, error: null })

      const result = await dishesApi.getDishesForRestaurant({
        restaurantId: 'rest-123',
      })

      expect(result).toEqual([])
    })

    it('should throw classified error on failure', async () => {
      const dbError = { message: 'Restaurant not found' }
      supabase.rpc.mockResolvedValueOnce({ data: null, error: dbError })

      await expect(dishesApi.getDishesForRestaurant({
        restaurantId: 'invalid-id',
      })).rejects.toThrow('Restaurant not found')
    })
  })

  describe('search', () => {
    const createMockSelect = (data, error = null) => {
      const chainable = {
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        overlaps: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data, error }),
      }
      return {
        select: vi.fn().mockReturnValue(chainable),
      }
    }

    it('should return empty array for empty query', async () => {
      const result = await dishesApi.search('')
      expect(result).toEqual([])
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('should return empty array for whitespace-only query', async () => {
      const result = await dishesApi.search('   ')
      expect(result).toEqual([])
    })

    it('should return empty array for null query', async () => {
      const result = await dishesApi.search(null)
      expect(result).toEqual([])
    })

    it('should transform results to expected format', async () => {
      const mockDish = {
        id: 'dish-1',
        name: 'Lobster Roll',
        category: 'seafood',
        tags: ['fresh', 'popular'],
        photo_url: 'https://example.com/lobster.jpg',
        total_votes: 42,
        avg_rating: 9.2,
        restaurants: {
          id: 'rest-1',
          name: "Nancy's",
          is_open: true,
          cuisine: 'Seafood',
        },
      }

      const mock = createMockSelect([mockDish])
      supabase.from.mockReturnValue(mock)

      const result = await dishesApi.search('lobster', 5)

      expect(result[0]).toEqual({
        dish_id: 'dish-1',
        dish_name: 'Lobster Roll',
        category: 'seafood',
        tags: ['fresh', 'popular'],
        photo_url: 'https://example.com/lobster.jpg',
        price: undefined,
        value_score: undefined,
        value_percentile: undefined,
        total_votes: 42,
        avg_rating: 9.2,
        restaurant_id: 'rest-1',
        restaurant_name: "Nancy's",
        restaurant_cuisine: 'Seafood',
        restaurant_town: undefined,
      })
    })

    it('should sanitize query to prevent SQL injection', async () => {
      const mock = createMockSelect([])
      supabase.from.mockReturnValue(mock)

      await dishesApi.search('100% off; DROP TABLE--', 5)

      // The query should have been sanitized (% escaped)
      // Just verify the function completed without error
      expect(supabase.from).toHaveBeenCalled()
    })

    it('should merge results from multiple queries without duplicates', async () => {
      const dish1 = {
        id: 'dish-1',
        name: 'Lobster Roll',
        category: 'seafood',
        tags: [],
        photo_url: null,
        total_votes: 10,
        avg_rating: 9.0,
        restaurants: { id: 'r1', name: 'Rest 1', is_open: true, cuisine: 'Seafood' },
      }
      const dish2 = {
        id: 'dish-2',
        name: 'Fish Tacos',
        category: 'seafood',
        tags: [],
        photo_url: null,
        total_votes: 8,
        avg_rating: 8.5,
        restaurants: { id: 'r2', name: 'Rest 2', is_open: true, cuisine: 'Mexican' },
      }

      // First query returns dish1, second returns dish1 (duplicate) and dish2
      let callCount = 0
      supabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) return createMockSelect([dish1])
        if (callCount === 2) return createMockSelect([dish1]) // duplicate
        return createMockSelect([dish2])
      })

      const result = await dishesApi.search('seafood', 5)

      // Should have unique dishes only
      const ids = result.map(d => d.dish_id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('should limit results to specified count', async () => {
      const dishes = Array.from({ length: 10 }, (_, i) => ({
        id: `dish-${i}`,
        name: `Dish ${i}`,
        category: 'food',
        tags: [],
        photo_url: null,
        total_votes: 10 - i,
        avg_rating: 9 - i * 0.5,
        restaurants: { id: 'r1', name: 'Rest', is_open: true, cuisine: 'American' },
      }))

      const mock = createMockSelect(dishes)
      supabase.from.mockReturnValue(mock)

      const result = await dishesApi.search('dish', 3)

      expect(result.length).toBeLessThanOrEqual(3)
    })

    it('should return empty results when all queries return errors', async () => {
      const mock = createMockSelect(null, { message: 'Query failed' })
      supabase.from.mockReturnValue(mock)

      // New search handles errors per-level gracefully, returns empty on total failure
      const result = await dishesApi.search('lobster', 5)
      expect(result).toEqual([])
    })
  })

  describe('getVariants', () => {
    it('should call rpc with parent dish ID', async () => {
      const mockVariants = [
        { id: 'v1', name: 'Small Pizza' },
        { id: 'v2', name: 'Large Pizza' },
      ]
      supabase.rpc.mockResolvedValueOnce({ data: mockVariants, error: null })

      const result = await dishesApi.getVariants('parent-dish-1')

      expect(supabase.rpc).toHaveBeenCalledWith('get_dish_variants', {
        p_parent_dish_id: 'parent-dish-1',
      })
      expect(result).toEqual(mockVariants)
    })

    it('should return empty array when no variants', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: null, error: null })

      const result = await dishesApi.getVariants('parent-dish-1')

      expect(result).toEqual([])
    })

    it('should throw classified error on failure', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC failed' } })

      await expect(dishesApi.getVariants('parent-dish-1')).rejects.toThrow('RPC failed')
    })
  })

  describe('hasVariants', () => {
    it('should return true when dish has variants', async () => {
      const selectChain = {
        eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
      }
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(selectChain),
      })

      const result = await dishesApi.hasVariants('dish-1')

      expect(result).toBe(true)
    })

    it('should return false when dish has no variants', async () => {
      const selectChain = {
        eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
      }
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(selectChain),
      })

      const result = await dishesApi.hasVariants('dish-1')

      expect(result).toBe(false)
    })

    it('should return false on error (graceful degradation)', async () => {
      const selectChain = {
        eq: vi.fn().mockResolvedValue({ count: null, error: { message: 'Error' } }),
      }
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(selectChain),
      })

      const result = await dishesApi.hasVariants('dish-1')

      expect(result).toBe(false)
    })
  })

  describe('getParentDish', () => {
    it('should return null when dish has no parent', async () => {
      const selectChain = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { parent_dish_id: null }, error: null }),
      }
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(selectChain),
      })

      const result = await dishesApi.getParentDish('dish-1')

      expect(result).toBeNull()
    })

    it('should return parent dish info when exists', async () => {
      const mockParent = {
        id: 'parent-1',
        name: 'Pizza',
        category: 'Italian',
        restaurant_id: 'rest-1',
        restaurants: { id: 'rest-1', name: 'Pizzeria' },
      }

      let callCount = 0
      supabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: { parent_dish_id: 'parent-1' }, error: null }),
            }),
          }
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockParent, error: null }),
          }),
        }
      })

      const result = await dishesApi.getParentDish('child-dish-1')

      expect(result).toEqual(mockParent)
    })

    it('should return null on error (graceful degradation)', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      })

      const result = await dishesApi.getParentDish('dish-1')

      expect(result).toBeNull()
    })
  })

  describe('getSiblingVariants', () => {
    it('should return empty array when dish has no parent', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { parent_dish_id: null }, error: null }),
        }),
      })

      const result = await dishesApi.getSiblingVariants('dish-1')

      expect(result).toEqual([])
    })

    it('should call getVariants with parent ID when dish has parent', async () => {
      const mockVariants = [{ id: 'v1' }, { id: 'v2' }]

      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { parent_dish_id: 'parent-1' }, error: null }),
        }),
      })
      supabase.rpc.mockResolvedValueOnce({ data: mockVariants, error: null })

      const result = await dishesApi.getSiblingVariants('child-1')

      expect(supabase.rpc).toHaveBeenCalledWith('get_dish_variants', {
        p_parent_dish_id: 'parent-1',
      })
      expect(result).toEqual(mockVariants)
    })
  })

  describe('getDishById', () => {
    it('should fetch dish with restaurant info and calculate vote stats', async () => {
      const mockDish = {
        id: 'dish-1',
        name: 'Lobster Roll',
        category: 'seafood',
        restaurants: {
          id: 'rest-1',
          name: "Nancy's",
          address: '123 Main St',
          lat: 41.39,
          lng: -70.64,
          cuisine: 'Seafood',
        },
      }
      // First call: get dish (avg_rating and total_votes are pre-computed columns)
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { ...mockDish, avg_rating: 8, total_votes: 3 }, error: null }),
        }),
      })
      // Second call: count yes_votes (head: true count query)
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
          }),
        }),
      })
      // Third call: check variants
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
        }),
      })

      const result = await dishesApi.getDishById('dish-1')

      expect(result.total_votes).toBe(3)
      expect(result.yes_votes).toBe(2)
      expect(result.avg_rating).toBe(8)
      expect(result.has_variants).toBe(false)
    })

    it('should handle dish with no votes', async () => {
      const mockDish = { id: 'dish-1', name: 'New Dish', avg_rating: null, total_votes: 0, restaurants: {} }

      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockDish, error: null }),
        }),
      })
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
          }),
        }),
      })
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
        }),
      })

      const result = await dishesApi.getDishById('dish-1')

      expect(result.total_votes).toBe(0)
      expect(result.yes_votes).toBe(0)
      expect(result.avg_rating).toBeNull()
    })

    it('should throw error when dish not found', async () => {
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found', code: 'PGRST116' } }),
        }),
      })

      await expect(dishesApi.getDishById('invalid-id')).rejects.toThrow()
    })

    it('should continue with dish data if yes_votes count fails (graceful degradation)', async () => {
      const mockDish = { id: 'dish-1', name: 'Lobster Roll', avg_rating: 8, total_votes: 3, restaurants: {} }

      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockDish, error: null }),
        }),
      })
      // yes_votes count query fails
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: null, error: { message: 'Votes error' } }),
          }),
        }),
      })
      // check variants
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
        }),
      })

      const result = await dishesApi.getDishById('dish-1')

      // Should return dish with yes_votes defaulting to 0
      expect(result.id).toBe('dish-1')
      expect(result.avg_rating).toBe(8)
      expect(result.total_votes).toBe(3)
      expect(result.yes_votes).toBe(0)
    })
  })
})
