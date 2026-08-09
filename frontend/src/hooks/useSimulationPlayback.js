/**
 * Drives simulation playback over a list of frames that are NOT evenly
 * spaced in time (the backend downsamples non-uniformly, keeping extra
 * frames around collision events). Playback therefore advances by
 * *simulated time*, not by incrementing a frame index each tick --
 * otherwise a frame covering a long real-time gap would flash past at
 * the same rate as a tightly packed one, and the 0.5x-4x speed control
 * wouldn't correspond to real simulation seconds.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

/** Binary search for the last frame whose t does not exceed `time`. */
export function findFrameIndexForTime(frames, time) {
  let low = 0
  let high = frames.length - 1
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (frames[mid].t <= time) {
      low = mid
    } else {
      high = mid - 1
    }
  }
  return low
}

/** Advance simulated time by real elapsed seconds scaled by speed, clamped to [0, maxTime]. */
export function advanceSimulatedTime(currentTime, realDeltaSeconds, speed, maxTime) {
  const next = currentTime + realDeltaSeconds * speed
  return Math.min(Math.max(next, 0), maxTime)
}

export function useSimulationPlayback(frames) {
  const maxTime = frames.length > 0 ? frames[frames.length - 1].t : 0
  const [simulatedTime, setSimulatedTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const animationFrameRef = useRef(null)
  const lastTimestampRef = useRef(null)

  useEffect(() => {
    if (!isPlaying) {
      return undefined
    }

    function tick(timestamp) {
      if (lastTimestampRef.current == null) {
        lastTimestampRef.current = timestamp
      }
      const realDeltaSeconds = (timestamp - lastTimestampRef.current) / 1000
      lastTimestampRef.current = timestamp

      setSimulatedTime((prev) => {
        const next = advanceSimulatedTime(prev, realDeltaSeconds, speed, maxTime)
        if (next >= maxTime) {
          setIsPlaying(false)
        }
        return next
      })

      animationFrameRef.current = requestAnimationFrame(tick)
    }

    animationFrameRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(animationFrameRef.current)
      lastTimestampRef.current = null
    }
  }, [isPlaying, speed, maxTime])

  const currentIndex = frames.length > 0 ? findFrameIndexForTime(frames, simulatedTime) : 0
  const currentFrame = frames[currentIndex] ?? null

  const play = useCallback(() => setIsPlaying(true), [])
  const pause = useCallback(() => setIsPlaying(false), [])
  const seek = useCallback((time) => setSimulatedTime(Math.min(Math.max(time, 0), maxTime)), [maxTime])

  return {
    currentFrame,
    currentIndex,
    simulatedTime,
    isPlaying,
    speed,
    setSpeed,
    play,
    pause,
    seek,
    maxTime,
  }
}
