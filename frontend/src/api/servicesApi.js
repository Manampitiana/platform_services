import api from './axios'

export const servicesApi = {
  list: (params = {}) => api.get('/services', { params }).then((res) => res.data),
  get: (slug) => api.get(`/services/${slug}`).then((res) => res.data.data),
}