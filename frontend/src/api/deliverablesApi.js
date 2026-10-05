import api from './axios'
import { saveBlob } from '../utils/saveBlob'

export const deliverablesApi = {
  download: async (deliverable) => {
    const res = await api.get(`/deliverables/${deliverable.id}/download`, { responseType: 'blob' })
    saveBlob(res.data, deliverable.original_name)
  },

  approve: (id) => api.post(`/deliverables/${id}/approve`).then((res) => res.data.data),

  requestRevision: (id, note) =>
    api.post(`/deliverables/${id}/revision-request`, { note }).then((res) => res.data.data),

  // Admin
  create(orderUuid, { title, description, file, delivery_url, delivery_notes }) {
    const formData = new FormData()
    formData.append('title', title)
    if (description) formData.append('description', description)
    if (file) formData.append('file', file)
    if (delivery_url) formData.append('delivery_url', delivery_url)
    if (delivery_notes) formData.append('delivery_notes', delivery_notes)

    return api
      .post(`/admin/orders/${orderUuid}/deliverables`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data.data)
  },
}