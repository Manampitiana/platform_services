import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, SearchX, Trash2 } from 'lucide-react'
import {
  useAdminService,
  useCreateService,
  useDeleteService,
  useUpdateService,
} from '../../hooks/useAdmin'
import { getApiError } from '../../utils/getApiError'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Skeleton from '../../components/common/Skeleton'
import FormFieldsTab from '../../components/admin/FormFieldsTab'
import PackagesTab from '../../components/admin/PackagesTab'
import ServiceFeaturesTab from '../../components/admin/ServiceFeaturesTab'
import ServiceForm from '../../components/admin/ServiceForm'

const tabs = [
  { key: 'details', label: 'Details' },
  { key: 'packages', label: 'Packages' },
  { key: 'features', label: 'Features' },
  { key: 'brief', label: 'Brief form' },
]

export default function AdminServiceEdit() {
  const { id } = useParams() // undefined sur /admin/services/new
  const isNew = !id
  const navigate = useNavigate()

  const { data: service, isLoading, isError, error, refetch } = useAdminService(id)
  const create = useCreateService()
  const update = useUpdateService(id)
  const remove = useDeleteService()

  const [tab, setTab] = useState('details')
  const [deleteError, setDeleteError] = useState('')

  const back = (
    <Link to="/admin/services" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
      <ArrowLeft className="h-4 w-4" /> Services
    </Link>
  )

  if (!isNew && isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!isNew && isError) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        {error?.response?.status === 404 ? (
          <EmptyState
            icon={SearchX}
            title="Service not found"
            action={
              <Link to="/admin/services">
                <Button>Back to services</Button>
              </Link>
            }
          />
        ) : (
          <ErrorState onRetry={refetch} />
        )}
      </div>
    )
  }

  const handleCreate = async (payload) => {
    const created = await create.mutateAsync(payload)
    navigate(`/admin/services/${created.id}`, { replace: true })
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${service.name}"? Existing orders keep their data.`)) return
    setDeleteError('')
    try {
      await remove.mutateAsync(service.id)
      navigate('/admin/services', { replace: true })
    } catch (err) {
      setDeleteError(getApiError(err))
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {back}

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{isNew ? 'New service' : service.name}</h1>
        {!isNew && (
          <Button variant="ghost" size="sm" leftIcon={Trash2} onClick={handleDelete} loading={remove.isPending}>
            Delete
          </Button>
        )}
      </div>

      {deleteError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{deleteError}</p>}

      {isNew ? (
        <ServiceForm service={null} onSubmit={handleCreate} />
      ) : (
        <>
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`-mb-px shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition ${
                  tab === t.key
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'details' && <ServiceForm key={service.id} service={service} onSubmit={update.mutateAsync} />}
          {tab === 'packages' && <PackagesTab service={service} />}
          {tab === 'features' && <ServiceFeaturesTab key={service.id} service={service} />}
          {tab === 'brief' && <FormFieldsTab key={service.id} service={service} />}
        </>
      )}
    </div>
  )
}