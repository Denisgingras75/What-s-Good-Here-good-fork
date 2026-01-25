import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { favoritesApi } from './favoritesApi'

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
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../lib/supabase'

describe('favoritesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getFavoriteIds', () => {
    it('should return empty array if no userId', async () => {
      const result = await favoritesApi.getFavoriteIds(null)
      expect(result).toEqual([])
    })

    it('should return empty array for undefined userId', async () => {
      const result = await favoritesApi.getFavoriteIds(undefined)
      expect(result).toEqual([])
    })

    it('should return array of dish IDs', async () => {
      const mockFavorites = [
        { dish_id: 'dish-1' },
        { dish_id: 'dish-2' },
        { dish_id: 'dish-3' },
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockFavorites, error: null }),
        }),
      })

      const result = await favoritesApi.getFavoriteIds('user-1')

      expect(result).toEqual(['dish-1', 'dish-2', 'dish-3'])
    })

    it('should return empty array when no favorites', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      })

      const result = await favoritesApi.getFavoriteIds('user-1')

      expect(result).toEqual([])
    })

    it('should return empty array when data is null', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      })

      const result = await favoritesApi.getFavoriteIds('user-1')

      expect(result).toEqual([])
    })

    it('should throw error on database failure', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Query failed' } }),
        }),
      })

      await expect(favoritesApi.getFavoriteIds('user-1')).rejects.toThrow('Query failed')
    })
  })

  describe('addFavorite', () => {
    it('should throw if not logged in', async () => {
      await expect(favoritesApi.addFavorite(null, 'dish-1')).rejects.toThrow('Not logged in')
    })

    it('should throw for undefined userId', async () => {
      await expect(favoritesApi.addFavorite(undefined, 'dish-1')).rejects.toThrow('Not logged in')
    })

    it('should add favorite successfully', async () => {
      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      })

      const result = await favoritesApi.addFavorite('user-1', 'dish-1')

      expect(supabase.from).toHaveBeenCalledWith('favorites')
      expect(result).toEqual({ success: true })
    })

    it('should insert correct data', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null })
      supabase.from.mockReturnValue({ insert: insertMock })

      await favoritesApi.addFavorite('user-1', 'dish-1')

      expect(insertMock).toHaveBeenCalledWith({
        user_id: 'user-1',
        dish_id: 'dish-1',
      })
    })

    it('should throw error on database failure', async () => {
      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } }),
      })

      await expect(favoritesApi.addFavorite('user-1', 'dish-1')).rejects.toThrow('Insert failed')
    })

    it('should throw error on duplicate favorite', async () => {
      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          error: { message: 'duplicate key value violates unique constraint', code: '23505' },
        }),
      })

      await expect(favoritesApi.addFavorite('user-1', 'dish-1')).rejects.toThrow()
    })
  })

  describe('removeFavorite', () => {
    it('should throw if not logged in', async () => {
      await expect(favoritesApi.removeFavorite(null, 'dish-1')).rejects.toThrow('Not logged in')
    })

    it('should throw for undefined userId', async () => {
      await expect(favoritesApi.removeFavorite(undefined, 'dish-1')).rejects.toThrow('Not logged in')
    })

    it('should remove favorite successfully', async () => {
      supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      })

      const result = await favoritesApi.removeFavorite('user-1', 'dish-1')

      expect(supabase.from).toHaveBeenCalledWith('favorites')
      expect(result).toEqual({ success: true })
    })

    it('should throw error on database failure', async () => {
      supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
          }),
        }),
      })

      await expect(favoritesApi.removeFavorite('user-1', 'dish-1')).rejects.toThrow('Delete failed')
    })
  })

  describe('getFavorites', () => {
    it('should return empty arrays if user not logged in', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await favoritesApi.getFavorites()

      expect(result).toEqual({ favoriteIds: [], favorites: [] })
    })

    it('should return favoriteIds and favorites arrays', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

      const mockFavorites = [
        {
          dish_id: 'dish-1',
          created_at: '2024-01-01T00:00:00Z',
          dishes: {
            id: 'dish-1',
            name: 'Lobster Roll',
            category: 'seafood',
            price: 28,
            photo_url: 'https://example.com/lobster.jpg',
            restaurants: { name: "Nancy's" },
          },
        },
        {
          dish_id: 'dish-2',
          created_at: '2024-01-02T00:00:00Z',
          dishes: {
            id: 'dish-2',
            name: 'Clam Chowder',
            category: 'soup',
            price: 12,
            photo_url: null,
            restaurants: { name: 'Dock Street' },
          },
        },
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockFavorites, error: null }),
          }),
        }),
      })

      const result = await favoritesApi.getFavorites()

      expect(result.favoriteIds).toEqual(['dish-1', 'dish-2'])
      expect(result.favorites).toHaveLength(2)
      expect(result.favorites[0]).toEqual({
        dish_id: 'dish-1',
        dish_name: 'Lobster Roll',
        category: 'seafood',
        price: 28,
        photo_url: 'https://example.com/lobster.jpg',
        restaurant_name: "Nancy's",
        saved_at: '2024-01-01T00:00:00Z',
      })
    })

    it('should handle missing restaurant name gracefully', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

      const mockFavorites = [
        {
          dish_id: 'dish-1',
          created_at: '2024-01-01T00:00:00Z',
          dishes: {
            id: 'dish-1',
            name: 'Mystery Dish',
            category: 'unknown',
            price: 10,
            photo_url: null,
            restaurants: null, // restaurant deleted or missing
          },
        },
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockFavorites, error: null }),
          }),
        }),
      })

      const result = await favoritesApi.getFavorites()

      expect(result.favorites[0].restaurant_name).toBeUndefined()
    })

    it('should return empty arrays when no favorites', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      })

      const result = await favoritesApi.getFavorites()

      expect(result).toEqual({ favoriteIds: [], favorites: [] })
    })

    it('should return empty arrays when data is null', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      })

      const result = await favoritesApi.getFavorites()

      expect(result).toEqual({ favoriteIds: [], favorites: [] })
    })

    it('should throw error on database failure', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Query failed' } }),
          }),
        }),
      })

      await expect(favoritesApi.getFavorites()).rejects.toThrow('Query failed')
    })

    it('should order favorites by created_at descending', async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

      const orderMock = vi.fn().mockResolvedValue({ data: [], error: null })
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: orderMock,
          }),
        }),
      })

      await favoritesApi.getFavorites()

      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })
})
