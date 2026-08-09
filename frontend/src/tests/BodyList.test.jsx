import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import BodyList from '../components/builder/BodyList'

const bodies = [
  { label: 'Alpha', mass: 1, position: { x: 0, y: 0 }, velocity: { vx: 0, vy: 0 }, color: '#4C6EF5' },
  { label: 'Beta', mass: 2, position: { x: 1, y: 1 }, velocity: { vx: 0, vy: 0 }, color: '#FF8A3D' },
]

describe('BodyList', () => {
  it('renders one row per body with its label and mass', () => {
    render(<BodyList bodies={bodies} onRemove={vi.fn()} />)

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('calls onRemove with the index of the removed body', async () => {
    const onRemove = vi.fn()
    const user = userEvent.setup()
    render(<BodyList bodies={bodies} onRemove={onRemove} />)

    await user.click(screen.getAllByRole('button', { name: /remove/i })[1])

    expect(onRemove).toHaveBeenCalledWith(1)
  })

  it('shows a placeholder message when there are no bodies yet', () => {
    render(<BodyList bodies={[]} onRemove={vi.fn()} />)

    expect(screen.getByText(/no bodies yet/i)).toBeInTheDocument()
  })
})
