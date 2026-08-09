/**
 * Controlled inputs for simulation-level parameters (name plus physics
 * constants and time controls). Purely presentational -- BuilderPage
 * owns the actual values and validation.
 */
const NUMERIC_FIELDS = [
  { key: 'gConstant', label: 'G (gravitational constant)' },
  { key: 'softening', label: 'Softening (epsilon)' },
  { key: 'mergeDistance', label: 'Merge distance' },
  { key: 'duration', label: 'Duration' },
  { key: 'timestep', label: 'Timestep' },
]

function SimulationParamsForm({ values, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <label htmlFor="param-name" className="col-span-2 block text-xs text-dim sm:col-span-3">
        Name
        <input
          id="param-name"
          type="text"
          value={values.name}
          onChange={(event) => onChange('name', event.target.value)}
          className="mt-1 w-full rounded border border-dim/40 bg-void px-2 py-1 text-star focus:border-orbit focus:outline-none"
        />
      </label>

      {NUMERIC_FIELDS.map(({ key, label }) => (
        <label key={key} htmlFor={`param-${key}`} className="block text-xs text-dim">
          {label}
          <input
            id={`param-${key}`}
            type="number"
            step="any"
            value={values[key]}
            onChange={(event) => onChange(key, Number(event.target.value))}
            className="mt-1 w-full rounded border border-dim/40 bg-void px-2 py-1 font-mono text-star focus:border-orbit focus:outline-none"
          />
        </label>
      ))}
    </div>
  )
}

export default SimulationParamsForm
