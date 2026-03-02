import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { diaryApi } from '../api/diaryApi'
import { logger } from '../utils/logger'

export function useShelves(userId) {
  const queryClient = useQueryClient()

  const { data: shelves, isLoading } = useQuery({
    queryKey: ['shelves', userId],
    queryFn: () => diaryApi.getShelves(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: (params) => diaryApi.createShelf(params),
    onSuccess: () => {
      toast.success('Shelf created!')
      queryClient.invalidateQueries({ queryKey: ['shelves', userId] })
    },
    onError: (error) => {
      logger.error('Error creating shelf:', error)
      toast.error('Failed to create shelf')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (shelfId) => diaryApi.deleteShelf(shelfId),
    onMutate: async (shelfId) => {
      await queryClient.cancelQueries({ queryKey: ['shelves', userId] })
      const previous = queryClient.getQueryData(['shelves', userId])
      queryClient.setQueryData(['shelves', userId], (old) =>
        old ? old.filter((s) => s.shelf_id !== shelfId) : old
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['shelves', userId], context.previous)
      }
      toast.error('Failed to delete shelf')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shelves', userId] })
    },
  })

  const addItemMutation = useMutation({
    mutationFn: ({ shelfId, dishId, note }) => diaryApi.addToShelf(shelfId, dishId, note),
    onSuccess: (_data, variables) => {
      toast.success('Added to shelf!')
      queryClient.invalidateQueries({ queryKey: ['shelfItems', variables.shelfId] })
      queryClient.invalidateQueries({ queryKey: ['shelves', userId] })
    },
    onError: (error) => {
      logger.error('Error adding to shelf:', error)
      toast.error('Failed to add to shelf')
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: ({ shelfId, dishId }) => diaryApi.removeFromShelf(shelfId, dishId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shelfItems', variables.shelfId] })
      queryClient.invalidateQueries({ queryKey: ['shelves', userId] })
    },
    onError: (error) => {
      logger.error('Error removing from shelf:', error)
      toast.error('Failed to remove from shelf')
    },
  })

  const getWantToTryShelf = useCallback(() => {
    return (shelves || []).find((s) => s.shelf_type === 'want_to_try')
  }, [shelves])

  return {
    shelves: shelves || [],
    loading: userId ? isLoading : false,
    createShelf: createMutation.mutateAsync,
    deleteShelf: deleteMutation.mutateAsync,
    addToShelf: addItemMutation.mutateAsync,
    removeFromShelf: removeItemMutation.mutateAsync,
    getWantToTryShelf,
  }
}

export function useShelfItems(shelfId) {
  const { data, isLoading } = useQuery({
    queryKey: ['shelfItems', shelfId],
    queryFn: () => diaryApi.getShelfItems(shelfId),
    enabled: !!shelfId,
    staleTime: 1000 * 60 * 2,
  })

  return {
    items: data || [],
    loading: shelfId ? isLoading : false,
  }
}
