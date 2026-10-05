import { motion } from 'motion/react'
import { Bell, Check } from 'lucide-react'
import Badge from '../../../components/common/Badge'

const steps = [
  { label: 'Brief received', done: true },
  { label: 'Payment confirmed', done: true },
  { label: 'Design in progress', active: true },
  { label: 'Delivery and approval' },
]

export default function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-200/60 to-violet-200/40 blur-2xl" />

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-pop"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400">Order</p>
            <p className="font-semibold tabular-nums">ORD-2026-482915</p>
            <p className="text-sm text-slate-500">Logo design · Standard</p>
          </div>
          <Badge tone="blue">In progress</Badge>
        </div>

        <ol className="mt-5 space-y-3">
          {steps.map((step) => (
            <li key={step.label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  step.done
                    ? 'bg-emerald-500 text-white'
                    : step.active
                      ? 'border-2 border-brand-600 bg-brand-50'
                      : 'border border-slate-300'
                }`}
              >
                {step.done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : step.active ? (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand-600" />
                ) : null}
              </span>
              <span className={step.done || step.active ? 'font-medium text-slate-800' : 'text-slate-400'}>
                {step.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-brand-500 to-brand-700" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute -bottom-12 -left-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-pop sm:-left-8"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Bell className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">Your delivery is ready</p>
          <p className="text-xs text-slate-500">Version 1 · Review it now</p>
        </div>
      </motion.div>
    </div>
  )
}