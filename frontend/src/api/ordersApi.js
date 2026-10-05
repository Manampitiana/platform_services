import api from './axios'

export const ordersApi = {
  list: (params = {}) => api.get('/orders', { params }).then((res) => res.data),
  get: (uuid) => api.get(`/orders/${uuid}`).then((res) => res.data.data),
  summary: () => api.get('/orders/summary').then((res) => res.data.data),
  create: (payload) => api.post('/orders', payload).then((res) => res.data.data),
  saveBrief: (uuid, payload) =>
    api.patch(`/orders/${uuid}/brief`, payload).then((res) => res.data.data),
  submit: (uuid) => api.post(`/orders/${uuid}/submit`).then((res) => res.data.data),

  uploadFile(uuid, file, category) {
    const formData = new FormData()
    formData.append('file', file)
    if (category) formData.append('category', category)
    return api
      .post(`/orders/${uuid}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data.data)
  },

  downloadFile: async (uuid, file) => {
    const res = await api.get(`/orders/${uuid}/files/${file.id}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const link = document.createElement('a')
    link.href = url
    link.download = file.original_name
    link.click()
    URL.revokeObjectURL(url)
  },

  deleteFile: (uuid, fileId) => api.delete(`/orders/${uuid}/files/${fileId}`),
}