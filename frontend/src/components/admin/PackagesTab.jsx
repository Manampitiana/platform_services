import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCreatePackage, useDeletePackage, useUpdatePackage } from '../../hooks/useAdmin'
import { flattenErrors } from '../../utils/flattenErrors'
import { formatPrice } from '../../utils/formatPrice'
import { getApiError } from '../../utils/getApiError'
import Badge from '../common/Badge'
import Button from '../common/Button'
import Card from '../common/Card'
import CheckField from '../common/CheckField'
import EmptyState from '../common/EmptyState'
import Input from '../common/Input'
import Modal from '../common/Modal'
import Textarea from '../common/Textarea'
import FeatureListEditor from './FeatureListEditor'

const emptyPackage = {
  id: null,
  name: '',
  description: '',
  price: '',
  estimated_days: '',
  revisions_included: 1,
  is_popular: false,
  is_active: true,
  features: [],
}

const num = (v) => (v === '' || v === null ? null : Number(v))

export default function PackagesTab({ service }) {
  const create = useCreatePackage(service.id)
  const update = useUpdatePackage()
  const remove = useDeletePackage()

  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [listError, setListError] = useState('')

  const packages = service.packages ?? []

  const open = (pkg) => {
    setErrors({})
    setFormError('')
    setForm(
      pkg
        ? {
            ...pkg,
            description: pkg.description ?? '',
            estimated_days: pkg.estimated_days ?? '',
            features: pkg.features.map((f) => ({ label: f.label, is_included: f.is_included })),
          }
        : emptyPackage
    )
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setFormError('')

    const payload = {
      name: form.name,
      description: form.description || null,
      price: num(form.price),
      estimated_days: num(form.estimated_days),
      revisions_included: Number(form.revisions_included) || 0,
      is_popular: form.is_popular,
      is_active: form.is_active,
      features: form.features.filter((f) => f.label.trim()),
    }

    try {
      if (form.id) await update.mutateAsync({ id: form.id, ...payload })
      else await create.mutateAsync(payload)
      setForm(null)
    } catch (err) {
      const fieldErrors = flattenErrors(err)
      setErrors(fieldErrors)
      if (!Object.keys(fieldErrors).length) setFormError(getApiError(err))
    }
  }

  const handleDelete = async (pkg) => {
    if (!window.confirm(`Delete package "${pkg.name}"?`)) return
    setListError('')
    try {
      await remove.mutateAsync(pkg.id)
    } catch (err) {
      setListError(getApiError(err))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {service.requires_quote
            ? 'This service requires a quote, so packages are not used.'
            : 'Fixed-price packages clients can choose from.'}
        </p>
        <Button leftIcon={Plus} size="sm" onClick={() => open(null)}>
          Add package
        </Button>
      </div>

      {listError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{listError}</p>}

      {packages.length === 0 ? (
        <EmptyState title="No packages" description="Add a package to let clients order directly." />
      ) : (
        packages.map((p) => (
          <Card key={p.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {p.name}
                {p.is_popular && <Badge tone="purple">Popular</Badge>}
                <Badge tone={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'Active' : 'Hidden'}</Badge>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatPrice(p.price, service.currency)} · {p.estimated_days ?? '—'} days ·{' '}
                {p.revisions_included} revisions · {p.features.length} features
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" leftIcon={Pencil} onClick={() => open(p)}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" leftIcon={Trash2} onClick={() => handleDelete(p)}>
                Delete
              </Button>
            </div>
          </Card>
        ))
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit package' : 'New package'}>
        {form && (
          <form onSubmit={submit} className="space-y-4">
            {formError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

            <Input label="Name *" value={form.name} onChange={set('name')} error={errors.name} />
            <Textarea
              label="Description"
              rows={2}
              value={form.description}
              onChange={set('description')}
              error={errors.description}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Price (MGA) *"
                type="number"
                min="1"
                value={form.price}
                onChange={set('price')}
                error={errors.price}
              />
              <Input
                label="Days"
                type="number"
                min="1"
                value={form.estimated_days}
                onChange={set('estimated_days')}
                error={errors.estimated_days}
              />
              <Input
                label="Revisions"
                type="number"
                min="0"
                value={form.revisions_included}
                onChange={set('revisions_included')}
                error={errors.revisions_included}
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <CheckField
                label="Most popular"
                checked={form.is_popular}
                onChange={(e) => setForm((f) => ({ ...f, is_popular: e.target.checked }))}
              />
              <CheckField
                label="Active"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Features</p>
              <FeatureListEditor
                value={form.features}
                onChange={(features) => setForm((f) => ({ ...f, features }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={create.isPending || update.isPending}>
                Save package
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}