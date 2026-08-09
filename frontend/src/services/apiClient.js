/**
 * Shared axios instance for all backend requests.
 *
 * Two responsibilities live here and nowhere else: attaching the
 * current JWT to every outgoing request, and reacting to session
 * expiry (a 401 response) by clearing the stored token and telling the
 * rest of the app via a DOM event -- AuthContext listens for that event
 * and clears its state, which is what actually causes PrivateRoute to
 * redirect to /login. Keeping the interceptor logic as plain exported
 * functions (rather than inline closures) means it can be unit tested
 * without spinning up a real HTTP request.
 */
import axios from 'axios'

export const TOKEN_STORAGE_KEY = 'nbody_token'
export const UNAUTHORIZED_EVENT = 'nbody:unauthorized'

export function attachAuthHeader(config) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

export function handleResponseError(error) {
  if (error.response?.status === 401) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }
  return Promise.reject(error)
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api',
})

apiClient.interceptors.request.use(attachAuthHeader)
apiClient.interceptors.response.use((response) => response, handleResponseError)

export default apiClient
