import api from './axios'

export const adminApi = {
  dashboard: (params = {}) => api.get('/admin/dashboard', { params }).then((res) => res.data.data),

  orders: (params = {}) => api.get('/admin/orders', { params }).then((res) => res.data),
  order: (uuid) => api.get(`/admin/orders/${uuid}`).then((res) => res.data.data),
  changeStatus: (uuid, payload) =>
    api.patch(`/admin/orders/${uuid}/status`, payload).then((res) => res.data.data),
  setPrice: (uuid, total) =>
    api.post(`/admin/orders/${uuid}/price`, { total }).then((res) => res.data.data),

  payments: (params = {}) => api.get('/admin/payments', { params }).then((res) => res.data),
  verifyPayment: (id, note) =>
    api.post(`/admin/payments/${id}/verify`, { note }).then((res) => res.data.data),
  rejectPayment: (id, note) =>
    api.post(`/admin/payments/${id}/reject`, { note }).then((res) => res.data.data),

  // Payment methods
  paymentMethods: () => api.get('/admin/payment-methods').then((res) => res.data.data),
  createPaymentMethod: (payload) => api.post('/admin/payment-methods', payload).then((res) => res.data.data),
  updatePaymentMethod: (id, payload) =>
    api.patch(`/admin/payment-methods/${id}`, payload).then((res) => res.data.data),
  deletePaymentMethod: (id) => api.delete(`/admin/payment-methods/${id}`),

  // Services
  services: () => api.get('/admin/services').then((res) => res.data.data),
  service: (id) => api.get(`/admin/services/${id}`).then((res) => res.data.data),
  createService: (payload) => api.post('/admin/services', payload).then((res) => res.data.data),
  updateService: (id, payload) => api.patch(`/admin/services/${id}`, payload).then((res) => res.data.data),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  saveServiceFeatures: (id, features) =>
    api.put(`/admin/services/${id}/features`, { features }).then((res) => res.data.data),
  saveServiceFields: (id, fields) =>
    api.put(`/admin/services/${id}/form-fields`, { fields }).then((res) => res.data.data),

  // Packages
  createPackage: (serviceId, payload) =>
    api.post(`/admin/services/${serviceId}/packages`, payload).then((res) => res.data.data),
  updatePackage: (id, payload) => api.patch(`/admin/packages/${id}`, payload).then((res) => res.data.data),
  deletePackage: (id) => api.delete(`/admin/packages/${id}`).then((res) => res.data.data),
}