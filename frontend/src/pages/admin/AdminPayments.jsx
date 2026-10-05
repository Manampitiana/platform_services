import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CreditCard } from 'lucide-react'
import { useAdminPayments } from '../../hooks/useAdmin'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import PaymentStatusBadge from '../../components/common/PaymentStatusBadge'
import Skeleton from '../../components/common/Skeleton'
import PaymentReviewModal from '../../components/admin/PaymentReviewModal'
import { formatPrice } from '../../utils/formatPrice'

const filters = [
  { value: '', label: 'All' },
  { value: 'proof_submitted', label: 'To verify' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
]

export default function AdminPayments() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? ''
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const { data, isLoading, isError, refetch } = useAdminPayments({ status: status || undefined, page })

  const changeStatus = (value) => {
    setParams(value ? { status: value } : {})
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Payments" description="Verify payments submitted by clients." />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => changeStatus(f.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              status === f.value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : data?.data?.length ? (
        <>
          <Card className="p-0" padded={false}>
            <ul className="divide-y divide-slate-100">
              {data.data.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setSelected(p)}
                    className="flex w-full flex-col gap-2 px-6 py-4 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {p.payment_number} · {formatPrice(p.amount, p.currency)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.order?.client} · {p.order?.order_number} · {p.method.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState icon={CreditCard} title="No payments" description="Nothing to show for this filter." />
      )}

      <PaymentReviewModal payment={selected} onClose={() => setSelected(null)} />
    </div>
  )
}