/**
 * Lists the current user's saved simulations, with rename, delete, and
 * open (jump straight to playback) actions. Rename/delete confirmation
 * uses the browser's native prompt/confirm dialogs -- simple, honest,
 * and sufficient for a two-field rename and a single destructive action.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { deleteSimulation, listSimulations, renameSimulation } from '../services/simulationService'

function SavedSimulationsPage() {
  const [simulations, setSimulations] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    listSimulations()
      .then(setSimulations)
      .catch(() => setError('Unable to load saved simulations.'))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleRename(id, currentName) {
    const nextName = window.prompt('Rename simulation', currentName)
    if (!nextName || nextName === currentName) return

    try {
      await renameSimulation(id, nextName)
      setSimulations((prev) => prev.map((sim) => (sim.id === id ? { ...sim, name: nextName } : sim)))
    } catch {
      setError('Unable to rename this simulation.')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this simulation? This cannot be undone.')) return

    try {
      await deleteSimulation(id)
      setSimulations((prev) => prev.filter((sim) => sim.id !== id))
    } catch {
      setError('Unable to delete this simulation.')
    }
  }

  if (isLoading) {
    return <p className="p-8 text-sm text-dim">Loading saved simulations...</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dim">Archive</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-star">Saved simulations</h1>
      </div>

      {error && <p className="text-sm text-flare">{error}</p>}

      {simulations.length === 0 ? (
        <p className="text-sm text-dim">No saved simulations yet -- build one to get started.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="font-mono text-xs uppercase tracking-wide text-dim">
            <tr>
              <th className="pb-2">Name</th>
              <th className="pb-2">Bodies</th>
              <th className="pb-2">Duration</th>
              <th className="pb-2">Created</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {simulations.map((sim) => (
              <tr key={sim.id} className="border-t border-dim/20">
                <td className="py-2 text-star">{sim.name}</td>
                <td className="readout py-2">{sim.bodyCount}</td>
                <td className="readout py-2">{sim.duration}</td>
                <td className="readout py-2 text-dim">{new Date(sim.createdAt).toLocaleDateString()}</td>
                <td className="space-x-3 py-2 text-right">
                  <Link to={`/simulations/${sim.id}/playback`} className="text-orbit hover:text-star">
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRename(sim.id, sim.name)}
                    className="text-dim hover:text-star"
                  >
                    Rename
                  </button>
                  <button type="button" onClick={() => handleDelete(sim.id)} className="text-flare hover:text-star">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default SavedSimulationsPage
