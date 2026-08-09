/**
 * Route guard: renders its children only when a user is authenticated,
 * otherwise redirects to /login. Deliberately does not forward the
 * attempted path back to the login form as a post-login redirect target
 * -- always landing on a fixed page after login avoids ever feeding a
 * request-derived value into useNavigate/<Link>.
 */
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
