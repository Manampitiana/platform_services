import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import Skeleton from '../../components/common/Skeleton'
import OrderRow from '../../components/orders/OrderRow'
import OrderStatusFilter from '../../components/orders/OrderStatusFilter'

export default function Orders() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useOrders({ status: status || undefined, page })

  const changeStatus = (value) => {
    setStatus(value)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="My orders" description="Track and manage all your orders." />

      <OrderStatusFilter value={status} onChange={changeStatus} />

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : data?.data?.length ? (
        <>
          <Card className="p-0" padded={false}>
            <ul className="divide-y divide-slate-100">
              {data.data.map((order) => (
                <OrderRow key={order.uuid} order={order} />
              ))}
            </ul>
          </Card>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description={status ? 'No orders match this filter.' : 'Choose a service to place your first order.'}
          action={
            <Link to="/services">
              <Button>Browse services</Button>
            </Link>
          }
        />
      )}
    </div>
  )
}