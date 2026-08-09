/**
 * Transport controls: play/pause toggle, speed selector (0.5x-4x), and
 * a scrub bar over simulated time. Purely presentational -- the parent
 * owns actual playback state via useSimulationPlayback.
 */
const SPEED_OPTIONS = [0.5, 1, 2, 4]

function PlaybackControls({ isPlaying, onPlay, onPause, speed, onSpeedChange, simulatedTime, maxTime, onSeek }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dim/30 bg-panel p-4">
      <button
        type="button"
        onClick={isPlaying ? onPause : onPlay}
        className="rounded bg-orbit px-4 py-1.5 text-sm font-semibold text-star"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      <div className="flex items-center gap-1">
        {SPEED_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSpeedChange(option)}
            className={`rounded px-2 py-1 text-xs font-mono ${
              option === speed ? 'bg-orbit text-star' : 'text-dim hover:text-star'
            }`}
          >
            {option}x
          </button>
        ))}
      </div>

      <input
        type="range"
        aria-label="Scrub"
        min={0}
        max={maxTime}
        step="any"
        value={simulatedTime}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="min-w-[160px] flex-1 accent-orbit"
      />

      <span className="readout text-xs text-dim">
        t = {simulatedTime.toFixed(2)} / {maxTime.toFixed(2)}
      </span>
    </div>
  )
}

export default PlaybackControls
