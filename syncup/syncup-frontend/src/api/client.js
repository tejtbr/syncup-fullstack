import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from storage on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('syncup_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('syncup_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
