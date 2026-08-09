/**
 * Read-only table of bodies added so far, each with a swatch and a
 * remove button. Bodies are addressed by array index since the builder
 * doesn't assign ids until the simulation is actually created.
 */
function BodyList({ bodies, onRemove }) {
  if (bodies.length === 0) {
    return <p className="text-sm text-dim">No bodies yet -- add one below or load a preset.</p>
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="font-mono text-xs uppercase tracking-wide text-dim">
        <tr>
          <th className="pb-2">Label</th>
          <th className="pb-2">Mass</th>
          <th className="pb-2">Position</th>
          <th className="pb-2">Velocity</th>
          <th className="pb-2" />
        </tr>
      </thead>
      <tbody>
        {bodies.map((body, index) => (
          <tr key={index} className="border-t border-dim/20">
            <td className="py-2">
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: body.color }} />
              {body.label || `Body ${index + 1}`}
            </td>
            <td className="readout py-2">{body.mass}</td>
            <td className="readout py-2">
              ({body.position.x}, {body.position.y})
            </td>
            <td className="readout py-2">
              ({body.velocity.vx}, {body.velocity.vy})
            </td>
            <td className="py-2 text-right">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-flare hover:text-star"
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default BodyList
