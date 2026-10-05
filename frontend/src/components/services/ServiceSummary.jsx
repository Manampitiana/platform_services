import { Link } from 'react-router-dom'
import { Check, Clock, Lock, RefreshCw } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import { formatPrice } from '../../utils/formatPrice'

export default function ServiceSummary({ service, hasPackages }) {
  const quote = service.requires_quote || !service.base_price

  return (
    <Card className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {quote ? 'Pricing' : 'Starting at'}
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
          {quote ? 'Custom quote' : formatPrice(service.base_price, service.currency)}
        </p>
      </div>

      <ul className="space-y-3 text-sm text-slate-600">
        {service.estimated_days && (
          <li className="flex items-center gap-2.5"><Clock className="h-4 w-4 text-brand-600" /> From {service.estimated_days} days</li>
        )}
        {service.revisions_included > 0 && (
          <li className="flex items-center gap-2.5"><RefreshCw className="h-4 w-4 text-brand-600" /> {service.revisions_included} revision(s) included</li>
        )}
        <li className="flex items-center gap-2.5"><Lock className="h-4 w-4 text-brand-600" /> Private files and secure delivery</li>
        <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-brand-600" /> Track everything in your account</li>
      </ul>

      {hasPackages ? (
        <a href="#packages"><Button size="lg" className="w-full">Choose a package</Button></a>
      ) : (
        <Link to={`/orders/new?service=${service.slug}`}>
          <Button size="lg" className="w-full">Request a quote</Button>
        </Link>
      )}

      <p className="text-center text-xs text-slate-400">
        Questions? <Link to="/contact" className="font-medium text-brand-600 hover:underline">Contact us</Link>
      </p>
    </Card>
  )
}