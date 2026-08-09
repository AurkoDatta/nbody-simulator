/**
 * Pure data-transform helpers turning raw simulation frames into the
 * flat-row shape Recharts line charts expect. Kept separate from the
 * chart components themselves so the transform logic is testable
 * without rendering anything.
 */

/** Shared XAxis tick formatter -- raw frame timestamps carry full
 * floating-point precision (e.g. 0.8100000000000005), which reads as
 * noise on an axis; round to a readable couple of decimal places. */
export function formatTimeTick(t) {
  return t.toFixed(1)
}

/** Energy/momentum values cluster tightly around one magnitude (the
 * whole point of the chart is showing tiny drift), so fixed-decimal
 * ticks either truncate or show a wall of digits; exponential notation
 * stays compact regardless of how small the drift is. */
export function formatMagnitudeTick(value) {
  return value.toExponential(2)
}

export function energySeries(frames) {
  return frames.map((frame) => ({ t: frame.t, energy: frame.energy }))
}

export function momentumSeries(frames) {
  return frames.map((frame) => ({ t: frame.t, momentum: frame.momentum }))
}

/**
 * Distance from the origin per body, keyed by body id. Chosen over
 * distance-from-center-of-mass because frames don't carry per-frame
 * mass (a merged body's mass changes and isn't recorded per frame) --
 * distance-from-origin needs only the position data every frame
 * already has, and is one of the two chart options the spec allows.
 */
export function distanceFromOriginSeries(frames) {
  return frames.map((frame) => {
    const row = { t: frame.t }
    for (const body of frame.bodies) {
      row[body.id] = Math.hypot(body.x, body.y)
    }
    return row
  })
}
