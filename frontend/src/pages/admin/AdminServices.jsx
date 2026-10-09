import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, FileText, Globe, Package, PenTool, Plus, Sparkles, Star } from 'lucide-react'
import { useAdminServices } from '../../hooks/useAdmin'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useTableParams } from '../../hooks/useTableParams'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterChips from '../../components/common/FilterChips'
import PageHeader from '../../components/common/PageHeader'
import SearchInput from '../../components/common/SearchInput'
import { formatPrice } from '../../utils/formatPrice'

const icons = { cv: FileText, logo: PenTool, website: Globe, custom: Sparkles }

const matchers = {
  '': () => true,
  active: (s) => s.is_active,
  hidden: (s) => !s.is_active,
  quote: (s) => s.requires_quote,
}

const sorters = {
  sort_order: (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  name: (a, b) => a.name.localeCompare(b.name),
  packages_count: (a, b) => (a.packages_count ?? 0) - (b.packages_count ?? 0),
  base_price: (a, b) => (a.base_price ?? -1) - (b.base_price ?? -1),
}

const priceLabel = (s) =>
  s.requires_quote || !s.base_price ? (
    <span className="font-normal text-slate-400">Custom quote</span>
  ) : (
    formatPrice(s.base_price, s.currency)
  )

function Name({ s }) {
  const Icon = icons[s.icon] ?? Package

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 font-medium">
          <span className="truncate">{s.name}</span>
          {s.is_featured && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Featured" />}
        </p>
        <p className="truncate text-xs text-slate-400">/{s.slug}</p>
      </div>
    </div>
  )
}

function Flags({ s }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge tone={s.is_active ? 'green' : 'gray'}>{s.is_active ? 'Active' : 'Hidden'}</Badge>
      {s.requires_quote && <Badge tone="purple">Quote</Badge>}
    </div>
  )
}

export default function AdminServices() {
  usePageMeta({ title: 'Services', noindex: true })

  const navigate = useNavigate()
  const t = useTableParams({ defaults: { sort: 'sort_order', dir: 'asc' } })
  const { data, isLoading, isError, refetch } = useAdminServices()

  const filter = t.get('filter')
  const search = t.get('q').toLowerCase()
  const sort = t.get('sort')
  const dir = t.get('dir')

  const rows = useMemo(() => {
    const compare = sorters[sort] ?? sorters.sort_order

    return (data ?? [])
      .filter(matchers[filter] ?? matchers[''])
      .filter((s) => !search || `${s.name} ${s.slug} ${s.category?.name ?? ''}`.toLowerCase().includes(search))
      .sort((a, b) => (dir === 'asc' ? compare(a, b) : compare(b, a)))
  }, [data, filter, search, sort, dir])

  if (isError && !data) return <ErrorState onRetry={refetch} />

  const all = data ?? []
  const chips = [
    { value: '', label: 'All', count: data ? all.length : null },
    { value: 'active', label: 'Active', count: data ? all.filter(matchers.active).length : null },
    { value: 'hidden', label: 'Hidden', count: data ? all.filter(matchers.hidden).length : null },
    { value: 'quote', label: 'Quote only', count: data ? all.filter(matchers.quote).length : null },
  ]

  const onSort = (key) =>
    t.update(sort === key ? { dir: dir === 'asc' ? 'desc' : 'asc' } : { sort: key, dir: 'asc' })

  const columns = [
    { key: 'name', header: 'Service', sortable: true, skeleton: 'w-44', cell: (s) => <Name s={s} /> },
    {
      key: 'category',
      header: 'Category',
      skeleton: 'w-20',
      cell: (s) => <span className="text-slate-600">{s.category?.name ?? '—'}</span>,
    },
    {
      key: 'packages_count',
      header: 'Packages',
      sortable: true,
      align: 'right',
      cell: (s) => <span className="tabular-nums">{s.requires_quote ? '—' : s.packages_count}</span>,
    },
    {
      key: 'base_price',
      header: 'Starting at',
      sortable: true,
      align: 'right',
      cell: (s) => <span className="font-semibold tabular-nums">{priceLabel(s)}</span>,
    },
    { key: 'status', header: 'Status', skeleton: 'w-24', cell: (s) => <Flags s={s} /> },
    {
      key: 'go',
      header: <span className="sr-only">Edit</span>,
      align: 'right',
      skeleton: 'w-4',
      cell: () => <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Services"
        description="Manage the catalogue shown to clients."
        action={
          <Link to="/admin/services/new">
            <Button leftIcon={Plus}>New service</Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 lg:flex-1">
          <FilterChips options={chips} value={filter} onChange={(value) => t.update({ filter: value })} />
        </div>
        <SearchInput
          value={t.get('q')}
          onChange={(value) => t.update({ q: value })}
          placeholder="Search a service"
          className="lg:w-72"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(s) => s.id}
        isLoading={isLoading}
        sort={sort}
        dir={dir}
        onSort={onSort}
        onRowClick={(s) => navigate(`/admin/services/${s.id}`)}
        renderCard={(s) => (
          <div className="space-y-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <Name s={s} />
              <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <Flags s={s} />
              <span className="font-semibold tabular-nums">{priceLabel(s)}</span>
              {!s.requires_quote && <span className="text-xs text-slate-400">{s.packages_count} packages</span>}
            </div>
          </div>
        )}
      />

      {!isLoading && rows.length === 0 && (
        <EmptyState
          icon={Package}
          title={all.length ? 'No service matches your filters' : 'No services yet'}
          description={all.length ? 'Try another filter or a different search.' : 'Create your first service.'}
          action={
            all.length ? (
              <Button variant="secondary" onClick={t.reset}>Clear filters</Button>
            ) : (
              <Link to="/admin/services/new"><Button leftIcon={Plus}>New service</Button></Link>
            )
          }
        />
      )}
    </div>
  )
}