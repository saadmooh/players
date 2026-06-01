import { useQuery } from '@tanstack/react-query'
import { statsAPI } from '../api/supabaseApi'

export function useStats(token) {
  return useQuery({
    queryKey: ['stats', token],
    queryFn: () => statsAPI.get(token),
    enabled: !!token,
    refetchInterval: 30_000,
  })
}
