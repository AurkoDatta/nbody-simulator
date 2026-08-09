/**
 * Raw HTML5 Canvas trajectory renderer -- no game engine, direct 2D
 * context calls. Draws each body as a filled circle at its current
 * frame position, trailed by a fading path of its recent positions.
 */
import { useEffect, useMemo, useRef } from 'react'

import { computeViewTransform } from './viewTransform'

const TRAIL_LENGTH = 150
const BODY_RADIUS = 5

function TrajectoryCanvas({ frames, currentIndex, bodyMeta, width = 640, height = 480 }) {
  const canvasRef = useRef(null)
  // Trails persist across renders (they're playback history, not
  // per-render state) but must never trigger a re-render themselves --
  // a plain ref, mutated directly, is the right tool here.
  const trailsRef = useRef(new Map())
  const lastIndexRef = useRef(-1)

  const transform = useMemo(() => computeViewTransform(frames, width, height, 40), [frames, width, height])

  useEffect(() => {
    const frame = frames[currentIndex]
    const ctx = canvasRef.current?.getContext('2d')
    if (!frame || !ctx) return

    // A trail is only meaningful as a continuous forward history. If
    // the user scrubbed backward, the accumulated trail no longer
    // corresponds to "what just happened" -- drop it and rebuild
    // forward from here rather than show a trail that runs the wrong way.
    if (currentIndex < lastIndexRef.current) {
      trailsRef.current = new Map()
    }
    lastIndexRef.current = currentIndex

    for (const body of frame.bodies) {
      const trail = trailsRef.current.get(body.id) ?? []
      trail.push(transform.toCanvas(body.x, body.y))
      if (trail.length > TRAIL_LENGTH) trail.shift()
      trailsRef.current.set(body.id, trail)
    }

    ctx.fillStyle = '#0B0E17'
    ctx.fillRect(0, 0, width, height)

    for (const body of frame.bodies) {
      const color = bodyMeta[body.id]?.color ?? '#4C6EF5'
      const trail = trailsRef.current.get(body.id)

      if (trail && trail.length > 1) {
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        trail.forEach((point, index) => {
          // Older points fade out -- alpha ramps from ~0 at the tail to
          // full opacity at the current position.
          ctx.globalAlpha = index / trail.length
          if (index === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      const { x, y } = transform.toCanvas(body.x, body.y)
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.arc(x, y, BODY_RADIUS, 0, 2 * Math.PI)
      ctx.fill()
    }
  }, [frames, currentIndex, bodyMeta, transform, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-dim/30"
    />
  )
}

export default TrajectoryCanvas
