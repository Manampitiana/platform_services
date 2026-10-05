import { CheckCircle2, CreditCard, Loader, ShoppingBag } from 'lucide-react'
import Skeleton from '../common/Skeleton'
import StatCard from './StatCard'

const ACTIVE = [
  'submitted', 'under_review', 'quote_pending', 'quote_sent',
  'paid', 'in_progress', 'revision', 'delivered',
]

const sum = (counts, keys) => keys.reduce((total, key) => total + Number(counts?.[key] ?? 0), 0)

export default function StatsGrid({ counts, isLoading }) {
  const gridClass = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  const all = Object.values(counts ?? {}).reduce((t, n) => t + Number(n), 0)

  return (
    <div className={gridClass}>
      <StatCard icon={ShoppingBag} label="Total orders" value={all} />
      <StatCard icon={Loader} label="In progress" value={sum(counts, ACTIVE)} tone="blue" />
      <StatCard icon={CreditCard} label="Awaiting payment" value={sum(counts, ['awaiting_payment'])} tone="yellow" />
      <StatCard icon={CheckCircle2} label="Completed" value={sum(counts, ['completed'])} tone="green" />
    </div>
  )
}