import { describe, expect, it } from 'vitest'

import { distanceFromOriginSeries, energySeries, momentumSeries } from '../components/charts/chartData'

const frames = [
  { t: 0, energy: -1.5, momentum: 0, bodies: [{ id: 0, x: 3, y: 4 }, { id: 1, x: 0, y: 0 }] },
  { t: 1, energy: -1.4999, momentum: 0.0002, bodies: [{ id: 0, x: 0, y: 5 }] },
]

describe('energySeries', () => {
  it('maps each frame to a {t, energy} point', () => {
    expect(energySeries(frames)).toEqual([
      { t: 0, energy: -1.5 },
      { t: 1, energy: -1.4999 },
    ])
  })
})

describe('momentumSeries', () => {
  it('maps each frame to a {t, momentum} point', () => {
    expect(momentumSeries(frames)).toEqual([
      { t: 0, momentum: 0 },
      { t: 1, momentum: 0.0002 },
    ])
  })
})

describe('distanceFromOriginSeries', () => {
  it('computes each present body\'s distance from the origin, keyed by id', () => {
    expect(distanceFromOriginSeries(frames)).toEqual([
      { t: 0, 0: 5, 1: 0 },
      { t: 1, 0: 5 },
    ])
  })
})
