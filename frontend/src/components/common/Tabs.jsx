import { useId } from 'react'
import { motion } from 'motion/react'

export default function Tabs({ tabs, value, onChange }) {
  const id = useId()

  return (
    <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
      <div role="tablist" className="flex min-w-max gap-1 border-b border-slate-200">
        {tabs.map(({ value: tabValue, label, icon: Icon }) => {
          const active = value === tabValue

          return (
            <button
              key={tabValue}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tabValue)}
              className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
                active ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
              {active && (
                <motion.span
                  layoutId={id}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}