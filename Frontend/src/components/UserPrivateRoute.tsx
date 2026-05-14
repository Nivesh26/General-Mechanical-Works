import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Requires an authenticated session (JWT). Used for cart, checkout, etc.
 */
export function UserPrivateRoute({ children }: { children: ReactNode }) {
  const { loading, token } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Loading…
      </div>
    )
  }

  return <>{children}</>
}
