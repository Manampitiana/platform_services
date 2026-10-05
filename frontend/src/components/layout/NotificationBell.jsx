import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../hooks/useNotifications'
import { timeAgo } from '../../utils/timeAgo'
import CountBadge from '../common/CountBadge'

export default function NotificationBell({ tone = 'light' }) {
  const { data } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return

    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)

    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items = data?.items ?? []
  const unread = data?.unread_count ?? 0

  const openItem = (n) => {
    if (!n.read) markRead.mutate(n.id)
    setOpen(false)
    navigate(n.path)
  }

  const buttonClass =
    tone === 'dark' ? 'text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative rounded-lg p-2 transition ${buttonClass}`}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <CountBadge count={unread} className="absolute -right-1 -top-1" />
      </button>

      {open && (
        <div
          className="
    absolute -right-14 sm:right-0 z-50 mt-2
    w-[min(20rem,calc(100vw-1rem))]
    max-w-[calc(100vw-1rem)]
    overflow-hidden
    rounded-2xl border border-slate-200
    bg-white text-slate-800 shadow-lg
  "
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">No notifications yet.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => openItem(n)}
                    className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${n.read ? '' : 'bg-brand-50/50'
                      }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-brand-600'
                        }`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{n.title}</span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">{n.body}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">{timeAgo(n.created_at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}