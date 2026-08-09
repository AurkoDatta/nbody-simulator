import { useParams } from 'react-router-dom'

/** Placeholder -- canvas trajectory playback is implemented in a later phase. */
function PlaybackPage() {
  const { id } = useParams()
  return <div className="p-8 font-body text-star">Playback for simulation {id} coming soon.</div>
}

export default PlaybackPage
