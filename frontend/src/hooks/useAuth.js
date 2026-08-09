/**
 * Access the current auth state (user, isAuthenticated) and actions
 * (login, register, logout) from AuthContext. Throws if used outside an
 * AuthProvider so a missing provider fails loudly during development
 * rather than silently returning undefined.
 */
import { useContext } from 'react'

import { AuthContext } from '../context/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
