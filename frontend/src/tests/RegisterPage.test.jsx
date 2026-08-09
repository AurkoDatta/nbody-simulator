import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from '../context/AuthContext'
import RegisterPage from '../pages/RegisterPage'

function renderRegisterPage(register) {
  return render(
    <AuthContext.Provider value={{ register }}>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/builder" element={<div>Builder Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('RegisterPage', () => {
  beforeEach(() => vi.resetAllMocks())

  it('submits name, email, and password and navigates to the builder on success', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderRegisterPage(register)

    await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(register).toHaveBeenCalledWith('Ada Lovelace', 'ada@example.com', 'secret123')
    await waitFor(() => expect(screen.getByText('Builder Page')).toBeInTheDocument())
  })

  it('shows the server error message when registration fails', async () => {
    const register = vi.fn().mockRejectedValue({ response: { data: { error: { message: 'An account with this email already exists.' } } } })
    const user = userEvent.setup()
    renderRegisterPage(register)

    await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument()
  })
})
