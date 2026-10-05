import { Link } from 'react-router-dom'
import { ArrowRight, Clock, FileText, Globe, PenTool, Sparkles } from 'lucide-react'
import Card from '../common/Card'
import { formatPrice } from '../../utils/formatPrice'

const icons = {
  cv: FileText,
  logo: PenTool,
  website: Globe,
  custom: Sparkles,
}

export default function ServiceCard({ service }) {
  const Icon = icons[service.icon] ?? Sparkles

  return (
    <Card className="flex h-full flex-col transition hover:shadow-md">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="text-lg font-semibold">{service.name}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-500">{service.short_description}</p>

      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-800">
          {service.base_price && !service.requires_quote
            ? `From ${formatPrice(service.base_price, service.currency)}`
            : 'Custom quote'}
        </span>
        {service.estimated_days && (
          <span className="inline-flex items-center gap-1 text-slate-500">
            <Clock className="h-4 w-4" />
            {service.estimated_days} days
          </span>
        )}
      </div>

      <Link
        to={`/services/${service.slug}`}
        className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        View details <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  )
}