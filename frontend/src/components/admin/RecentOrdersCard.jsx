import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import Avatar from '../common/Avatar'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'
import StatusBadge from '../common/StatusBadge'
import { formatPrice } from '../../utils/formatPrice'

const date = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
const price = (o) => (o.total > 0 ? formatPrice(o.total, o.currency) : 'No price yet')

export default function RecentOrdersCard({ orders }) {
  const navigate = useNavigate()

  return (
    <div className=''>

      <Card padded={false}>
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="font-semibold">Recent orders</h2>
            <p className="text-sm text-slate-500">Latest submitted orders.</p>
          </div>
          <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {!orders?.length ? (
          <div className="p-6 pt-0">
            <EmptyState icon={ShoppingBag} title="No orders yet" description="New orders will show up here." />
          </div>
        ) : (
          <>
            {/* Desktop: tableau */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-2.5 font-medium">Client</th>
                    <th className="px-3 py-2.5 font-medium">Service</th>
                    <th className="px-3 py-2.5 text-right font-medium">Total</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-6 py-2.5 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr
                      key={o.uuid}
                      onClick={() => navigate(`/admin/orders/${o.uuid}`)}
                      className="cursor-pointer transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={o.client?.name} src={o.client?.avatar_url} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{o.client?.name ?? 'Unknown'}</p>
                            <p className="text-xs text-slate-400">{o.order_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{o.service?.name ?? 'Service unavailable'}</td>
                      <td className="px-3 py-3 text-right font-medium tabular-nums">{price(o)}</td>
                      <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                      <td className="px-6 py-3 text-right text-slate-500">{date(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Finday: lisitra */}
            <ul className="divide-y divide-slate-100 border-t border-slate-100 md:hidden">
              {orders.map((o) => (
                <li key={o.uuid}>
                  <Link to={`/admin/orders/${o.uuid}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50">
                    <Avatar name={o.client?.name} src={o.client?.avatar_url} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{o.client?.name ?? 'Unknown'}</p>
                      <p className="truncate text-xs text-slate-500">
                        {o.service?.name} · {date(o.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold tabular-nums">{price(o)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  )
}