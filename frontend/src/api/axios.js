import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
})

// Ireto fiantsoana ireto dia mety hamerina 401/422 ho an'ny antony ara-dalàna
const AUTH_CALLS = ['/me', '/login', '/register', '/logout', '/forgot-password', '/reset-password']

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url ?? ''
    const isAuthCall = AUTH_CALLS.some((path) => url.endsWith(path))

    if (status === 401 && !isAuthCall) {
      window.dispatchEvent(new Event('auth:expired'))
    }

    if (status === 403 && error.response?.data?.code === 'email_unverified') {
      window.dispatchEvent(new Event('auth:unverified'))
    }

    return Promise.reject(error)
  }
)

export default api