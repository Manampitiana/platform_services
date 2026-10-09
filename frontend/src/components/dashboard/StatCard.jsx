import AnimatedNumber from '../common/AnimatedNumber'
import Card from '../common/Card'

const tones = {
  brand: 'bg-brand-50 text-brand-600',
  yellow: 'bg-yellow-100 text-yellow-700',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
}

export default function StatCard({ icon: Icon, label, value, tone = 'brand' }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">
          <AnimatedNumber value={Number(value) || 0} />
        </p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  )
}