import { useQuery } from '@tanstack/react-query'
import { userAPI, configAPI } from '../api/supabaseApi'

export function useActiveFields() {
  return useQuery({
    queryKey: ['activeFields'],
    queryFn: userAPI.getFields,
    staleTime: 60_000,
  })
}

export function useAllFields(token) {
  return useQuery({
    queryKey: ['allFields', token],
    queryFn: () => configAPI.getFields(token),
    enabled: !!token,
  })
}
