import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { useAdminPayments } from '../../hooks/useAdmin'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useTableParams } from '../../hooks/useTableParams'
import PaymentReviewModal from '../../components/admin/PaymentReviewModal'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterChips from '../../components/common/FilterChips'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import PaymentStatusBadge from '../../components/common/PaymentStatusBadge'
import SearchInput from '../../components/common/SearchInput'
import SortSelect from '../../components/common/SortSelect'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'proof_submitted', label: 'To verify' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
]

const SORTS = [
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'created_at:asc', label: 'Oldest first' },
  { value: 'amount:desc', label: 'Highest amount' },
  { value: 'amount:asc', label: 'Lowest amount' },
]

const DEFAULTS = { sort: 'created_at', dir: 'desc', page: '1', per_page: '15' }

const isOpen = (p) => ['pending', 'proof_submitted'].includes(p.status)

export default function AdminPayments() {
  usePageMeta({ title: 'Payments', noindex: true })

  const t = useTableParams({ defaults: DEFAULTS })
  const [selected, setSelected] = useState(null)

  const status = t.get('status')
  const search = t.get('q')
  const sort = t.get('sort')
  const dir = t.get('dir')

  const { data, isLoading, isFetching, isError, refetch } = useAdminPayments({
    status: status || undefined,
    search: search || undefined,
    sort,
    dir,
    page: Number(t.get('page')),
    per_page: Number(t.get('per_page')),
  })

  if (isError && !data) return <ErrorState onRetry={refetch} />

  const counts = data?.counts ?? {}
  const total = Object.values(counts).reduce((sum, n) => sum + Number(n), 0)

  const chips = FILTERS.map((f) => ({
    ...f,
    count: data ? (f.value ? Number(counts[f.value] ?? 0) : total) : null,
  }))

  const onSort = (key) =>
    t.update(sort === key ? { dir: dir === 'asc' ? 'desc' : 'asc' } : { sort: key, dir: 'desc' })

  const filtered = Boolean(status || search)

  const columns = [
    {
      key: 'payment_number',
      header: 'Payment',
      skeleton: 'w-40',
      cell: (p) => (
        <div className="min-w-0">
          <p className="font-medium tabular-nums">{p.payment_number}</p>
          <p className="truncate text-xs capitalize text-slate-400">
            {p.method.replace(/_/g, ' ')}
            {p.transaction_reference && ` · ${p.transaction_reference}`}
          </p>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      skeleton: 'w-36',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.order?.client} size="sm" />
          <div className="min-w-0">
            <p className="truncate">{p.order?.client ?? 'Unknown'}</p>
            <p className="text-xs tabular-nums text-slate-400">{p.order?.order_number}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      cell: (p) => <span className="font-semibold tabular-nums">{formatPrice(p.amount, p.currency)}</span>,
    },
    { key: 'status', header: 'Status', skeleton: 'w-28', cell: (p) => <PaymentStatusBadge status={p.status} /> },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      align: 'right',
      cell: (p) => <span className="whitespace-nowrap text-slate-500">{formatDate(p.created_at)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      interactive: true,
      skeleton: 'w-16',
      cell: (p) => (isOpen(p) ? <Button size="sm" onClick={() => setSelected(p)}>Review</Button> : null),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Payments"
        description={
          data
            ? `${Number(counts.proof_submitted ?? 0)} waiting for verification.`
            : 'Verify payments submitted by clients.'
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 lg:flex-1">
          <FilterChips options={chips} value={status} onChange={(value) => t.update({ status: value })} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:w-auto">
          <SortSelect
            className="md:hidden"
            options={SORTS}
            sort={sort}
            dir={dir}
            onChange={(nextSort, nextDir) => t.update({ sort: nextSort, dir: nextDir })}
          />
          <SearchInput
            value={search}
            onChange={(value) => t.update({ q: value })}
            placeholder="Search reference or client"
            className="sm:w-72"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        isFetching={isFetching}
        sort={sort}
        dir={dir}
        onSort={onSort}
        onRowClick={setSelected}
        renderCard={(p) => (
          <div className="flex items-start gap-3 px-4 py-4">
            <Avatar name={p.order?.client} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center justify-between gap-2 font-medium">
                <span className="truncate">{p.order?.client ?? 'Unknown'}</span>
                <span className="shrink-0 tabular-nums">{formatPrice(p.amount, p.currency)}</span>
              </p>
              <p className="truncate text-xs capitalize text-slate-500">
                {p.payment_number} · {p.method.replace(/_/g, ' ')}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <PaymentStatusBadge status={p.status} />
                <span className="text-xs text-slate-400">{formatDate(p.created_at)}</span>
                {isOpen(p) && <span className="text-xs font-medium text-brand-600">Tap to review</span>}
              </div>
            </div>
          </div>
        )}
        footer={
          data?.data?.length ? (
            <Pagination
              meta={data.meta}
              className=""
              onPageChange={(page) => t.update({ page })}
              onPerPageChange={(n) => t.update({ per_page: n })}
            />
          ) : null
        }
      />

      {!isLoading && !data?.data?.length && (
        <EmptyState
          icon={CreditCard}
          title={filtered ? 'No payments match your filters' : 'No payments yet'}
          description={filtered ? 'Try another status or a different search.' : 'Payments will show up here.'}
          action={filtered ? <Button variant="secondary" onClick={t.reset}>Clear filters</Button> : null}
        />
      )}

      <PaymentReviewModal payment={selected} onClose={() => setSelected(null)} />
    </div>
  )
}