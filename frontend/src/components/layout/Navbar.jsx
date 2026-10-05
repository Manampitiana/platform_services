import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Rocket, X } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import Button from '../common/Button'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isAdmin } = useAuth()

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-brand-600 ${isActive ? 'text-brand-600' : 'text-slate-600'}`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <Rocket className="h-5 w-5 text-brand-600" />
          DigitalHub
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Link to={isAdmin ? '/admin' : '/dashboard'}>
              <Button size="sm">{isAdmin ? 'Admin' : 'Dashboard'}</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200 bg-white px-4 md:hidden"
          >
            <div className="space-y-3 py-4">
              {isAuthenticated ? (
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex-1" onClick={() => setOpen(false)}>
                  <Button className="w-full">{isAdmin ? 'Admin' : 'Dashboard'}</Button>
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
                    <Button variant="secondary" className="w-full">Sign in</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setOpen(false)}>
                    <Button className="w-full">Get started</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}