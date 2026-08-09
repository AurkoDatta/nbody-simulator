import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  advanceSimulatedTime,
  findFrameIndexForTime,
  useSimulationPlayback,
} from '../hooks/useSimulationPlayback'

describe('findFrameIndexForTime', () => {
  const frames = [{ t: 0 }, { t: 0.1 }, { t: 0.5 }, { t: 2.0 }]

  it('returns 0 for a time before the first frame', () => {
    expect(findFrameIndexForTime(frames, -1)).toBe(0)
  })

  it('returns the last frame for a time after the final frame', () => {
    expect(findFrameIndexForTime(frames, 100)).toBe(3)
  })

  it('returns the last frame whose t does not exceed the given time', () => {
    expect(findFrameIndexForTime(frames, 0.3)).toBe(1)
    expect(findFrameIndexForTime(frames, 0.5)).toBe(2)
  })
})

describe('advanceSimulatedTime', () => {
  it('advances by realDelta scaled by speed', () => {
    expect(advanceSimulatedTime(1, 0.5, 2, 100)).toBeCloseTo(2)
  })

  it('clamps to maxTime rather than overshooting', () => {
    expect(advanceSimulatedTime(9.5, 1, 1, 10)).toBe(10)
  })

  it('never goes negative', () => {
    expect(advanceSimulatedTime(0, -5, 1, 10)).toBe(0)
  })
})

describe('useSimulationPlayback', () => {
  const frames = [
    { t: 0, bodies: [{ id: 0, x: 0, y: 0 }] },
    { t: 1, bodies: [{ id: 0, x: 1, y: 0 }] },
    { t: 2, bodies: [{ id: 0, x: 2, y: 0 }] },
  ]

  it('starts paused at the first frame', () => {
    const { result } = renderHook(() => useSimulationPlayback(frames))

    expect(result.current.isPlaying).toBe(false)
    expect(result.current.currentFrame).toEqual(frames[0])
  })

  it('seek jumps directly to the frame for a given time', () => {
    const { result } = renderHook(() => useSimulationPlayback(frames))

    act(() => result.current.seek(1))

    expect(result.current.currentFrame).toEqual(frames[1])
  })

  it('seek clamps to the simulation duration', () => {
    const { result } = renderHook(() => useSimulationPlayback(frames))

    act(() => result.current.seek(999))

    expect(result.current.currentFrame).toEqual(frames[2])
  })

  it('play/pause toggle isPlaying', () => {
    const { result } = renderHook(() => useSimulationPlayback(frames))

    act(() => result.current.play())
    expect(result.current.isPlaying).toBe(true)

    act(() => result.current.pause())
    expect(result.current.isPlaying).toBe(false)
  })

  it('setSpeed updates the speed multiplier', () => {
    const { result } = renderHook(() => useSimulationPlayback(frames))

    act(() => result.current.setSpeed(4))

    expect(result.current.speed).toBe(4)
  })
})
