import { useEffect, useState, Suspense } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, PanelLeftClose, PanelLeftOpen, Rocket, X } from 'lucide-react'
import NotificationBell from './NotificationBell'
import SidebarNav from './SidebarNav'
import UserMenu from './UserMenu'

import ErrorBoundary from '../common/ErrorBoundary'
import PageSkeleton from '../common/PageSkeleton'

const themes = {
  admin: {
    aside: 'bg-slate-950 border-slate-800',
    brand: 'text-white',
    divider: 'border-slate-800',
    toggle: 'text-slate-400 hover:bg-white/5 hover:text-white',
  },
  client: {
    aside: 'bg-white border-slate-200',
    brand: 'text-slate-900',
    divider: 'border-slate-200',
    toggle: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
  },
}

const readCollapsed = (key) => {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function Brand({ brand, homeTo, collapsed, theme, onClose }) {
  return (
    <div className={`flex h-16 shrink-0 items-center border-b ${theme.divider} ${collapsed ? 'justify-center' : 'justify-between px-5'}`}>
      <Link to={homeTo} className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
          <Rocket className="h-[18px] w-[18px]" />
        </span>
        {!collapsed && (
          <span className={`truncate text-base font-bold tracking-tight ${theme.brand}`}>{brand}</span>
        )}
      </Link>
      {onClose && (
        <button onClick={onClose} className={`rounded-lg p-1.5 ${theme.toggle}`} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export default function AppShell({
  variant = 'client',
  brand,
  homeTo = '/',
  sections,
  user,
  menuItems = [],
  onLogout,
}) {
  const { pathname } = useLocation()
  const theme = themes[variant]
  const storageKey = `sidebar-collapsed:${variant}`

  const [collapsed, setCollapsed] = useState(() => readCollapsed(storageKey))
  const [drawer, setDrawer] = useState(false)

  const toggle = () =>
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(storageKey, next ? '1' : '0')
      } catch {
        /* tsy olana */
      }
      return next
    })

  // Mikatona ny drawer rehefa miova pejy na tsindriana Escape
  useEffect(() => {
    setDrawer(false)
  }, [pathname])

  useEffect(() => {
    if (!drawer) return
    const onKey = (e) => e.key === 'Escape' && setDrawer(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawer])

  // Lohateny: ny lien mifanaraka lava indrindra amin'ny URL
  const current = sections
    .flatMap((s) => s.items)
    .filter((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0]

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Sidebar desktop */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 268 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r lg:flex ${theme.aside}`}
      >
        <Brand brand={brand} homeTo={homeTo} collapsed={collapsed} theme={theme} />
        <SidebarNav sections={sections} variant={variant} collapsed={collapsed} idPrefix="desktop" />
        <div className={`border-t p-3 ${theme.divider}`}>
          <button
            onClick={toggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition ${collapsed ? 'justify-center' : 'gap-3 px-3'
              } ${theme.toggle}`}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            ) : (
              <>
                <PanelLeftClose className="h-[18px] w-[18px]" /> Collapse
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              key="drawer"
              className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r lg:hidden ${theme.aside}`}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            >
              <Brand brand={brand} homeTo={homeTo} theme={theme} onClose={() => setDrawer(false)} />
              <SidebarNav sections={sections} variant={variant} idPrefix="mobile" onNavigate={() => setDrawer(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setDrawer(true)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
            {current?.label ?? brand}
          </p>

          <NotificationBell />
          <UserMenu user={user} items={menuItems} onLogout={onLogout} />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ErrorBoundary>
              <Suspense fallback={<PageSkeleton />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        </main>
      </div>
    </div>
  )
}