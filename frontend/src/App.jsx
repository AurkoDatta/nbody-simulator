import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import NavBar from './components/layout/NavBar'
import PrivateRoute from './components/layout/PrivateRoute'
import { AuthProvider } from './context/AuthContext'
import BuilderPage from './pages/BuilderPage'
import DiagnosticsPage from './pages/DiagnosticsPage'
import LoginPage from './pages/LoginPage'
import PlaybackPage from './pages/PlaybackPage'
import RegisterPage from './pages/RegisterPage'
import SavedSimulationsPage from './pages/SavedSimulationsPage'

/** Authenticated-area chrome: nav bar above whatever page is active. */
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-void">
      <NavBar />
      {children}
    </div>
  )
}

function PrivatePage({ children }) {
  return (
    <PrivateRoute>
      <AppLayout>{children}</AppLayout>
    </PrivateRoute>
  )
}

/**
 * Route table for the whole app. Auth pages are public; everything
 * else requires a session (enforced by PrivateRoute, which redirects
 * to /login) and is wrapped with the shared nav chrome.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/builder"
            element={
              <PrivatePage>
                <BuilderPage />
              </PrivatePage>
            }
          />
          <Route
            path="/simulations"
            element={
              <PrivatePage>
                <SavedSimulationsPage />
              </PrivatePage>
            }
          />
          <Route
            path="/simulations/:id/playback"
            element={
              <PrivatePage>
                <PlaybackPage />
              </PrivatePage>
            }
          />
          <Route
            path="/simulations/:id/diagnostics"
            element={
              <PrivatePage>
                <DiagnosticsPage />
              </PrivatePage>
            }
          />
          <Route path="/" element={<Navigate to="/builder" replace />} />
          <Route path="*" element={<Navigate to="/builder" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
