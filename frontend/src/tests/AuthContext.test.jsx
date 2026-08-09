import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { TOKEN_STORAGE_KEY, UNAUTHORIZED_EVENT } from '../services/apiClient'
import * as authService from '../services/authService'

vi.mock('../services/authService')

function Probe() {
  const { user, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="status">{isAuthenticated ? 'in' : 'out'}</span>
      <span data-testid="name">{user?.name ?? 'none'}</span>
      <button onClick={() => login('ada@example.com', 'secret123')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthProvider / useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('starts unauthenticated when nothing is stored', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    expect(screen.getByTestId('status')).toHaveTextContent('out')
  })

  it('becomes authenticated after a successful login', async () => {
    authService.login.mockResolvedValue({ token: 'tok', user: { id: '1', name: 'Ada' } })
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await user.click(screen.getByText('login'))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('in'))
    expect(screen.getByTestId('name')).toHaveTextContent('Ada')
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('tok')
  })

  it('clears session on logout', async () => {
    authService.login.mockResolvedValue({ token: 'tok', user: { id: '1', name: 'Ada' } })
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await user.click(screen.getByText('login'))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('in'))

    await user.click(screen.getByText('logout'))

    expect(screen.getByTestId('status')).toHaveTextContent('out')
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('clears session when the apiClient reports an unauthorized response', async () => {
    authService.login.mockResolvedValue({ token: 'tok', user: { id: '1', name: 'Ada' } })
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await user.click(screen.getByText('login'))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('in'))

    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('out'))
  })
})
