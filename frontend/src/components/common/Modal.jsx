import { useId, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useDialog } from '../../hooks/useDialog'

export default function Modal({ open, onClose, title, children }) {
  const titleId = useId()
  const panelRef = useRef(null)

  useDialog(panelRef, open, onClose)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-slate-950/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-pop sm:max-w-lg sm:rounded-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}