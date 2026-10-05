import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useSaveServiceFields } from '../../hooks/useAdmin'
import { getApiError } from '../../utils/getApiError'
import { slugify } from '../../utils/slugify'
import Button from '../common/Button'
import Card from '../common/Card'
import CheckField from '../common/CheckField'
import Select from '../common/Select'

const TYPES = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio buttons' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'file', label: 'File upload' },
]

const hasOptions = (type) => ['select', 'radio'].includes(type)

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500'

const fromApi = (f) => ({
  name: f.name,
  label: f.label,
  type: f.type,
  placeholder: f.placeholder ?? '',
  help_text: f.help_text ?? '',
  options: (f.options ?? []).join(', '),
  is_required: f.is_required,
  is_active: f.is_active,
  autoName: false,
})

const blank = () => ({
  name: '',
  label: '',
  type: 'text',
  placeholder: '',
  help_text: '',
  options: '',
  is_required: false,
  is_active: true,
  autoName: true,
})

export default function FormFieldsTab({ service }) {
  const save = useSaveServiceFields(service.id)
  const [fields, setFields] = useState(() => (service.form_fields ?? []).map(fromApi))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const update = (i, patch) => {
    setMessage('')
    setFields((list) => list.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
  }

  const changeLabel = (i, label) =>
    update(i, fields[i].autoName ? { label, name: slugify(label, '_') } : { label })

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= fields.length) return
    setFields((list) => {
      const copy = [...list]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })
  }

  const submit = async () => {
    setMessage('')
    setError('')

    const payload = fields.map((f) => ({
      name: f.name,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder || null,
      help_text: f.help_text || null,
      options: hasOptions(f.type)
        ? f.options.split(',').map((o) => o.trim()).filter(Boolean)
        : null,
      is_required: f.is_required,
      is_active: f.is_active,
    }))

    try {
      await save.mutateAsync(payload)
      setMessage('Brief form saved.')
    } catch (err) {
      setError(getApiError(err))
    }
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-1">
        <h3 className="font-semibold">Brief form</h3>
        <p className="text-sm text-slate-500">
          Questions the client answers when ordering this service. The "key" identifies the answer
          in the order. Renaming a key does not change answers already stored in existing orders.
        </p>
      </Card>

      {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {fields.map((f, i) => (
        <Card key={i} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Label *</label>
              <input
                className={inputClass}
                value={f.label}
                onChange={(e) => changeLabel(i, e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Key *</label>
              <input
                className={inputClass}
                value={f.name}
                onChange={(e) => update(i, { name: e.target.value, autoName: false })}
                placeholder="e.g. company_name"
              />
            </div>
            <Select
              label="Type"
              options={TYPES}
              placeholder="Type"
              value={f.type}
              onChange={(e) => update(i, { type: e.target.value || 'text' })}
            />
            {hasOptions(f.type) ? (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Options (comma separated) *</label>
                <input
                  className={inputClass}
                  value={f.options}
                  onChange={(e) => update(i, { options: e.target.value })}
                  placeholder="Minimal, Modern, Classic"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Placeholder</label>
                <input
                  className={inputClass}
                  value={f.placeholder}
                  onChange={(e) => update(i, { placeholder: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Help text</label>
            <input
              className={inputClass}
              value={f.help_text}
              onChange={(e) => update(i, { help_text: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-6">
              <CheckField
                label="Required"
                checked={f.is_required}
                onChange={(e) => update(i, { is_required: e.target.checked })}
              />
              <CheckField
                label="Active"
                checked={f.is_active}
                onChange={(e) => update(i, { is_active: e.target.checked })}
              />
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === fields.length - 1}
                className="rounded p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setFields((list) => list.filter((_, idx) => idx !== i))}
                className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                aria-label="Remove field"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      ))}

      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="secondary" leftIcon={Plus} onClick={() => setFields((list) => [...list, blank()])}>
          Add field
        </Button>
        <Button onClick={submit} loading={save.isPending}>
          Save brief form
        </Button>
      </div>
    </div>
  )
}