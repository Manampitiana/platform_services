import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/adminApi'

export function useAdminDashboard(days = 30) {
  return useQuery({
    queryKey: ['admin', 'dashboard', days],
    queryFn: () => adminApi.dashboard({ days }),
    placeholderData: (previous) => previous, // tsy mivadika skeleton rehefa mifidy daty hafa
    refetchInterval: 60_000,
  })
}

export function useAdminOrders(params = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => adminApi.orders(params),
    placeholderData: (previous) => previous,
  })
}

export function useAdminOrder(uuid) {
  return useQuery({
    queryKey: ['admin', 'order', uuid],
    queryFn: () => adminApi.order(uuid),
    enabled: !!uuid,
    retry: (count, error) => ![403, 404].includes(error?.response?.status) && count < 2,
  })
}

export function useAdminPayments(params = {}) {
  return useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => adminApi.payments(params),
    placeholderData: (previous) => previous,
  })
}

// Mamerina ny cache admin rehetra rehefa misy fanovana
function useAdminMutation(mutationFn) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: () => {
      ;['admin', 'orders', 'services', 'service', 'payment-methods'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      )
    },
  })
}

export function useAdminPaymentMethods() {
  return useQuery({ queryKey: ['admin', 'payment-methods'], queryFn: adminApi.paymentMethods })
}

export function useAdminServices() {
  return useQuery({ queryKey: ['admin', 'services'], queryFn: adminApi.services })
}

export function useAdminService(id) {
  return useQuery({
    queryKey: ['admin', 'service', id],
    queryFn: () => adminApi.service(id),
    enabled: !!id,
    retry: (count, error) => ![403, 404].includes(error?.response?.status) && count < 2,
  })
}

export const useSavePaymentMethod = () =>
  useAdminMutation(({ id, ...payload }) =>
    id ? adminApi.updatePaymentMethod(id, payload) : adminApi.createPaymentMethod(payload)
  )
export const useDeletePaymentMethod = () => useAdminMutation(adminApi.deletePaymentMethod)

export const useCreateService = () => useAdminMutation(adminApi.createService)
export const useUpdateService = (id) => useAdminMutation((payload) => adminApi.updateService(id, payload))
export const useDeleteService = () => useAdminMutation(adminApi.deleteService)
export const useSaveServiceFeatures = (id) => useAdminMutation((features) => adminApi.saveServiceFeatures(id, features))
export const useSaveServiceFields = (id) => useAdminMutation((fields) => adminApi.saveServiceFields(id, fields))

export const useCreatePackage = (serviceId) =>
  useAdminMutation((payload) => adminApi.createPackage(serviceId, payload))
export const useUpdatePackage = () =>
  useAdminMutation(({ id, ...payload }) => adminApi.updatePackage(id, payload))
export const useDeletePackage = () => useAdminMutation(adminApi.deletePackage)

export const useChangeOrderStatus = (uuid) =>
  useAdminMutation((payload) => adminApi.changeStatus(uuid, payload))

export const useSetOrderPrice = (uuid) =>
  useAdminMutation((total) => adminApi.setPrice(uuid, total))

export const useVerifyPayment = () =>
  useAdminMutation(({ id, note }) => adminApi.verifyPayment(id, note))

export const useRejectPayment = () =>
  useAdminMutation(({ id, note }) => adminApi.rejectPayment(id, note))