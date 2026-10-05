import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function VerifiedRoute() {
  const { isVerified } = useAuth()
  const location = useLocation()

  if (!isVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />
  }

  return <Outlet />
}