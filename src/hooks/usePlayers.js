import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { playersAPI } from '../api/supabaseApi'

export function usePlayers(token, page, search, filters = {}, searchFields = []) {
  return useQuery({
    queryKey: ['players', page, search, filters, searchFields],
    queryFn: () => playersAPI.getAll(token, page, search, filters, searchFields),
    enabled: !!token,
    placeholderData: (prev) => prev,
  })
}

export function useDeletePlayer(token) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (submissionID) => playersAPI.delete(token, submissionID),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  })
}

export function useBulkDeletePlayers(token) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (submissionIDs) => playersAPI.bulkDelete(token, submissionIDs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  })
}

export function useUpdatePlayer(token) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ submissionID, data }) => playersAPI.update(token, submissionID, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  })
}
