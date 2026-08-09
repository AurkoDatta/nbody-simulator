/**
 * Fetches the built-in presets once on mount and renders a button per
 * preset; selecting one replaces the current body list in the builder.
 */
import { useEffect, useState } from 'react'

import { getPresets } from '../../services/simulationService'

function PresetSelector({ onSelect }) {
  const [presets, setPresets] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getPresets()
      .then(setPresets)
      .catch(() => setError('Unable to load presets.'))
  }, [])

  if (error) {
    return <p className="text-sm text-flare">{error}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset.name}
          type="button"
          onClick={() => onSelect(preset.bodies)}
          title={preset.description}
          className="rounded border border-orbit/50 px-3 py-1.5 text-sm text-orbit hover:bg-orbit/10"
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}

export default PresetSelector
