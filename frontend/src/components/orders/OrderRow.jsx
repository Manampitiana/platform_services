import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import { formatPrice } from '../../utils/formatPrice'
import CountBadge from '../common/CountBadge'
import { useUnread } from '../../hooks/useUnread'

export default function OrderRow({ order }) {
  // Ny draft dia mbola tsy vita: mitondra any amin'ny fanohizana ny commande
  const isDraft = order.status === 'draft'
  const to = isDraft && order.service
    ? `/orders/new?service=${order.service.slug}`
    : `/orders/${order.uuid}`

  const { data: unread } = useUnread()
  const unreadCount = unread?.orders?.[order.uuid]

  return (
    <li>
      <Link
        to={to}
        className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate font-medium">
            {order.service?.name ?? 'Service unavailable'}
            <CountBadge count={unreadCount} />
          </p>
          <p className="text-xs text-slate-500">
            {order.order_number} · {new Date(order.created_at).toLocaleDateString('en-GB')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-semibold sm:inline">
            {order.total > 0 ? formatPrice(order.total, order.currency) : 'Quote pending'}
          </span>
          <StatusBadge status={order.status} />
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      </Link>
    </li>
  )
}