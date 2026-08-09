import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import BodyForm from '../components/builder/BodyForm'

async function fillAndSubmit(user, { label, mass, x, y, vx, vy }) {
  if (label !== undefined) await user.clear(screen.getByLabelText(/label/i)), await user.type(screen.getByLabelText(/label/i), label)
  if (mass !== undefined) {
    await user.clear(screen.getByLabelText(/mass/i))
    await user.type(screen.getByLabelText(/mass/i), mass)
  }
  await user.clear(screen.getByLabelText('X'))
  await user.type(screen.getByLabelText('X'), x)
  await user.clear(screen.getByLabelText('Y'))
  await user.type(screen.getByLabelText('Y'), y)
  await user.clear(screen.getByLabelText('VX'))
  await user.type(screen.getByLabelText('VX'), vx)
  await user.clear(screen.getByLabelText('VY'))
  await user.type(screen.getByLabelText('VY'), vy)
  await user.click(screen.getByRole('button', { name: /add body/i }))
}

describe('BodyForm', () => {
  it('calls onAdd with a parsed numeric body on valid submit', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<BodyForm onAdd={onAdd} />)

    await fillAndSubmit(user, { label: 'Alpha', mass: '2.5', x: '1', y: '-2', vx: '0.5', vy: '0' })

    expect(onAdd).toHaveBeenCalledWith({
      label: 'Alpha',
      mass: 2.5,
      position: { x: 1, y: -2 },
      velocity: { vx: 0.5, vy: 0 },
      color: expect.any(String),
    })
  })

  it('rejects non-positive mass without calling onAdd', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<BodyForm onAdd={onAdd} />)

    await fillAndSubmit(user, { label: 'Alpha', mass: '0', x: '1', y: '1', vx: '0', vy: '0' })

    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByText(/mass must be positive/i)).toBeInTheDocument()
  })
})
