/**
 * Holds the current user + JWT in React state, persisted to
 * localStorage so a page refresh doesn't log the user out. Also listens
 * for apiClient's "session expired" event (dispatched on any 401
 * response) so an expired/invalid token clears local state even when
 * that happens outside of a direct login/logout action.
 */
import { createContext, useEffect, useState } from 'react'

import { TOKEN_STORAGE_KEY, UNAUTHORIZED_EVENT } from '../services/apiClient'
import * as authService from '../services/authService'

const USER_STORAGE_KEY = 'nbody_user'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    const clearSession = () => setUser(null)
    window.addEventListener(UNAUTHORIZED_EVENT, clearSession)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, clearSession)
  }, [])

  function persistSession({ token, user: nextUser }) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }

  async function register(name, email, password) {
    persistSession(await authService.register(name, email, password))
  }

  async function login(email, password) {
    persistSession(await authService.login(email, password))
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
  }

  const value = { user, isAuthenticated: Boolean(user), register, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
