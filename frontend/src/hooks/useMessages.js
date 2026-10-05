import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messagesApi } from '../api/messagesApi'

export function useMessages(uuid) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['messages', uuid],
    queryFn: async () => {
      const data = await messagesApi.list(uuid)
      // Efa nosoratan'ny serveur ho "lu": havaozy ny badge
      queryClient.invalidateQueries({ queryKey: ['unread'] })
      return data
    },
    enabled: !!uuid,
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
  })
}
export function useSendMessage(uuid) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => messagesApi.send(uuid, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', uuid] }),
  })
}