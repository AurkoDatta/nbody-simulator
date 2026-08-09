/**
 * Name + email + password registration form. Mirrors LoginPage's
 * structure -- same redirect-on-success and server-error-message
 * conventions -- so the two auth flows feel identical apart from the
 * extra field.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await register(name, email, password)
      navigate('/builder')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to create an account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-dim/30 bg-panel p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dim">New Pilot</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-star">Create account</h1>

        <label htmlFor="register-name" className="mt-6 block text-sm text-star">
          Name
          <input
            id="register-name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded border border-dim/40 bg-void px-3 py-2 text-star focus:border-orbit focus:outline-none"
          />
        </label>

        <label htmlFor="register-email" className="mt-4 block text-sm text-star">
          Email
          <input
            id="register-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border border-dim/40 bg-void px-3 py-2 text-star focus:border-orbit focus:outline-none"
          />
        </label>

        <label htmlFor="register-password" className="mt-4 block text-sm text-star">
          Password
          <input
            id="register-password"
            type="password"
            required
            minLength={8}
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
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="mt-4 text-sm text-dim">
          Already have an account?{' '}
          <Link to="/login" className="text-orbit">
            Log in
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
