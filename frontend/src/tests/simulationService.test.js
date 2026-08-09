import { beforeEach, describe, expect, it, vi } from 'vitest'

import apiClient from '../services/apiClient'
import * as simulationService from '../services/simulationService'

vi.mock('../services/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

describe('simulationService', () => {
  beforeEach(() => vi.resetAllMocks())

  it('getPresets fetches the built-in preset list', async () => {
    apiClient.get.mockResolvedValue({ data: [{ name: 'figure_eight' }] })

    const result = await simulationService.getPresets()

    expect(apiClient.get).toHaveBeenCalledWith('/presets')
    expect(result).toEqual([{ name: 'figure_eight' }])
  })

  it('createSimulation posts the config and returns the created simulation', async () => {
    const payload = { name: 'Test', bodies: [] }
    apiClient.post.mockResolvedValue({ data: { id: '1', ...payload } })

    const result = await simulationService.createSimulation(payload)

    expect(apiClient.post).toHaveBeenCalledWith('/simulations', payload)
    expect(result).toEqual({ id: '1', ...payload })
  })

  it('listSimulations fetches saved simulation metadata', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: '1' }] })

    const result = await simulationService.listSimulations()

    expect(apiClient.get).toHaveBeenCalledWith('/simulations')
    expect(result).toEqual([{ id: '1' }])
  })

  it('getSimulation fetches a single simulation by id', async () => {
    apiClient.get.mockResolvedValue({ data: { id: '1' } })

    const result = await simulationService.getSimulation('1')

    expect(apiClient.get).toHaveBeenCalledWith('/simulations/1')
    expect(result).toEqual({ id: '1' })
  })

  it('renameSimulation puts the new name', async () => {
    apiClient.put.mockResolvedValue({ data: { id: '1', name: 'New Name' } })

    const result = await simulationService.renameSimulation('1', 'New Name')

    expect(apiClient.put).toHaveBeenCalledWith('/simulations/1', { name: 'New Name' })
    expect(result).toEqual({ id: '1', name: 'New Name' })
  })

  it('deleteSimulation deletes by id', async () => {
    apiClient.delete.mockResolvedValue({})

    await simulationService.deleteSimulation('1')

    expect(apiClient.delete).toHaveBeenCalledWith('/simulations/1')
  })
})
