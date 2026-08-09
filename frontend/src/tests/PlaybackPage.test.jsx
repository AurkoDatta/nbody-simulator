import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PlaybackPage from '../pages/PlaybackPage'
import * as simulationService from '../services/simulationService'

vi.mock('../services/simulationService')

const SIMULATION = {
  id: 'sim-1',
  name: 'Test Orbit',
  bodies: [
    { label: 'Alpha', mass: 1, position: { x: -0.5, y: 0 }, velocity: { vx: 0, vy: -0.5 }, color: '#4C6EF5' },
    { label: 'Beta', mass: 1, position: { x: 0.5, y: 0 }, velocity: { vx: 0, vy: 0.5 }, color: '#FF8A3D' },
  ],
  frames: [
    { t: 0, bodies: [{ id: 0, x: -0.5, y: 0 }, { id: 1, x: 0.5, y: 0 }], energy: -1.5, momentum: 0 },
    { t: 1, bodies: [{ id: 0, x: -0.4, y: 0.1 }, { id: 1, x: 0.4, y: -0.1 }], energy: -1.5, momentum: 0.001 },
  ],
  frameCount: 2,
  summary: { maxRelativeEnergyDrift: 0.0001 },
}

function renderPlaybackPage() {
  return render(
    <MemoryRouter initialEntries={['/simulations/sim-1/playback']}>
      <Routes>
        <Route path="/simulations/:id/playback" element={<PlaybackPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PlaybackPage', () => {
  beforeEach(() => vi.resetAllMocks())

  it('loads the simulation and shows its name and live readouts', async () => {
    simulationService.getSimulation.mockResolvedValue(SIMULATION)
    renderPlaybackPage()

    expect(await screen.findByText('Test Orbit')).toBeInTheDocument()
    expect(simulationService.getSimulation).toHaveBeenCalledWith('sim-1')
    expect(screen.getByText('-1.5000')).toBeInTheDocument()
  })

  it('shows an error message when the simulation fails to load', async () => {
    simulationService.getSimulation.mockRejectedValue(new Error('not found'))
    renderPlaybackPage()

    expect(await screen.findByText(/unable to load this simulation/i)).toBeInTheDocument()
  })
})
