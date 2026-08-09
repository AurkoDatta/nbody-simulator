/**
 * Top navigation: app identity plus primary navigation links and a
 * logout control. Only ever rendered inside authenticated routes --
 * the login/register pages don't include it.
 */
import { Link } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

function NavBar() {
  const { user, logout } = useAuth()

  return (
    <nav className="flex items-center justify-between border-b border-dim/20 bg-panel px-6 py-4">
      <Link to="/builder" className="font-display text-lg font-bold text-star">
        N-Body Simulator
      </Link>
      <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-wide text-dim">
        <Link to="/builder" className="hover:text-star">
          Builder
        </Link>
        <Link to="/simulations" className="hover:text-star">
          Saved
        </Link>
        <span className="text-star">{user?.name}</span>
        <button type="button" onClick={logout} className="text-flare hover:text-star">
          Log out
        </button>
      </div>
    </nav>
  )
}

export default NavBar
