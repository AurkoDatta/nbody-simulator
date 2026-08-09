import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import SimulationParamsForm from '../components/builder/SimulationParamsForm'

const initialValues = { name: '', gConstant: 1, softening: 0.01, mergeDistance: 0.05, duration: 10, timestep: 0.01 }

function StatefulForm({ onChange }) {
  const [values, setValues] = useState(initialValues)
  return (
    <SimulationParamsForm
      values={values}
      onChange={(key, value) => {
        setValues((prev) => ({ ...prev, [key]: value }))
        onChange(key, value)
      }}
    />
  )
}

describe('SimulationParamsForm', () => {
  it('calls onChange with the field key and new value when an input changes', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<StatefulForm onChange={onChange} />)

    await user.type(screen.getByLabelText(/name/i), 'X')

    expect(onChange).toHaveBeenCalledWith('name', 'X')
  })

  it('parses numeric fields as numbers', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<StatefulForm onChange={onChange} />)

    await user.clear(screen.getByLabelText(/duration/i))
    await user.type(screen.getByLabelText(/duration/i), '5')

    expect(onChange).toHaveBeenLastCalledWith('duration', 5)
  })
})
