import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ShoppingBag } from 'lucide-react'
import { useAdminOrders } from '../../hooks/useAdmin'
import { useUnread } from '../../hooks/useUnread'
import Card from '../../components/common/Card'
import CountBadge from '../../components/common/CountBadge'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import Skeleton from '../../components/common/Skeleton'
import StatusBadge from '../../components/common/StatusBadge'
import OrderStatusFilter from '../../components/orders/OrderStatusFilter'
import { formatPrice } from '../../utils/formatPrice'

export default function AdminOrders() {
  // const [status, setStatus] = useState('')
  const [params] = useSearchParams()
  const [status, setStatus] = useState(params.get('status') ?? '')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data: unread } = useUnread()

  const { data, isLoading, isError, refetch } = useAdminOrders({
    status: status || undefined,
    search: search || undefined,
    page,
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Orders" description="All submitted orders." />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search order number or client"
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <OrderStatusFilter
        value={status}
        onChange={(v) => {
          setStatus(v)
          setPage(1)
        }}
      />

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : data?.data?.length ? (
        <>
          <Card className="p-0" padded={false}>
            <ul className="divide-y divide-slate-100">
              {data.data.map((order) => (
                <li key={order.uuid}>
                  <Link
                    to={`/admin/orders/${order.uuid}`}
                    className="flex flex-col gap-2 px-6 py-4 transition  hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="flex items-center gap-2 font-medium">
                        {order.service?.name ?? 'Service unavailable'}
                        <CountBadge count={unread?.orders?.[order.uuid]} />
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.order_number} · {new Date(order.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold">
                        {order.total > 0 ? formatPrice(order.total, order.currency) : 'No price yet'}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState icon={ShoppingBag} title="No orders found" description="Nothing matches your filters." />
      )}
    </div>
  )
}