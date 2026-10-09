import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Ny espace client dia ho an'ny client ihany; ny admin dia mankany amin'ny espace-ny
export default function ClientRoute() {
  const { isAdmin } = useAuth()
  const { pathname } = useLocation()

  if (isAdmin) {
    return <Navigate to={pathname.startsWith('/profile') ? '/admin/profile' : '/admin'} replace />
  }

  return <Outlet />
}