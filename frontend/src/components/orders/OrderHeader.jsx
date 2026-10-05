import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import { formatPrice } from '../../utils/formatPrice'

export default function OrderHeader({ order, backTo = '/orders', backLabel = 'My orders' }) {
  const isQuote = order.type === 'custom' && order.total === 0

  return (
    <div className="space-y-4">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold tracking-tight">{order.service?.name ?? 'Order'}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {order.order_number} · Created {new Date(order.created_at).toLocaleDateString('en-GB')}
            {order.revisions_allowed > 0 && (
              <> · Revisions: {order.revisions_used}/{order.revisions_allowed}</>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-xl font-bold tabular-nums">
            {isQuote ? 'Quote pending' : formatPrice(order.total, order.currency)}
          </span>
          <StatusBadge status={order.status} />
        </div>
      </div>
    </div>
  )
}