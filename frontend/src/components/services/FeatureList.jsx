import { Check } from 'lucide-react'
import Card from '../common/Card'

export default function FeatureList({ features }) {
  if (!features?.length) return null

  return (
    <Card>
      <h2 className="text-lg font-semibold">What's included</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {features.map((f) => (
          <li key={f.id} className="flex items-start gap-2 text-sm text-slate-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            {f.label}
          </li>
        ))}
      </ul>
    </Card>
  )
}