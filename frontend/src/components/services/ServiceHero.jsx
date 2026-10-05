import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, RefreshCw } from 'lucide-react'
import Badge from '../common/Badge'
import { formatPrice } from '../../utils/formatPrice'

export default function ServiceHero({ service }) {
  return (
    <div>
      <Link to="/services" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> All services
      </Link>

      {service.category && (
        <div className="mt-6">
          <Badge tone="purple">{service.category.name}</Badge>
        </div>
      )}

      <h1 className="mt-3 text-4xl font-bold tracking-tight">{service.name}</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-600">{service.description}</p>

      <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-600">
        <span className="font-semibold text-slate-800">
          {service.requires_quote || !service.base_price
            ? 'Custom quote'
            : `From ${formatPrice(service.base_price, service.currency)}`}
        </span>
        {service.estimated_days && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" /> {service.estimated_days} days
          </span>
        )}
        {service.revisions_included > 0 && (
          <span className="inline-flex items-center gap-1">
            <RefreshCw className="h-4 w-4" /> {service.revisions_included} revisions
          </span>
        )}
      </div>
    </div>
  )
}