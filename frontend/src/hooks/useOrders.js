import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api/ordersApi'

export function useOrdersSummary() {
  return useQuery({
    queryKey: ['orders', 'summary'],
    queryFn: ordersApi.summary,
  })
}

export function useOrders(params = {}) {
  return useQuery({
    queryKey: ['orders', 'list', params],
    queryFn: () => ordersApi.list(params),
    placeholderData: (previous) => previous,
  })
}

export function useOrder(uuid) {
  return useQuery({
    queryKey: ['orders', 'detail', uuid],
    queryFn: () => ordersApi.get(uuid),
    enabled: !!uuid,
    retry: (count, error) => ![403, 404].includes(error?.response?.status) && count < 2,
  })
}