import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import PlaybackControls from '../components/canvas/PlaybackControls'

function baseProps(overrides = {}) {
  return {
    isPlaying: false,
    onPlay: vi.fn(),
    onPause: vi.fn(),
    speed: 1,
    onSpeedChange: vi.fn(),
    simulatedTime: 2,
    maxTime: 10,
    onSeek: vi.fn(),
    ...overrides,
  }
}

describe('PlaybackControls', () => {
  it('shows Play and calls onPlay when paused', async () => {
    const props = baseProps({ isPlaying: false })
    const user = userEvent.setup()
    render(<PlaybackControls {...props} />)

    await user.click(screen.getByRole('button', { name: /play/i }))

    expect(props.onPlay).toHaveBeenCalled()
    expect(props.onPause).not.toHaveBeenCalled()
  })

  it('shows Pause and calls onPause when playing', async () => {
    const props = baseProps({ isPlaying: true })
    const user = userEvent.setup()
    render(<PlaybackControls {...props} />)

    await user.click(screen.getByRole('button', { name: /pause/i }))

    expect(props.onPause).toHaveBeenCalled()
    expect(props.onPlay).not.toHaveBeenCalled()
  })

  it('calls onSpeedChange with the selected multiplier', async () => {
    const props = baseProps()
    const user = userEvent.setup()
    render(<PlaybackControls {...props} />)

    await user.click(screen.getByRole('button', { name: '4x' }))

    expect(props.onSpeedChange).toHaveBeenCalledWith(4)
  })

  it('calls onSeek with a number when the scrub bar changes', () => {
    const props = baseProps()
    render(<PlaybackControls {...props} />)

    fireEvent.change(screen.getByLabelText(/scrub/i), { target: { value: '5' } })

    expect(props.onSeek).toHaveBeenCalledWith(5)
  })
})
