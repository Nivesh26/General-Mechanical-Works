import { type ReactNode, useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

/**
 * Requires an authenticated user with role ADMIN. Others are redirected.
 */
export function AdminPrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading, token } = useAuth()
  const location = useLocation()
  const roleWarned = useRef(false)

  useEffect(() => {
    if (!loading && token && user && user.role !== 'ADMIN' && !roleWarned.current) {
      roleWarned.current = true
      toast.warning('Administrator access only.')
    }
  }, [loading, token, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Loading…
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
