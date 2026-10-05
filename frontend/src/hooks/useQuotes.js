import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quotesApi } from '../api/quotesApi'

export function useQuotes(uuid) {
  return useQuery({
    queryKey: ['quotes', uuid],
    queryFn: () => quotesApi.list(uuid),
    enabled: !!uuid,
  })
}

function useQuoteMutation(mutationFn) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: () => {
      ;['quotes', 'orders', 'admin', 'notifications'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      )
    },
  })
}

export const useCreateQuote = () => useQuoteMutation(quotesApi.create)
export const useSaveQuote = (id) => useQuoteMutation((payload) => quotesApi.update(id, payload))
export const useSendQuote = () => useQuoteMutation(quotesApi.send)
export const useDeleteQuote = () => useQuoteMutation(quotesApi.remove)
export const useAcceptQuote = () => useQuoteMutation(({ id, note }) => quotesApi.accept(id, note))
export const useRejectQuote = () => useQuoteMutation(({ id, note }) => quotesApi.reject(id, note))