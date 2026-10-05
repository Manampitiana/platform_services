import { useId } from 'react'
import { motion } from 'motion/react'

export default function SegmentedControl({ options, value, onChange }) {
  const id = useId()

  return (
    <div className="inline-flex justify-center rounded-xl bg-slate-100 p-1" role="tablist">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {active && (
              <motion.span
                layoutId={id}
                className="absolute inset-0 rounded-lg bg-white shadow-sm"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}