import { Link } from 'react-router-dom'
import { ChevronRight, Package, Plus } from 'lucide-react'
import { useAdminServices } from '../../hooks/useAdmin'
import { formatPrice } from '../../utils/formatPrice'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import Skeleton from '../../components/common/Skeleton'

export default function AdminServices() {
  const { data, isLoading, isError, refetch } = useAdminServices()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Services"
        description="Manage the catalogue shown to clients."
        action={
          <Link to="/admin/services/new">
            <Button leftIcon={Plus}>New service</Button>
          </Link>
        }
      />

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : data?.length ? (
        <Card className="p-0" padded={false}>
          <ul className="divide-y divide-slate-100">
            {data.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/admin/services/${s.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {s.name}
                      <Badge tone={s.is_active ? 'green' : 'gray'}>{s.is_active ? 'Active' : 'Hidden'}</Badge>
                      {s.requires_quote && <Badge tone="purple">Quote</Badge>}
                    </p>
                    <p className="text-xs text-slate-500">
                      {s.category?.name ?? 'No category'} · {s.packages_count} packages ·{' '}
                      {s.base_price ? `From ${formatPrice(s.base_price, s.currency)}` : 'No base price'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState icon={Package} title="No services yet" description="Create your first service." />
      )}
    </div>
  )
}