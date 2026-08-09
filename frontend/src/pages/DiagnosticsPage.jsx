/**
 * Energy, momentum, and per-body distance diagnostics for a saved
 * simulation -- visualizes numerical drift as a correctness check on
 * the integrator (both charts should read essentially flat).
 */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import DistanceChart from '../components/charts/DistanceChart'
import EnergyChart from '../components/charts/EnergyChart'
import MomentumChart from '../components/charts/MomentumChart'
import { getSimulation } from '../services/simulationService'

const STAT_TONE_CLASS = { phosphor: 'text-phosphor', orbit: 'text-orbit', star: 'text-star' }

function Stat({ label, value, tone = 'star' }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-dim">{label}</p>
      <p className={`readout mt-1 text-sm ${STAT_TONE_CLASS[tone]}`}>{value?.toExponential(3)}</p>
    </div>
  )
}

function DiagnosticsPage() {
  const { id } = useParams()
  const [simulation, setSimulation] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSimulation(id)
      .then(setSimulation)
      .catch(() => setError('Unable to load this simulation.'))
  }, [id])

  if (error) {
    return <p className="p-8 text-sm text-flare">{error}</p>
  }
  if (!simulation) {
    return <p className="p-8 text-sm text-dim">Loading simulation...</p>
  }

  const bodyMeta = simulation.bodies.reduce((acc, body, index) => {
    acc[index] = { color: body.color, label: body.label }
    return acc
  }, {})
  const { summary } = simulation

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dim">Diagnostics</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-star">{simulation.name}</h1>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-dim/30 bg-panel p-4 sm:grid-cols-4">
          <Stat label="Max energy drift" value={summary.maxRelativeEnergyDrift} tone="phosphor" />
          <Stat label="Max momentum drift" value={summary.maxMomentumDrift} tone="orbit" />
          <Stat label="Final energy" value={summary.finalEnergy} />
          <Stat label="Final momentum" value={summary.finalMomentum} />
        </div>
      )}

      <EnergyChart frames={simulation.frames} />
      <MomentumChart frames={simulation.frames} />
      <DistanceChart frames={simulation.frames} bodyMeta={bodyMeta} />
    </div>
  )
}

export default DiagnosticsPage
