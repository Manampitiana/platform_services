import { Globe, LayoutDashboard, PlusCircle, ShieldCheck, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useUnread } from '../hooks/useUnread'
import AppShell from '../components/layout/AppShell'

export default function ClientLayout() {
  const { user, logout, isAdmin } = useAuth()
  const { data: unread } = useUnread()

  const sections = [
    {
      title: 'Menu',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/orders', label: 'My orders', icon: ShoppingBag, end: true, badge: unread?.total },
        { to: '/services', label: 'New order', icon: PlusCircle },
      ],
    },
    {
      title: 'Account',
      items: [{ to: '/profile', label: 'Profile', icon: User }],
    },
  ]

  const menuItems = [
    { to: '/profile', label: 'Profile', icon: User },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin panel', icon: ShieldCheck }] : []),
    { to: '/', label: 'Public website', icon: Globe },
  ]

  return (
    <AppShell
      variant="client"
      brand="DigitalHub"
      homeTo="/"
      sections={sections}
      user={user}
      menuItems={menuItems}
      onLogout={logout}
    />
  )
}