import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { diaryApi } from '../api/diaryApi'
import { logger } from '../utils/logger'

export function useDiary(userId) {
  const queryClient = useQueryClient()

  const { data: feed, isLoading, refetch } = useQuery({
    queryKey: ['diary', userId],
    queryFn: () => diaryApi.getDiaryFeed({ limit: 50 }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    retry: false,
  })

  const logMutation = useMutation({
    mutationFn: (params) => diaryApi.logDish(params),
    onSuccess: () => {
      toast.success('Dish logged!')
      queryClient.invalidateQueries({ queryKey: ['diary', userId] })
    },
    onError: (error) => {
      logger.error('Error logging dish:', error)
      toast.error('Failed to log dish')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (logId) => diaryApi.deleteLog(logId),
    onMutate: async (logId) => {
      await queryClient.cancelQueries({ queryKey: ['diary', userId] })
      const previous = queryClient.getQueryData(['diary', userId])
      queryClient.setQueryData(['diary', userId], (old) =>
        old ? old.filter((e) => e.entry_id !== logId) : old
      )
      return { previous }
    },
    onError: (_err, _logId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['diary', userId], context.previous)
      }
      toast.error('Failed to delete entry')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['diary', userId] })
    },
  })

  return {
    feed: feed || [],
    loading: userId ? isLoading : false,
    logDish: logMutation.mutateAsync,
    deleteLog: deleteMutation.mutateAsync,
    refetch,
  }
}
