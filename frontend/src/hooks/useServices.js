import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../api/servicesApi'

export function useServices(params = {}) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => servicesApi.list(params),
    select: (res) => res.data,
  })
}

export function useService(slug) {
  return useQuery({
    queryKey: ['service', slug],
    queryFn: () => servicesApi.get(slug),
    enabled: !!slug,
    retry: (count, error) => error?.response?.status !== 404 && count < 2,
  })
}