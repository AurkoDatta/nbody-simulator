import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from '../context/AuthContext'
import LoginPage from '../pages/LoginPage'

function renderLoginPage(login) {
  return render(
    <AuthContext.Provider value={{ login }}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/builder" element={<div>Builder Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => vi.resetAllMocks())

  it('submits the entered credentials and navigates to the builder on success', async () => {
    const login = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderLoginPage(login)

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(login).toHaveBeenCalledWith('ada@example.com', 'secret123')
    await waitFor(() => expect(screen.getByText('Builder Page')).toBeInTheDocument())
  })

  it('shows the server error message when login fails', async () => {
    const login = vi.fn().mockRejectedValue({ response: { data: { error: { message: 'Invalid email or password.' } } } })
    const user = userEvent.setup()
    renderLoginPage(login)

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
  })
})
