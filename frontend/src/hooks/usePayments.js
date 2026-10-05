import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '../api/paymentsApi'

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: paymentsApi.methods,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreatePayment(orderUuid) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => paymentsApi.create(orderUuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}