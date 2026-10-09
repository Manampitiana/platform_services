import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const tones = {
  success: { icon: CheckCircle2, color: 'text-emerald-600' },
  error: { icon: AlertCircle, color: 'text-red-600' },
  info: { icon: Info, color: 'text-brand-600' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (tone, message, duration) => {
      const id = ++counter.current
      setToasts((list) => [...list.slice(-3), { id, tone, message }])
      setTimeout(() => dismiss(id), duration)
    },
    [dismiss]
  )

  const api = useMemo(
    () => ({
      success: (message, duration = 4000) => push('success', message, duration),
      error: (message, duration = 6000) => push('error', message, duration),
      info: (message, duration = 4000) => push('info', message, duration),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4"
      >
        <AnimatePresence initial={false}>
          {toasts.map(({ id, tone, message }) => {
            const { icon: Icon, color } = tones[tone]

            return (
              <motion.div
                key={id}
                layout
                role={tone === 'error' ? 'alert' : 'status'}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-pop sm:w-96"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
                <p className="min-w-0 flex-1 break-words text-sm font-medium text-slate-800">{message}</p>
                <button
                  onClick={() => dismiss(id)}
                  className="shrink-0 rounded p-0.5 text-slate-400 transition hover:text-slate-600"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}