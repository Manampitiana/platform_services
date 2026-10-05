import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../common/Card'
import { formatPrice } from '../../utils/formatPrice'

const day = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

const compact = (n) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-pop">
      <p className="text-slate-500">{day(label)}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{formatPrice(payload[0].value)}</p>
    </div>
  )
}

export default function RevenueChart({ series, total, days }) {
  const empty = total === 0

  return (
    <Card className="h-full">
      <div className="mb-4">
        <h2 className="font-semibold">Revenue</h2>
        <p className="text-sm text-slate-500">
          <span className="font-semibold tabular-nums text-slate-800">{formatPrice(total)}</span> in the last {days} days
        </p>
      </div>

      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={day}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis
              tickFormatter={compact}
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c7d2fe' }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#revFill)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>

        {empty && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            No payments in this period
          </p>
        )}
      </div>
    </Card>
  )
}