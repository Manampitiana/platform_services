import { useState } from 'react'
import { Upload } from 'lucide-react'
import { useCreateDeliverable } from '../../hooks/useDeliverables'
import { getApiError } from '../../utils/getApiError'
import Button from '../common/Button'
import Card from '../common/Card'
import Input from '../common/Input'
import Textarea from '../common/Textarea'

export default function DeliverableForm({ order }) {
  const create = useCreateDeliverable(order.uuid)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setFormError('')

    try {
      await create.mutateAsync({
        title,
        description,
        file,
        delivery_url: url,
        delivery_notes: notes,
      })
      setTitle('')
      setDescription('')
      setUrl('')
      setNotes('')
      setFile(null)
    } catch (err) {
      const apiErrors = err?.response?.data?.errors
      if (apiErrors) {
        setErrors(Object.fromEntries(Object.entries(apiErrors).map(([k, v]) => [k, v[0]])))
      } else {
        setFormError(getApiError(err))
      }
    }
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <h3 className="font-semibold">Deliver work</h3>
        {formError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

        <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
        <Textarea
          label="Description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">File (max 50 MB)</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-500 hover:border-brand-500">
            <Upload className="h-4 w-4" />
            <span className="truncate">{file ? file.name : 'Choose a file'}</span>
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          {errors.file && <p className="text-xs text-red-600">{errors.file}</p>}
        </div>

        <Input
          label="Delivery URL (website link, shared folder...)"
          type="url"
          placeholder="https://"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={errors.delivery_url}
        />
        <Textarea
          label="Delivery notes (access details, instructions...)"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          error={errors.delivery_notes}
        />

        <Button type="submit" loading={create.isPending} disabled={!title}>
          Deliver to client
        </Button>
      </form>
    </Card>
  )
}