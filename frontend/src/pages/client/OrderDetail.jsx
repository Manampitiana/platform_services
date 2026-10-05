import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Lock, SearchX } from 'lucide-react'
import { useOrder } from '../../hooks/useOrders'
import { useUnread } from '../../hooks/useUnread'
import Button from '../../components/common/Button'
import CountBadge from '../../components/common/CountBadge'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Skeleton from '../../components/common/Skeleton'
import BriefTab from '../../components/orders/BriefTab'
import DeliverablesTab from '../../components/orders/DeliverablesTab'
import FilesTab from '../../components/orders/FilesTab'
import MessagesTab from '../../components/orders/MessagesTab'
import OrderHeader from '../../components/orders/OrderHeader'
import OrderTimeline from '../../components/orders/OrderTimeline'
import PaymentsTab from '../../components/orders/PaymentsTab'
import QuotesTab from '../../components/quotes/QuotesTab'

const tabs = [
  { key: 'brief', label: 'Brief' },
  { key: 'quotes', label: 'Quote' },
  { key: 'files', label: 'Files' },
  { key: 'payments', label: 'Payments' },
  { key: 'messages', label: 'Messages' },
  { key: 'deliverables', label: 'Deliverables' },
]

export default function OrderDetail() {
  const { uuid } = useParams()
  const { data: order, isLoading, isError, error, refetch } = useOrder(uuid)
  const { data: unread } = useUnread()
  const [tab, setTab] = useState(null)

  useEffect(() => {
    setTab(null)
  }, [uuid])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    const status = error?.response?.status
    const browse = (
      <Link to="/orders">
        <Button>Back to my orders</Button>
      </Link>
    )

    return (
      <div className="mx-auto max-w-3xl py-10">
        {status === 404 && (
          <EmptyState icon={SearchX} title="Order not found" description="This order does not exist." action={browse} />
        )}
        {status === 403 && (
          <EmptyState icon={Lock} title="Access denied" description="You do not have access to this order." action={browse} />
        )}
        {status !== 404 && status !== 403 && <ErrorState onRetry={refetch} />}
      </div>
    )
  }

  const visibleTabs = tabs.filter((t) => t.key !== 'quotes' || order.type === 'custom')

  const activeTab =
    tab ??
    (order.status === 'quote_sent'
      ? 'quotes'
      : order.status === 'awaiting_payment'
        ? 'payments'
        : order.status === 'delivered'
          ? 'deliverables'
          : 'brief')

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <OrderHeader order={order} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-4 lg:col-span-2">
          {/* Tab bar azo skroliana */}
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-1 border-b border-slate-200">
              {visibleTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`-mb-px flex shrink-0 items-center whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition sm:px-4 ${
                    activeTab === t.key
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.label}
                  {t.key === 'files' && ` (${order.files?.length ?? 0})`}
                  {t.key === 'messages' && (
                    <CountBadge count={unread?.orders?.[order.uuid]} className="ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'brief' && <BriefTab brief={order.brief_data} />}
          {activeTab === 'quotes' && <QuotesTab order={order} />}
          {activeTab === 'files' && <FilesTab uuid={order.uuid} files={order.files} />}
          {activeTab === 'payments' && <PaymentsTab order={order} />}
          {activeTab === 'messages' && <MessagesTab order={order} />}
          {activeTab === 'deliverables' && <DeliverablesTab order={order} />}
        </div>

        <div className="min-w-0">
          <OrderTimeline histories={order.status_histories} />
        </div>
      </div>
    </div>
  )
}