import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../common/Avatar'
import BrandLogo from '../common/BrandLogo'
import Button from '../common/Button'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/faq', label: 'FAQ' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, isAdmin } = useAuth()
  const { pathname } = useLocation()
  const appLink = isAdmin ? '/admin' : '/dashboard'

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <div className="origin-left scale-105">
          <BrandLogo />
        </div>

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main"
        >
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex h-16 min-w-[72px] items-center justify-center px-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <>
                      {/* Top light */}
                      <motion.span
                        layoutId="nav-active-bar"
                        className="absolute left-1/2 top-0 z-20 h-1 w-10 -translate-x-1/2 rounded-b-full bg-gradient-to-r from-brand-500 to-violet-500 shadow-[0_0_12px_rgba(79,70,229,0.7)]"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />

                      {/* Desktop spotlight */}
                      <motion.span
                        layoutId="nav-active-beam"
                        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-14 w-16 -translate-x-1/2 -translate-y-1/2 opacity-80"
                        style={{
                          clipPath:
                            'polygon(35% 0, 65% 0, 100% 100%, 0 100%)',
                          background:
                            'linear-gradient(to bottom, rgba(79,70,229,.35), rgba(79,70,229,.08), transparent)',
                          filter: 'blur(3px)',
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />

                      {/* Soft glow */}
                      <motion.span
                        layoutId="nav-active-glow"
                        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-8 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-xl"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    </>
                  )}

                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link
              to={appLink}
              className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 py-1.5 pl-1.5 pr-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50"
            >
              <Avatar
                name={user?.name}
                src={user?.avatar_url}
                size="sm"
              />

              <span>{isAdmin ? 'Admin' : 'Dashboard'}</span>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>

              <Link to="/register">
                <Button size="sm">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <nav
              className="space-y-1 px-4 py-3"
              aria-label="Mobile"
            >
              {links.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `relative block overflow-hidden rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-brand-700'
                        : 'text-slate-700 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <>
                          {/* Mobile horizontal spotlight */}
                          <motion.span
                            layoutId="mobile-nav-torch"
                            className="pointer-events-none absolute left-0 top-1/2 z-0 h-12 w-30 -translate-y-1/2"
                            style={{
                              clipPath:
                                'polygon(0 38%, 0 62%, 100% 100%, 100% 0)',
                              background:
                                'linear-gradient(to right, rgba(79,70,229,.16), rgba(79,70,229,.08), transparent)',
                              filter: 'blur(4px)',
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 420,
                              damping: 30,
                            }}
                          />

                          {/* Light source */}
                          <motion.span
                            layoutId="mobile-nav-light"
                            className="absolute left-0 top-1/2 z-20 h-6 w-1 -translate-y-1/2 rounded-full bg-brand-600"
                            style={{
                              boxShadow:
                                '0 0 8px currentColor, 0 0 16px currentColor',
                            }}
                            transition={{
                              type: 'spring',
                              stiffness: 420,
                              damping: 30,
                            }}
                          />
                        </>
                      )}

                      <span className="relative z-10">
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}

              {/* Mobile actions */}
              <div className="flex gap-2 pt-3">
                {isAuthenticated ? (
                  <Link
                    to={appLink}
                    className="flex-1"
                  >
                    <Button className="w-full">
                      {isAdmin ? 'Admin panel' : 'Dashboard'}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex-1"
                    >
                      <Button
                        variant="secondary"
                        className="w-full"
                      >
                        Sign in
                      </Button>
                    </Link>

                    <Link
                      to="/register"
                      className="flex-1"
                    >
                      <Button className="w-full">
                        Get started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}