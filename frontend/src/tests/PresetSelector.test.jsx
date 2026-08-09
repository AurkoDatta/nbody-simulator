import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PresetSelector from '../components/builder/PresetSelector'
import * as simulationService from '../services/simulationService'

vi.mock('../services/simulationService')

describe('PresetSelector', () => {
  beforeEach(() => vi.resetAllMocks())

  it('fetches presets and calls onSelect with the chosen preset bodies', async () => {
    simulationService.getPresets.mockResolvedValue([
      { name: 'figure_eight', label: 'Figure-Eight Orbit', description: 'desc', bodies: [{ label: 'Alpha' }] },
    ])
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<PresetSelector onSelect={onSelect} />)

    const button = await screen.findByRole('button', { name: /figure-eight orbit/i })
    await user.click(button)

    expect(onSelect).toHaveBeenCalledWith([{ label: 'Alpha' }])
  })

  it('shows an error message if presets fail to load', async () => {
    simulationService.getPresets.mockRejectedValue(new Error('network error'))
    render(<PresetSelector onSelect={vi.fn()} />)

    expect(await screen.findByText(/unable to load presets/i)).toBeInTheDocument()
  })
})
