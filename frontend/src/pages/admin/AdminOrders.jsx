import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useAdminOrders } from '../../hooks/useAdmin'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useTableParams } from '../../hooks/useTableParams'
import { useUnread } from '../../hooks/useUnread'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import CountBadge from '../../components/common/CountBadge'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterChips from '../../components/common/FilterChips'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import SearchInput from '../../components/common/SearchInput'
import SortSelect from '../../components/common/SortSelect'
import StatusBadge from '../../components/common/StatusBadge'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import { statuses } from '../../utils/orderStatuses'

const STATUS_ORDER = [
  'submitted', 'under_review', 'quote_pending', 'quote_sent', 'awaiting_payment',
  'paid', 'in_progress', 'revision', 'delivered', 'completed', 'cancelled',
]

const SORTS = [
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'created_at:asc', label: 'Oldest first' },
  { value: 'total:desc', label: 'Highest total' },
  { value: 'total:asc', label: 'Lowest total' },
]

const DEFAULTS = { sort: 'created_at', dir: 'desc', page: '1', per_page: '15' }

const price = (o) =>
  o.total > 0 ? formatPrice(o.total, o.currency) : <span className="font-normal text-slate-400">No price yet</span>

export default function AdminOrders() {
  usePageMeta({ title: 'Orders', noindex: true })

  const navigate = useNavigate()
  const { data: unread } = useUnread()
  const t = useTableParams({ defaults: DEFAULTS })

  const status = t.get('status')
  const search = t.get('q')
  const sort = t.get('sort')
  const dir = t.get('dir')

  const { data, isLoading, isFetching, isError, refetch } = useAdminOrders({
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

  const chips = [
    { value: '', label: 'All', count: data ? total : null },
    ...STATUS_ORDER.filter((s) => Number(counts[s]) > 0 || s === status).map((s) => ({
      value: s,
      label: statuses[s].label,
      count: Number(counts[s] ?? 0),
    })),
  ]

  const onSort = (key) =>
    t.update(
      sort === key
        ? { dir: dir === 'asc' ? 'desc' : 'asc' }
        : { sort: key, dir: key === 'order_number' ? 'asc' : 'desc' }
    )

  const filtered = Boolean(status || search)

  const columns = [
    {
      key: 'order_number',
      header: 'Order',
      sortable: true,
      skeleton: 'w-40',
      cell: (o) => (
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium">
            <span className="truncate">{o.service?.name ?? 'Service unavailable'}</span>
            <CountBadge count={unread?.orders?.[o.uuid]} />
          </p>
          <p className="text-xs tabular-nums text-slate-400">{o.order_number}</p>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      skeleton: 'w-36',
      cell: (o) => (
        <div className="flex items-center gap-3">
          <Avatar name={o.client?.name} src={o.client?.avatar_url} size="sm" />
          <div className="min-w-0">
            <p className="truncate">{o.client?.name ?? 'Unknown'}</p>
            <p className="truncate text-xs text-slate-400">{o.client?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      align: 'right',
      cell: (o) => <span className="font-semibold tabular-nums">{price(o)}</span>,
    },
    { key: 'status', header: 'Status', skeleton: 'w-24', cell: (o) => <StatusBadge status={o.status} /> },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      align: 'right',
      cell: (o) => <span className="whitespace-nowrap text-slate-500">{formatDate(o.created_at)}</span>,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Orders"
        description={data ? `${total} submitted order${total === 1 ? '' : 's'}.` : 'All submitted orders.'}
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
            placeholder="Search order or client"
            className="sm:w-72"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(o) => o.uuid}
        isLoading={isLoading}
        isFetching={isFetching}
        sort={sort}
        dir={dir}
        onSort={onSort}
        onRowClick={(o) => navigate(`/admin/orders/${o.uuid}`)}
        renderCard={(o) => (
          <div className="flex items-start gap-3 px-4 py-4">
            <Avatar name={o.client?.name} src={o.client?.avatar_url} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-medium">
                <span className="truncate">{o.client?.name ?? 'Unknown'}</span>
                <CountBadge count={unread?.orders?.[o.uuid]} />
              </p>
              <p className="truncate text-xs text-slate-500">
                {o.service?.name ?? 'Service unavailable'} · {o.order_number}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <StatusBadge status={o.status} />
                <span className="text-sm font-semibold tabular-nums">{price(o)}</span>
                <span className="text-xs text-slate-400">{formatDate(o.created_at)}</span>
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
          icon={ShoppingBag}
          title={filtered ? 'No orders match your filters' : 'No orders yet'}
          description={filtered ? 'Try another status or a different search.' : 'Submitted orders will show up here.'}
          action={filtered ? <Button variant="secondary" onClick={t.reset}>Clear filters</Button> : null}
        />
      )}
    </div>
  )
}