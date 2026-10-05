import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { flattenErrors } from '../../utils/flattenErrors'
import { getApiError } from '../../utils/getApiError'
import { slugify } from '../../utils/slugify'
import Button from '../common/Button'
import Card from '../common/Card'
import CheckField from '../common/CheckField'
import Input from '../common/Input'
import Select from '../common/Select'
import Textarea from '../common/Textarea'

const ICONS = [
  { value: 'cv', label: 'CV' },
  { value: 'logo', label: 'Logo' },
  { value: 'website', label: 'Website' },
  { value: 'custom', label: 'Custom' },
]

const toForm = (s) => ({
  name: s?.name ?? '',
  slug: s?.slug ?? '',
  category_id: s?.category_id ?? '',
  icon: s?.icon ?? '',
  short_description: s?.short_description ?? '',
  description: s?.description ?? '',
  base_price: s?.base_price ?? '',
  estimated_days: s?.estimated_days ?? '',
  revisions_included: s?.revisions_included ?? 0,
  requires_quote: s?.requires_quote ?? false,
  is_active: s?.is_active ?? true,
  is_featured: s?.is_featured ?? false,
  sort_order: s?.sort_order ?? 0,
})

const num = (v) => (v === '' || v === null ? null : Number(v))

export default function ServiceForm({ service, onSubmit }) {
  const isNew = !service
  const { data: categories } = useCategories()

  const [form, setForm] = useState(() => toForm(service))
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => {
    setSaved(false)
    setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const toggle = (key) => (e) => {
    setSaved(false)
    setForm((f) => ({ ...f, [key]: e.target.checked }))
  }

  const changeName = (e) => {
    const name = e.target.value
    setSaved(false)
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    setSaved(false)
    setSaving(true)

    try {
      await onSubmit({
        ...form,
        category_id: num(form.category_id),
        icon: form.icon || null,
        base_price: num(form.base_price),
        estimated_days: num(form.estimated_days),
        revisions_included: Number(form.revisions_included) || 0,
        sort_order: Number(form.sort_order) || 0,
      })
      setSaved(true)
    } catch (err) {
      const fieldErrors = flattenErrors(err)
      setErrors(fieldErrors)
      if (!Object.keys(fieldErrors).length) setFormError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-5">
        {formError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
        {saved && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Saved.</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name *" value={form.name} onChange={changeName} error={errors.name} />
          <Input
            label="Slug (URL) *"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              set('slug')(e)
            }}
            error={errors.slug}
          />
          <Select
            label="Category"
            options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
            placeholder="No category"
            value={form.category_id}
            onChange={set('category_id')}
            error={errors.category_id}
          />
          <Select
            label="Icon"
            options={ICONS}
            placeholder="Default"
            value={form.icon}
            onChange={set('icon')}
            error={errors.icon}
          />
        </div>

        <Input
          label="Short description *"
          value={form.short_description}
          onChange={set('short_description')}
          error={errors.short_description}
        />
        <Textarea
          label="Description"
          rows={5}
          value={form.description}
          onChange={set('description')}
          error={errors.description}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Base price (MGA)"
            type="number"
            min="0"
            value={form.base_price}
            onChange={set('base_price')}
            error={errors.base_price}
          />
          <Input
            label="Estimated days"
            type="number"
            min="1"
            value={form.estimated_days}
            onChange={set('estimated_days')}
            error={errors.estimated_days}
          />
          <Input
            label="Revisions included"
            type="number"
            min="0"
            value={form.revisions_included}
            onChange={set('revisions_included')}
            error={errors.revisions_included}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CheckField
            label="Requires a quote"
            hint="Custom projects: the admin sets the price after reviewing."
            checked={form.requires_quote}
            onChange={toggle('requires_quote')}
          />
          <CheckField
            label="Active"
            hint="Hidden services are not shown to clients."
            checked={form.is_active}
            onChange={toggle('is_active')}
          />
          <CheckField
            label="Featured on home page"
            checked={form.is_featured}
            onChange={toggle('is_featured')}
          />
          <Input
            label="Sort order"
            type="number"
            min="0"
            value={form.sort_order}
            onChange={set('sort_order')}
            error={errors.sort_order}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            {isNew ? 'Create service' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Card>
  )
}