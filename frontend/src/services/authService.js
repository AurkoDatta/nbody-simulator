/**
 * Thin wrapper around the auth endpoints -- keeps axios calls and
 * response-shape knowledge out of AuthContext/components.
 */
import apiClient from './apiClient'

export async function register(name, email, password) {
  const { data } = await apiClient.post('/auth/register', { name, email, password })
  return data
}

export async function login(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password })
  return data
}
