import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SavedSimulationsPage from '../pages/SavedSimulationsPage'
import * as simulationService from '../services/simulationService'

vi.mock('../services/simulationService')

const SIMULATIONS = [
  { id: '1', name: 'First Orbit', bodyCount: 3, duration: 10, timestep: 0.01, createdAt: '2026-08-01T00:00:00Z' },
  { id: '2', name: 'Second Orbit', bodyCount: 2, duration: 5, timestep: 0.01, createdAt: '2026-08-02T00:00:00Z' },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <SavedSimulationsPage />
    </MemoryRouter>,
  )
}

describe('SavedSimulationsPage', () => {
  beforeEach(() => vi.resetAllMocks())
  afterEach(() => vi.restoreAllMocks())

  it('lists saved simulations', async () => {
    simulationService.listSimulations.mockResolvedValue(SIMULATIONS)
    renderPage()

    expect(await screen.findByText('First Orbit')).toBeInTheDocument()
    expect(screen.getByText('Second Orbit')).toBeInTheDocument()
  })

  it('shows a placeholder when there are no saved simulations', async () => {
    simulationService.listSimulations.mockResolvedValue([])
    renderPage()

    expect(await screen.findByText(/no saved simulations yet/i)).toBeInTheDocument()
  })

  it('renames a simulation via the Rename action', async () => {
    simulationService.listSimulations.mockResolvedValue(SIMULATIONS)
    simulationService.renameSimulation.mockResolvedValue({})
    vi.spyOn(window, 'prompt').mockReturnValue('Renamed Orbit')
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('First Orbit')

    await user.click(screen.getAllByRole('button', { name: /rename/i })[0])

    expect(simulationService.renameSimulation).toHaveBeenCalledWith('1', 'Renamed Orbit')
    await waitFor(() => expect(screen.getByText('Renamed Orbit')).toBeInTheDocument())
  })

  it('deletes a simulation via the Delete action after confirming', async () => {
    simulationService.listSimulations.mockResolvedValue(SIMULATIONS)
    simulationService.deleteSimulation.mockResolvedValue(undefined)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('First Orbit')

    await user.click(screen.getAllByRole('button', { name: /delete/i })[0])

    expect(simulationService.deleteSimulation).toHaveBeenCalledWith('1')
    await waitFor(() => expect(screen.queryByText('First Orbit')).not.toBeInTheDocument())
    expect(screen.getByText('Second Orbit')).toBeInTheDocument()
  })

  it('does not delete when the user cancels the confirmation', async () => {
    simulationService.listSimulations.mockResolvedValue(SIMULATIONS)
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('First Orbit')

    await user.click(screen.getAllByRole('button', { name: /delete/i })[0])

    expect(simulationService.deleteSimulation).not.toHaveBeenCalled()
    expect(screen.getByText('First Orbit')).toBeInTheDocument()
  })
})
