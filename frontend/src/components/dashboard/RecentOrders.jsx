import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'
import Skeleton from '../common/Skeleton'
import StatusBadge from '../common/StatusBadge'
import { formatPrice } from '../../utils/formatPrice'

export default function RecentOrders({ orders, isLoading }) {
  return (
    <Card className="p-0" padded={false}>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 className="font-semibold">Recent orders</h2>
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : orders?.length ? (
        <ul className="divide-y divide-slate-100">
          {orders.map((order) => (
            <li key={order.uuid}>
              <Link
                to={`/orders/${order.uuid}`}
                className="flex flex-col gap-2 px-6 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{order.service?.name ?? 'Service unavailable'}</p>
                  <p className="text-xs text-slate-500">
                    {order.order_number} · {new Date(order.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">
                    {order.total > 0 ? formatPrice(order.total, order.currency) : 'Quote pending'}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-6">
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Choose a service to place your first order."
            action={
              <Link to="/services">
                <Button>Browse services</Button>
              </Link>
            }
          />
        </div>
      )}
    </Card>
  )
}