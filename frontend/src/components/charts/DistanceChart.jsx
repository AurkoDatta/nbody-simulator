/**
 * Per-body distance from the origin over time. Each line reuses that
 * body's own color from the builder/canvas (bodyMeta) rather than a
 * generated categorical ramp -- so a body's identity reads the same
 * way here as it does in the trajectory canvas, which matters more for
 * this app than perfectly balanced categorical lightness. A line simply
 * stops if that body was absorbed in a collision merge.
 */
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { distanceFromOriginSeries, formatTimeTick } from './chartData'

function DistanceChart({ frames, bodyMeta }) {
  const data = distanceFromOriginSeries(frames)
  const bodyIds = Object.keys(bodyMeta)

  return (
    <div className="rounded-lg border border-dim/30 bg-panel p-4">
      <h3 className="mb-2 font-display text-sm font-semibold text-star">Distance from origin</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#6B7488" strokeOpacity={0.15} vertical={false} />
          <XAxis dataKey="t" tickFormatter={formatTimeTick} stroke="#6B7488" tick={{ fill: '#6B7488', fontSize: 11 }} />
          <YAxis stroke="#6B7488" tick={{ fill: '#6B7488', fontSize: 11 }} width={70} />
          <Tooltip
            contentStyle={{ background: '#131826', border: '1px solid #6B748855', borderRadius: 6 }}
            labelStyle={{ color: '#6B7488' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#6B7488' }} />
          {bodyIds.map((id) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              name={bodyMeta[id].label || `Body ${id}`}
              stroke={bodyMeta[id].color}
              strokeWidth={2}
              isAnimationActive={false}
              dot={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DistanceChart
