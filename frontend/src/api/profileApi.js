import api from './axios'

export const profileApi = {
  update: (payload) => api.patch('/profile', payload).then((res) => res.data.data),
  updatePassword: (payload) => api.put('/profile/password', payload).then((res) => res.data),

  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)

    return api
      .post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data.data)
  },

  removeAvatar: () => api.delete('/profile/avatar').then((res) => res.data.data),
}