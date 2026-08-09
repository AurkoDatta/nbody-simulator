import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import DiagnosticsPage from '../pages/DiagnosticsPage'
import * as simulationService from '../services/simulationService'

vi.mock('../services/simulationService')

const SIMULATION = {
  id: 'sim-1',
  name: 'Test Orbit',
  bodies: [
    { label: 'Alpha', color: '#4C6EF5' },
    { label: 'Beta', color: '#FF8A3D' },
  ],
  frames: [
    { t: 0, bodies: [{ id: 0, x: -0.5, y: 0 }, { id: 1, x: 0.5, y: 0 }], energy: -1.5, momentum: 0 },
    { t: 1, bodies: [{ id: 0, x: -0.4, y: 0.1 }, { id: 1, x: 0.4, y: -0.1 }], energy: -1.5001, momentum: 0.0002 },
  ],
  summary: { maxRelativeEnergyDrift: 0.0001, maxMomentumDrift: 0.0002, finalEnergy: -1.5001, finalMomentum: 0.0002 },
}

function renderDiagnosticsPage() {
  return render(
    <MemoryRouter initialEntries={['/simulations/sim-1/diagnostics']}>
      <Routes>
        <Route path="/simulations/:id/diagnostics" element={<DiagnosticsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DiagnosticsPage', () => {
  beforeEach(() => vi.resetAllMocks())

  it('loads the simulation and shows its name and drift summary', async () => {
    simulationService.getSimulation.mockResolvedValue(SIMULATION)
    renderDiagnosticsPage()

    expect(await screen.findByText('Test Orbit')).toBeInTheDocument()
    expect(simulationService.getSimulation).toHaveBeenCalledWith('sim-1')
    expect(screen.getByText('Energy')).toBeInTheDocument()
    expect(screen.getByText('Momentum')).toBeInTheDocument()
    expect(screen.getByText('Distance from origin')).toBeInTheDocument()
  })

  it('shows an error message when the simulation fails to load', async () => {
    simulationService.getSimulation.mockRejectedValue(new Error('not found'))
    renderDiagnosticsPage()

    expect(await screen.findByText(/unable to load this simulation/i)).toBeInTheDocument()
  })
})
