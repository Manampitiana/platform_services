import { createContext, useCallback, useContext, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, HelpCircle } from 'lucide-react'
import Button from '../components/common/Button'
import { useDialog } from '../hooks/useDialog'
import { getApiError } from '../utils/getApiError'

const ConfirmContext = createContext(null)

const tones = {
  danger: { icon: AlertTriangle, wrap: 'bg-red-100 text-red-600', button: 'danger' },
  primary: { icon: HelpCircle, wrap: 'bg-brand-50 text-brand-600', button: 'primary' },
}

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const resolver = useRef(null)
  const panelRef = useRef(null)
  const id = useId()

  const settle = useCallback((result) => {
    resolver.current?.(result)
    resolver.current = null
    setDialog(null)
  }, [])

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current?.(false) // dialog taloha, raha misy, dia lasa "tsia"
        resolver.current = resolve
        setBusy(false)
        setError('')
        setDialog(options)
      }),
    []
  )

  const cancel = () => {
    if (!busy) settle(false)
  }

  const accept = async () => {
    if (!dialog?.onConfirm) {
      settle(true)
      return
    }

    setBusy(true)
    setError('')

    try {
      await dialog.onConfirm()
      setBusy(false)
      settle(true)
    } catch (err) {
      setError(getApiError(err))
      setBusy(false)
    }
  }

  useDialog(panelRef, !!dialog, cancel, '[data-autofocus]')

  const {
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'primary',
  } = dialog ?? {}
  const { icon: Icon, wrap, button } = tones[tone] ?? tones.primary

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              className="absolute inset-0 bg-slate-950/50"
              onClick={cancel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              ref={panelRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={`${id}-title`}
              aria-describedby={`${id}-desc`}
              className="relative w-full rounded-t-2xl bg-white p-6 shadow-pop sm:max-w-md sm:rounded-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${wrap}`}>
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <h2 id={`${id}-title`} className="text-base font-semibold">{title}</h2>
                  {description && (
                    <p id={`${id}-desc`} className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      {description}
                    </p>
                  )}
                  {error && (
                    <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" data-autofocus disabled={busy} onClick={cancel}>
                  {cancelLabel}
                </Button>
                <Button variant={button} loading={busy} onClick={accept}>
                  {confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}