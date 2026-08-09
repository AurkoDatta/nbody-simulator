/**
 * Thin wrapper around the presets/simulations endpoints -- keeps axios
 * calls and response-shape knowledge out of pages/components.
 */
import apiClient from './apiClient'

export async function getPresets() {
  const { data } = await apiClient.get('/presets')
  return data
}

export async function createSimulation(config) {
  const { data } = await apiClient.post('/simulations', config)
  return data
}

export async function listSimulations() {
  const { data } = await apiClient.get('/simulations')
  return data
}

export async function getSimulation(id) {
  const { data } = await apiClient.get(`/simulations/${id}`)
  return data
}

export async function renameSimulation(id, name) {
  const { data } = await apiClient.put(`/simulations/${id}`, { name })
  return data
}

export async function deleteSimulation(id) {
  await apiClient.delete(`/simulations/${id}`)
}
