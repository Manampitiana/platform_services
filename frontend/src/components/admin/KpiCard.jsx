import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import AnimatedNumber from '../common/AnimatedNumber'
import Card from '../common/Card'

const tones = {
  brand: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
}

export default function KpiCard({ icon: Icon, label, value, unit, change, tone = 'brand' }) {
  const hasChange = change !== null && change !== undefined
  const up = change > 0
  const down = change < 0

  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-pop">
      <div className="flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>

        {hasChange && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
              up
                ? 'bg-emerald-50 text-emerald-700'
                : down
                  ? 'bg-red-50 text-red-700'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : down ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 flex items-baseline gap-1.5 text-2xl font-bold tracking-tight tabular-nums">
        <AnimatedNumber value={value} />
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </p>
    </Card>
  )
}