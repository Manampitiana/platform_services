import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function GuestRoute() {
  const { isAuthenticated, isVerified, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (isAuthenticated) {
    const from = location.state?.from

    if (!isVerified) return <Navigate to="/verify-email" state={{ from }} replace />

    const fallback = isAdmin ? '/admin' : '/dashboard'
    return <Navigate to={from ? `${from.pathname}${from.search}` : fallback} replace />
  }

  return <Outlet />
}