import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Focus trap, Escape, scroll lock ary famerenana ny focus rehefa mikatona
export function useDialog(ref, active, onClose, initialFocus) {
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!active) return

    const node = ref.current
    const previous = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const first = (initialFocus && node?.querySelector(initialFocus)) || node?.querySelector(FOCUSABLE)
    first?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeRef.current?.()
        return
      }

      if (e.key !== 'Tab' || !node) return

      const items = [...node.querySelectorAll(FOCUSABLE)]
      if (!items.length) return

      const firstItem = items[0]
      const lastItem = items[items.length - 1]

      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [active, ref, initialFocus])
}