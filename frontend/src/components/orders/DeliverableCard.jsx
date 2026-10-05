import { useState } from 'react'
import { Download, ExternalLink } from 'lucide-react'
import { deliverablesApi } from '../../api/deliverablesApi'
import Badge from '../common/Badge'
import Button from '../common/Button'
import Card from '../common/Card'

const tones = {
  delivered: { label: 'Delivered', tone: 'purple' },
  approved: { label: 'Approved', tone: 'green' },
  revision_requested: { label: 'Revision requested', tone: 'yellow' },
}

export default function DeliverableCard({ deliverable }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { label, tone } = tones[deliverable.status] ?? { label: deliverable.status, tone: 'gray' }

  const download = async () => {
    setBusy(true)
    setError('')
    try {
      await deliverablesApi.download(deliverable)
    } catch {
      setError('Could not download this file.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{deliverable.title}</p>
          <p className="text-xs text-slate-500">
            Version {deliverable.version} · {new Date(deliverable.delivered_at).toLocaleDateString('en-GB')}
          </p>
        </div>
        <Badge tone={tone}>{label}</Badge>
      </div>

      {deliverable.description && <p className="text-sm text-slate-600">{deliverable.description}</p>}

      {deliverable.delivery_notes && (
        <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          {deliverable.delivery_notes}
        </p>
      )}

      {deliverable.revision_note && (
        <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          Revision requested: {deliverable.revision_note}
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2 truncate">
        {deliverable.has_file && (
          <Button variant="secondary" className='' size="sm" leftIcon={Download} loading={busy} onClick={download}>
            {deliverable.original_name ?? 'Download'}
          </Button>
        )}
        {deliverable.delivery_url && (
          <a href={deliverable.delivery_url} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" leftIcon={ExternalLink}>
              Open link
            </Button>
          </a>
        )}
      </div>
    </Card>
  )
}