/**
 * Form for adding one body to the simulation: label, mass, position,
 * velocity, and color. Deliberately has no "edit" mode -- removing and
 * re-adding a body is an acceptable workflow, so the form always starts
 * from a blank slate and just appends via onAdd.
 */
import { useState } from 'react'

const DEFAULT_COLOR = '#4C6EF5'

const EMPTY_FIELDS = { label: '', mass: '1', x: '0', y: '0', vx: '0', vy: '0', color: DEFAULT_COLOR }

function numberInput(id, labelText, value, onChange) {
  return (
    <label htmlFor={id} className="block text-xs text-dim">
      {labelText}
      <input
        id={id}
        type="number"
        step="any"
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded border border-dim/40 bg-void px-2 py-1 font-mono text-star focus:border-orbit focus:outline-none"
      />
    </label>
  )
}

function BodyForm({ onAdd }) {
  const [fields, setFields] = useState(EMPTY_FIELDS)
  const [error, setError] = useState(null)

  function updateField(key) {
    return (event) => setFields((prev) => ({ ...prev, [key]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const mass = Number(fields.mass)
    if (!(mass > 0)) {
      setError('Mass must be positive.')
      return
    }

    setError(null)
    onAdd({
      label: fields.label,
      mass,
      position: { x: Number(fields.x), y: Number(fields.y) },
      velocity: { vx: Number(fields.vx), vy: Number(fields.vy) },
      color: fields.color,
    })
    setFields(EMPTY_FIELDS)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-dim/30 bg-panel p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label htmlFor="body-label" className="col-span-2 block text-xs text-dim sm:col-span-1">
          Label
          <input
            id="body-label"
            type="text"
            value={fields.label}
            onChange={updateField('label')}
            className="mt-1 w-full rounded border border-dim/40 bg-void px-2 py-1 text-star focus:border-orbit focus:outline-none"
          />
        </label>

        <label htmlFor="body-mass" className="block text-xs text-dim">
          Mass
          <input
            id="body-mass"
            type="number"
            step="any"
            value={fields.mass}
            onChange={updateField('mass')}
            className="mt-1 w-full rounded border border-dim/40 bg-void px-2 py-1 font-mono text-star focus:border-orbit focus:outline-none"
          />
        </label>

        <label htmlFor="body-color" className="block text-xs text-dim">
          Color
          <input
            id="body-color"
            type="color"
            value={fields.color}
            onChange={updateField('color')}
            className="mt-1 h-8 w-full rounded border border-dim/40 bg-void"
          />
        </label>

        {numberInput('body-x', 'X', fields.x, updateField('x'))}
        {numberInput('body-y', 'Y', fields.y, updateField('y'))}
        {numberInput('body-vx', 'VX', fields.vx, updateField('vx'))}
        {numberInput('body-vy', 'VY', fields.vy, updateField('vy'))}
      </div>

      {error && <p className="mt-2 text-sm text-flare">{error}</p>}

      <button
        type="submit"
        className="mt-3 rounded bg-orbit px-4 py-1.5 text-sm font-semibold text-star"
      >
        Add body
      </button>
    </form>
  )
}

export default BodyForm
