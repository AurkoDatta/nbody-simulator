/**
 * Root placeholder shell for the N-Body Simulator frontend.
 *
 * This is scaffolding only -- routing, auth guards, and the real pages
 * (Builder, Playback, Diagnostics, Saved Simulations) are wired up in
 * later phases. It exists here to prove the Tailwind design tokens
 * (color/type) render correctly before any real UI is built on top of them.
 */
function App() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Orbit-trace signature motif: a hairline ellipse echoing the
          trajectory paths the app itself plots, reused here as ambient
          background texture rather than a decorative flourish. */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 400 400"
        aria-hidden="true"
      >
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="70"
          fill="none"
          stroke="#4C6EF5"
          strokeOpacity="0.25"
          strokeWidth="1"
          transform="rotate(-15 200 200)"
        />
      </svg>

      <div className="relative text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-dim">
          orbital dynamics console
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-star">
          N-Body Simulator
        </h1>
        <p className="readout mt-4 text-sm text-phosphor">
          energy drift 0.00e+00
        </p>
      </div>
    </div>
  )
}

export default App
