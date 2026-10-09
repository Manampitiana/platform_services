import api from './axios'
import { saveBlob } from '../utils/saveBlob'

export const messagesApi = {
  list: (uuid) => api.get(`/orders/${uuid}/messages`).then((res) => res.data.data),

  send(uuid, { body, attachment }) {
    const formData = new FormData()
    if (body) formData.append('body', body)
    if (attachment) formData.append('attachment', attachment)

    return api
      .post(`/orders/${uuid}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data.data)
  },

  downloadAttachment: async (uuid, message) => {
    const res = await api.get(`/orders/${uuid}/messages/${message.id}/attachment`, { responseType: 'blob' })
    saveBlob(res.data, message.attachment_name)
  },
  
  unread: () => api.get('/messages/unread').then((res) => res.data.data),
  remove: (uuid, id) => api.delete(`/orders/${uuid}/messages/${id}`),
}