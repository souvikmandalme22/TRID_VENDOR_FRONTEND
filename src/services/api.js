import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const TIMEOUT  = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

/* ── Attach JWT on every request ── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trid_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* ── Global response error handling ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('trid_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
