import { useState } from 'react'
import { Landmark, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useAdminPaymentMethods,
  useDeletePaymentMethod,
  useSavePaymentMethod,
} from '../../hooks/useAdmin'
import { flattenErrors } from '../../utils/flattenErrors'
import { getApiError } from '../../utils/getApiError'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import CheckField from '../../components/common/CheckField'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import PageHeader from '../../components/common/PageHeader'
import Skeleton from '../../components/common/Skeleton'
import Textarea from '../../components/common/Textarea'
import { useConfirm } from '../../contexts/ConfirmContext'
import { useToast } from '../../contexts/ToastContext'

const empty = {
  id: null,
  code: '',
  name: '',
  account_name: '',
  account_number: '',
  instructions: '',
  is_active: true,
}

export default function AdminPaymentMethods() {
  const { data, isLoading, isError, refetch } = useAdminPaymentMethods()
  const save = useSavePaymentMethod()
  const remove = useDeletePaymentMethod()

  const confirm = useConfirm()
  const toast = useToast()

  const [form, setForm] = useState(null) // null = modal fermé
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [listError, setListError] = useState('')

  const open = (method) => {
    setErrors({})
    setFormError('')
    setForm(
      method
        ? { ...empty, ...Object.fromEntries(Object.entries(method).map(([k, v]) => [k, v ?? ''])) }
        : empty
    )
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setFormError('')

    const isEditing = !!form.id

    const { id, ...payload } = form

    if (id) delete payload.code

    try {
      await save.mutateAsync({ id, ...payload })

      setForm(null)

      toast.success(
        isEditing
          ? 'Payment method updated successfully.'
          : 'Payment method created successfully.'
      )
    } catch (err) {
      const fieldErrors = flattenErrors(err)
      setErrors(fieldErrors)

      if (!Object.keys(fieldErrors).length) {
        setFormError(getApiError(err))
      }
    }
  }

  const handleDelete = async (method) => {
    setListError('')

    const ok = await confirm({
      title: `Delete "${method.name}"?`,
      description: 'Clients will no longer see this payment method. This cannot be undone.',
      confirmLabel: 'Delete method',
      tone: 'danger',
      onConfirm: () => remove.mutateAsync(method.id),
    })

    if (ok) toast.success('Payment method deleted.')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Payment methods"
        description="Accounts shown to clients when they pay."
        action={
          <Button leftIcon={Plus} onClick={() => open(null)}>
            Add method
          </Button>
        }
      />

      {listError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{listError}</p>}

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : data?.length ? (
        <div className="space-y-3">
          {data.map((m) => (
            <Card key={m.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {m.name}
                  <Badge tone={m.is_active ? 'green' : 'gray'}>{m.is_active ? 'Active' : 'Inactive'}</Badge>
                  <span className="text-xs font-normal text-slate-400">{m.code}</span>
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {m.account_name ?? '—'} · {m.account_number ?? '—'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" leftIcon={Pencil} onClick={() => open(m)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" leftIcon={Trash2} onClick={() => handleDelete(m)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Landmark}
          title="No payment methods"
          description="Add at least one method so clients can pay."
        />
      )}

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Edit payment method' : 'New payment method'}
      >
        {form && (
          <form onSubmit={submit} className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

            <Input
              label="Code *"
              placeholder="e.g. mvola"
              value={form.code}
              onChange={set('code')}
              disabled={!!form.id}
              error={errors.code}
            />
            <Input label="Name *" value={form.name} onChange={set('name')} error={errors.name} />
            <Input
              label="Account name"
              value={form.account_name}
              onChange={set('account_name')}
              error={errors.account_name}
            />
            <Input
              label="Account number"
              value={form.account_number}
              onChange={set('account_number')}
              error={errors.account_number}
            />
            <Textarea
              label="Instructions"
              rows={3}
              value={form.instructions}
              onChange={set('instructions')}
              error={errors.instructions}
            />
            <CheckField
              label="Active"
              hint="Inactive methods are hidden from clients."
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={save.isPending}>
                Save
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}