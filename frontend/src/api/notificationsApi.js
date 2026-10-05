import api from './axios'

export const notificationsApi = {
  list: () => api.get('/notifications').then((res) => res.data.data),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
}