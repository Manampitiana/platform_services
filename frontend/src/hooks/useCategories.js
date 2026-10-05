import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((res) => res.data.data),
    staleTime: 10 * 60 * 1000,
  })
}