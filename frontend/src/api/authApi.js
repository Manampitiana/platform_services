import api from './axios'

const backendUrl = import.meta.env.VITE_BACKEND_URL

export const authApi = {
  csrf: () => api.get(`${backendUrl}/sanctum/csrf-cookie`),

  async register(data) {
    await this.csrf()
    return api.post('/register', data)
  },

  async login(data) {
    await this.csrf()
    return api.post('/login', data)
  },

  logout: () => api.post('/logout'),

  me: () => api.get('/me'),

  async forgotPassword(data) {
    await this.csrf()
    return api.post('/forgot-password', data)
  },

  async resetPassword(data) {
    await this.csrf()
    return api.post('/reset-password', data)
  },

  sendCode: () => api.post('/email/send-code'),
  verifyCode: (code) => api.post('/email/verify-code', { code }),
  changeEmail: (email) => api.post('/email/change', { email }),
}