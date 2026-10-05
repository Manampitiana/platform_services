import { motion } from 'motion/react'
import Card from '../common/Card'

const STAGES = [
  { key: 'review', label: 'Review & quote', statuses: ['submitted', 'under_review', 'quote_pending', 'quote_sent'], bar: 'bg-sky-500' },
  { key: 'payment', label: 'Awaiting payment', statuses: ['awaiting_payment'], bar: 'bg-amber-500' },
  { key: 'production', label: 'In production', statuses: ['paid', 'in_progress', 'revision'], bar: 'bg-brand-600' },
  { key: 'delivered', label: 'Delivered', statuses: ['delivered'], bar: 'bg-violet-500' },
  { key: 'completed', label: 'Completed', statuses: ['completed'], bar: 'bg-emerald-500' },
]

export default function PipelineCard({ counts }) {
  const stages = STAGES.map((s) => ({
    ...s,
    total: s.statuses.reduce((sum, st) => sum + Number(counts?.[st] ?? 0), 0),
  }))
  const max = Math.max(1, ...stages.map((s) => s.total))

  return (
    <Card>
      <h2 className="font-semibold">Order pipeline</h2>
      <p className="text-sm text-slate-500">Where your orders are right now.</p>

      <ul className="mt-5 space-y-4">
        {stages.map((s, i) => (
          <li key={s.key}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-slate-600">{s.label}</span>
              <span className="font-semibold tabular-nums">{s.total}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className={`h-full rounded-full ${s.bar}`}
                initial={{ width: 0 }}
                animate={{ width: s.total ? `${Math.max(6, (s.total / max) * 100)}%` : 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}