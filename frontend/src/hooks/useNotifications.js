import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../api/notificationsApi'
import { useAuth } from '../contexts/AuthContext'

export function useNotifications() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
}

function useNotificationMutation(mutationFn) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export const useMarkNotificationRead = () => useNotificationMutation(notificationsApi.markRead)
export const useMarkAllNotificationsRead = () => useNotificationMutation(notificationsApi.markAllRead)