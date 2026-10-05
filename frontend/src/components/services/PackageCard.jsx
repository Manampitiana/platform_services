import { Link } from 'react-router-dom'
import { Check, Clock, RefreshCw, X } from 'lucide-react'
import Badge from '../common/Badge'
import Button from '../common/Button'
import Card from '../common/Card'
import { formatPrice } from '../../utils/formatPrice'

export default function PackageCard({ pkg, serviceSlug, currency }) {
  return (
    <Card
      className={`flex h-full flex-col ${pkg.is_popular ? 'border-brand-500 ring-2 ring-brand-500' : ''}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{pkg.name}</h3>
        {pkg.is_popular && <Badge tone="purple">Most popular</Badge>}
      </div>

      <p className="mt-4 text-3xl font-bold">{formatPrice(pkg.price, currency)}</p>

      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
        {pkg.estimated_days && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" /> {pkg.estimated_days} days
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <RefreshCw className="h-4 w-4" /> {pkg.revisions_included} revisions
        </span>
      </div>

      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {pkg.features?.map((f) => (
          <li key={f.id} className={`flex items-start gap-2 ${f.is_included ? '' : 'text-slate-400'}`}>
            {f.is_included ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            {f.label}
          </li>
        ))}
      </ul>

      <Link to={`/orders/new?service=${serviceSlug}&package=${pkg.slug}`} className="mt-6">
        <Button variant={pkg.is_popular ? 'primary' : 'secondary'} className="w-full">
          Order {pkg.name}
        </Button>
      </Link>
    </Card>
  )
}