/**
 * Total system energy over time. Should stay essentially flat -- this
 * is the primary visual signal for integrator/timestep correctness;
 * drift here reflects numerical error, not a real physical process.
 */
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { energySeries, formatMagnitudeTick, formatTimeTick } from './chartData'

function EnergyChart({ frames }) {
  const data = energySeries(frames)

  return (
    <div className="rounded-lg border border-dim/30 bg-panel p-4">
      <h3 className="mb-2 font-display text-sm font-semibold text-star">Energy</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#6B7488" strokeOpacity={0.15} vertical={false} />
          <XAxis dataKey="t" tickFormatter={formatTimeTick} stroke="#6B7488" tick={{ fill: '#6B7488', fontSize: 11 }} />
          <YAxis
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatMagnitudeTick}
            stroke="#6B7488"
            tick={{ fill: '#6B7488', fontSize: 11 }}
            width={80}
          />
          <Tooltip
            contentStyle={{ background: '#131826', border: '1px solid #6B748855', borderRadius: 6 }}
            labelStyle={{ color: '#6B7488' }}
            itemStyle={{ color: '#E8ECF7' }}
          />
          <Line type="monotone" dataKey="energy" stroke="#7CF29C" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EnergyChart
