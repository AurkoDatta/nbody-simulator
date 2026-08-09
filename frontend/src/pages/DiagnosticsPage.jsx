import { useParams } from 'react-router-dom'

/** Placeholder -- energy/momentum/distance diagnostics charts are implemented in a later phase. */
function DiagnosticsPage() {
  const { id } = useParams()
  return <div className="p-8 font-body text-star">Diagnostics for simulation {id} coming soon.</div>
}

export default DiagnosticsPage
