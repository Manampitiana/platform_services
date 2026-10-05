import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'motion/react'

const defaultFormat = (n) => new Intl.NumberFormat('en-US').format(Math.round(n))

export default function AnimatedNumber({ value, format = defaultFormat }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (reduce) {
      node.textContent = format(value)
      return
    }

    const controls = animate(0, value, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (v) => {
        node.textContent = format(v)
      },
    })

    return () => controls.stop()
  }, [value, reduce, format])

  return <span ref={ref}>{format(0)}</span>
}