import { useQuery } from '@tanstack/react-query'
import { diaryApi } from '../api/diaryApi'

export function useTasteStats(userId) {
  const { data, isLoading } = useQuery({
    queryKey: ['tasteStats', userId],
    queryFn: () => diaryApi.getTasteStats(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  return {
    stats: data || null,
    loading: userId ? isLoading : false,
  }
}
