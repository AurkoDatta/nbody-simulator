/**
 * Fetches a saved simulation's downsampled trajectory and drives canvas
 * playback: play/pause/speed/scrub controls plus a live readout of
 * elapsed simulation time, energy, and momentum for the frame currently
 * on screen.
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import PlaybackControls from '../components/canvas/PlaybackControls'
import TrajectoryCanvas from '../components/canvas/TrajectoryCanvas'
import { useSimulationPlayback } from '../hooks/useSimulationPlayback'
import { getSimulation } from '../services/simulationService'

function PlaybackPage() {
  const { id } = useParams()
  const [simulation, setSimulation] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSimulation(id)
      .then(setSimulation)
      .catch(() => setError('Unable to load this simulation.'))
  }, [id])

  const frames = simulation?.frames ?? []
  const playback = useSimulationPlayback(frames)

  if (error) {
    return <p className="p-8 text-sm text-flare">{error}</p>
  }
  if (!simulation) {
    return <p className="p-8 text-sm text-dim">Loading simulation...</p>
  }

  // Frame body ids are assigned by array index at simulation creation
  // time (see backend simulation_service.py), so the original config's
  // body order is the id -> {color, label} lookup we need for rendering.
  const bodyMeta = simulation.bodies.reduce((acc, body, index) => {
    acc[index] = { color: body.color, label: body.label }
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dim">Playback</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-star">{simulation.name}</h1>
      </div>

      <TrajectoryCanvas frames={frames} currentIndex={playback.currentIndex} bodyMeta={bodyMeta} />

      <PlaybackControls
        isPlaying={playback.isPlaying}
        onPlay={playback.play}
        onPause={playback.pause}
        speed={playback.speed}
        onSpeedChange={playback.setSpeed}
        simulatedTime={playback.simulatedTime}
        maxTime={playback.maxTime}
        onSeek={playback.seek}
      />

      <div className="grid grid-cols-3 gap-4 rounded-lg border border-dim/30 bg-panel p-4 text-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-dim">Elapsed time</p>
          <p className="readout mt-1 text-lg text-star">{playback.currentFrame?.t.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-dim">Energy</p>
          <p className="readout mt-1 text-lg text-phosphor">{playback.currentFrame?.energy.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-dim">Momentum</p>
          <p className="readout mt-1 text-lg text-flare">{playback.currentFrame?.momentum.toFixed(4)}</p>
        </div>
      </div>

      <Link to={`/simulations/${id}/diagnostics`} className="inline-block text-sm text-orbit">
        View diagnostics &rarr;
      </Link>
    </div>
  )
}

export default PlaybackPage
