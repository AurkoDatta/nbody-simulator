/**
 * Email + password login form. On success, always redirects to the
 * builder (never to a request-derived "next" path -- see PrivateRoute
 * for why); on failure, shows the server's own error message so the
 * user knows whether it was a typo or an actual account issue.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/builder')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to log in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-dim/30 bg-panel p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dim">Access</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-star">Log in</h1>

        <label htmlFor="login-email" className="mt-6 block text-sm text-star">
          Email
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border border-dim/40 bg-void px-3 py-2 text-star focus:border-orbit focus:outline-none"
          />
        </label>

        <label htmlFor="login-password" className="mt-4 block text-sm text-star">
          Password
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded border border-dim/40 bg-void px-3 py-2 text-star focus:border-orbit focus:outline-none"
          />
        </label>

        {error && <p className="mt-4 text-sm text-flare">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded bg-orbit py-2 font-semibold text-star transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>

        <p className="mt-4 text-sm text-dim">
          No account?{' '}
          <Link to="/register" className="text-orbit">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
