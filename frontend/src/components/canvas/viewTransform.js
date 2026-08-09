/**
 * Computes a single fixed scale + offset that fits every body position
 * across every frame of a simulation within the canvas (with padding).
 * Using one fixed transform for the whole trajectory -- rather than
 * re-fitting per frame -- keeps the camera stable; a per-frame fit
 * would make the view appear to zoom and pan every frame.
 */
export function computeViewTransform(frames, width, height, padding) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const frame of frames) {
    for (const body of frame.bodies) {
      if (body.x < minX) minX = body.x
      if (body.x > maxX) maxX = body.x
      if (body.y < minY) minY = body.y
      if (body.y > maxY) maxY = body.y
    }
  }

  // No data (empty frames) or nothing to bound against -- fall back to
  // a default unit view so callers never have to special-case this.
  if (!Number.isFinite(minX)) {
    minX = -1
    maxX = 1
    minY = -1
    maxY = 1
  }

  // A single point (or a perfectly still body) has zero range; clamp to
  // a tiny epsilon so the scale calculation below never divides by 0.
  const rangeX = Math.max(maxX - minX, 1e-6)
  const rangeY = Math.max(maxY - minY, 1e-6)
  const usableWidth = width - 2 * padding
  const usableHeight = height - 2 * padding
  const scale = Math.min(usableWidth / rangeX, usableHeight / rangeY)

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  return {
    scale,
    toCanvas(x, y) {
      return {
        x: width / 2 + (x - centerX) * scale,
        // Canvas y grows downward; simulation y grows upward, so flip.
        y: height / 2 - (y - centerY) * scale,
      }
    },
  }
}
