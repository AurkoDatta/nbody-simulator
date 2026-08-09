import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BuilderPage from '../pages/BuilderPage'
import * as simulationService from '../services/simulationService'

vi.mock('../services/simulationService')

const PRESET_BODIES = [
  { label: 'Alpha', mass: 1, position: { x: -0.5, y: 0 }, velocity: { vx: 0, vy: -0.5 }, color: '#4C6EF5' },
  { label: 'Beta', mass: 1, position: { x: 0.5, y: 0 }, velocity: { vx: 0, vy: 0.5 }, color: '#FF8A3D' },
]

function renderBuilderPage() {
  return render(
    <MemoryRouter initialEntries={['/builder']}>
      <Routes>
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/simulations/:id/playback" element={<div>Playback Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BuilderPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    simulationService.getPresets.mockResolvedValue([
      { name: 'figure_eight', label: 'Figure-Eight Orbit', description: 'desc', bodies: PRESET_BODIES },
    ])
  })

  it('shows a validation error when running with fewer than 2 bodies', async () => {
    const user = userEvent.setup()
    renderBuilderPage()

    await user.click(screen.getByRole('button', { name: /run simulation/i }))

    expect(await screen.findByText(/at least 2 bodies/i)).toBeInTheDocument()
    expect(simulationService.createSimulation).not.toHaveBeenCalled()
  })

  it('loads a preset, runs the simulation, and navigates to playback on success', async () => {
    simulationService.createSimulation.mockResolvedValue({ id: 'sim-1' })
    const user = userEvent.setup()
    renderBuilderPage()

    const presetButton = await screen.findByRole('button', { name: /figure-eight orbit/i })
    await user.click(presetButton)
    expect(screen.getByText('Alpha')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /run simulation/i }))

    await waitFor(() => expect(simulationService.createSimulation).toHaveBeenCalled())
    const payload = simulationService.createSimulation.mock.calls[0][0]
    expect(payload.bodies).toEqual(PRESET_BODIES)
    expect(payload.duration).toBeGreaterThan(0)
    await waitFor(() => expect(screen.getByText('Playback Page')).toBeInTheDocument())
  })
})
