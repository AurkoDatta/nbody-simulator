/**
 * Simulation builder: configure bodies (manually or via a preset), set
 * simulation-level parameters, and run the simulation. On success,
 * navigates straight to the playback page for the freshly computed
 * trajectory. Body-count and duration/timestep bounds mirror the
 * backend's validators.py -- the server is still the source of truth,
 * this is just a fast local check so obvious mistakes don't round-trip.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BodyForm from '../components/builder/BodyForm'
import BodyList from '../components/builder/BodyList'
import PresetSelector from '../components/builder/PresetSelector'
import SimulationParamsForm from '../components/builder/SimulationParamsForm'
import { createSimulation } from '../services/simulationService'

const MIN_BODIES = 2
const MAX_BODIES = 10

const DEFAULT_PARAMS = {
  name: '',
  gConstant: 1,
  softening: 0.01,
  mergeDistance: 0.05,
  duration: 10,
  timestep: 0.01,
}

function BuilderPage() {
  const navigate = useNavigate()
  const [bodies, setBodies] = useState([])
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function addBody(body) {
    setBodies((prev) => (prev.length >= MAX_BODIES ? prev : [...prev, body]))
  }

  function removeBody(index) {
    setBodies((prev) => prev.filter((_, i) => i !== index))
  }

  function loadPreset(presetBodies) {
    setBodies(presetBodies.slice(0, MAX_BODIES))
  }

  function updateParam(key, value) {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  async function handleRun() {
    setError(null)

    if (bodies.length < MIN_BODIES) {
      setError(`Add at least ${MIN_BODIES} bodies before running.`)
      return
    }
    if (!(params.duration > 0) || !(params.timestep > 0)) {
      setError('Duration and timestep must be positive.')
      return
    }

    setIsSubmitting(true)
    try {
      const simulation = await createSimulation({ ...params, bodies })
      navigate(`/simulations/${simulation.id}/playback`)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to run simulation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dim">Configure</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-star">Build a simulation</h1>
      </div>

      <section>
        <h2 className="mb-2 font-display text-sm font-semibold text-star">Presets</h2>
        <PresetSelector onSelect={loadPreset} />
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-semibold text-star">
          Bodies ({bodies.length}/{MAX_BODIES})
        </h2>
        <BodyList bodies={bodies} onRemove={removeBody} />
        {bodies.length < MAX_BODIES && (
          <div className="mt-3">
            <BodyForm onAdd={addBody} />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-semibold text-star">Parameters</h2>
        <SimulationParamsForm values={params} onChange={updateParam} />
      </section>

      {error && <p className="text-sm text-flare">{error}</p>}

      <button
        type="button"
        onClick={handleRun}
        disabled={isSubmitting}
        className="rounded bg-orbit px-6 py-2 font-semibold text-star transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? 'Running...' : 'Run simulation'}
      </button>
    </div>
  )
}

export default BuilderPage
