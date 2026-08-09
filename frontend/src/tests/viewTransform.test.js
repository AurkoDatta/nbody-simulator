import { describe, expect, it } from 'vitest'

import { computeViewTransform } from '../components/canvas/viewTransform'

describe('computeViewTransform', () => {
  it('maps the bounding-box center of all frames to the canvas center', () => {
    const frames = [
      { bodies: [{ id: 0, x: -10, y: 0 }, { id: 1, x: 10, y: 0 }] },
      { bodies: [{ id: 0, x: -5, y: -5 }, { id: 1, x: 5, y: 5 }] },
    ]

    const transform = computeViewTransform(frames, 400, 400, 20)

    expect(transform.toCanvas(0, 0)).toEqual({ x: 200, y: 200 })
  })

  it('flips the y axis (simulation y-up, canvas y-down)', () => {
    const frames = [{ bodies: [{ id: 0, x: 0, y: 10 }, { id: 1, x: 0, y: -10 }] }]

    const transform = computeViewTransform(frames, 400, 400, 20)

    const top = transform.toCanvas(0, 10)
    const bottom = transform.toCanvas(0, -10)
    expect(top.y).toBeLessThan(bottom.y)
  })

  it('keeps every plotted point within the padded canvas bounds', () => {
    const frames = [{ bodies: [{ id: 0, x: -3, y: 7 }, { id: 1, x: 12, y: -4 }] }]

    const transform = computeViewTransform(frames, 300, 300, 20)

    for (const body of frames[0].bodies) {
      const { x, y } = transform.toCanvas(body.x, body.y)
      expect(x).toBeGreaterThanOrEqual(20)
      expect(x).toBeLessThanOrEqual(280)
      expect(y).toBeGreaterThanOrEqual(20)
      expect(y).toBeLessThanOrEqual(280)
    }
  })

  it('does not produce NaN/Infinity when every point is identical or frames are empty', () => {
    const samePoint = computeViewTransform([{ bodies: [{ id: 0, x: 5, y: 5 }] }], 200, 200, 10)
    expect(Number.isFinite(samePoint.toCanvas(5, 5).x)).toBe(true)

    const empty = computeViewTransform([], 200, 200, 10)
    expect(Number.isFinite(empty.toCanvas(0, 0).x)).toBe(true)
  })
})
