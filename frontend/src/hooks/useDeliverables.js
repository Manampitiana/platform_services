import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deliverablesApi } from '../api/deliverablesApi'

function useOrderMutation(mutationFn) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
  })
}

export const useApproveDeliverable = () =>
  useOrderMutation((id) => deliverablesApi.approve(id))

export const useRequestRevision = () =>
  useOrderMutation(({ id, note }) => deliverablesApi.requestRevision(id, note))

export const useCreateDeliverable = (orderUuid) =>
  useOrderMutation((payload) => deliverablesApi.create(orderUuid, payload))