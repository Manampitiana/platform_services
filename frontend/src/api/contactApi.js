import api from './axios'
import { authApi } from './authApi'

export const contactApi = {
  async send(data) {
    await authApi.csrf() // ilaina amin'ny POST rehetra avy amin'ny SPA
    return api.post('/contact', data)
  },
}