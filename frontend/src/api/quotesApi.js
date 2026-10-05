import api from './axios'

export const quotesApi = {
  list: (uuid) => api.get(`/orders/${uuid}/quotes`).then((res) => res.data.data),
  accept: (id, note) => api.post(`/quotes/${id}/accept`, { note }).then((res) => res.data.data),
  reject: (id, note) => api.post(`/quotes/${id}/reject`, { note }).then((res) => res.data.data),

  // Admin
  create: (uuid) => api.post(`/admin/orders/${uuid}/quotes`).then((res) => res.data.data),
  update: (id, payload) => api.put(`/admin/quotes/${id}`, payload).then((res) => res.data.data),
  send: (id) => api.post(`/admin/quotes/${id}/send`).then((res) => res.data.data),
  remove: (id) => api.delete(`/admin/quotes/${id}`),
}