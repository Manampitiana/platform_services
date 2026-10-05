import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, LogOut } from 'lucide-react'
import Avatar from '../common/Avatar'
import Badge from '../common/Badge'

export default function UserMenu({ user, items = [], onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return

    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)

    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const itemClass =
    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100 md:pr-2.5"
      >
        <Avatar name={user?.name} src={user?.avatar_url} />
        <span className="hidden max-w-32 truncate text-sm font-medium md:block">{user?.name}</span>
        <ChevronDown className={`hidden h-4 w-4 text-slate-400 transition md:block ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-1.5 shadow-pop"
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar name={user?.name} src={user?.avatar_url} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
                <div className="mt-1">
                  <Badge tone={user?.role === 'admin' ? 'purple' : 'gray'}>{user?.role}</Badge>
                </div>
              </div>
            </div>

            <div className="my-1 border-t border-slate-100" />

            {items.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className={itemClass}>
                <Icon className="h-4 w-4 text-slate-400" />
                {label}
              </Link>
            ))}

            <div className="my-1 border-t border-slate-100" />

            <button onClick={onLogout} className={`${itemClass} hover:bg-red-50 hover:text-red-600`}>
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}