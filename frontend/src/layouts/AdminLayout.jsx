import {
  CreditCard,
  Globe,
  Inbox,
  Landmark,
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useUnread } from '../hooks/useUnread'
import AppShell from '../components/layout/AppShell'
import { useContactOpenCount } from '../hooks/useAdmin'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { data: unread } = useUnread()
  const { data: contactOpen } = useContactOpenCount()

  const sections = [
    {
      title: 'Overview',
      items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
    },
    {
      title: 'Operations',
      items: [
        { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, badge: unread?.total },
        { to: '/admin/payments', label: 'Payments', icon: CreditCard },
        { to: '/admin/contact', label: 'Contact inbox', icon: Inbox, badge: contactOpen },
      ],
    },
    {
      title: 'Catalogue',
      items: [
        { to: '/admin/services', label: 'Services', icon: Package },
        { to: '/admin/payment-methods', label: 'Payment methods', icon: Landmark },
      ],
    },
    {
      title: 'Account',
      items: [{ to: '/admin/profile', label: 'Profile', icon: User }],
    },
  ]

  const menuItems = [
    { to: '/admin/profile', label: 'Profile', icon: User },
    { to: '/', label: 'Public website', icon: Globe },
  ]

  return (
    <AppShell
      variant="admin"
      brand="Admin"
      homeTo="/admin"
      sections={sections}
      user={user}
      menuItems={menuItems}
      onLogout={logout}
    />
  )
}