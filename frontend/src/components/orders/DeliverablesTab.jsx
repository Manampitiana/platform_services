import { useState } from 'react'
import { CheckCircle2, PackageOpen, RefreshCw } from 'lucide-react'
import { useApproveDeliverable, useRequestRevision } from '../../hooks/useDeliverables'
import { getApiError } from '../../utils/getApiError'
import Button from '../common/Button'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'
import Modal from '../common/Modal'
import Textarea from '../common/Textarea'
import DeliverableCard from './DeliverableCard'
import { useConfirm } from '../../contexts/ConfirmContext'
import { useToast } from '../../contexts/ToastContext'

export default function DeliverablesTab({ order, readOnly = false }) {
  const deliverables = order.deliverables ?? []
  const approve = useApproveDeliverable()
  const revise = useRequestRevision()

  const confirm = useConfirm()
  const toast = useToast()

  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const latest = deliverables[0]
  const canReview = !readOnly && order.status === 'delivered' && latest?.status === 'delivered'
  const remaining = Math.max(0, (order.revisions_allowed ?? 0) - (order.revisions_used ?? 0))

  const handleApprove = async () => {
    const ok = await confirm({
      title: 'Approve this delivery?',
      description: 'Your order will be marked as completed and you will no longer be able to request a revision.',
      confirmLabel: 'Approve and complete',
      onConfirm: () => approve.mutateAsync(latest.id),
    })

    if (ok) toast.success('Delivery approved. Thank you!')
  }

  const handleRevision = async () => {
    setError('')
    try {
      await revise.mutateAsync({ id: latest.id, note })
      setOpen(false)
      toast.success('Revision request sent.')
      setNote('')
    } catch (err) {
      setError(getApiError(err))
    }
  }

  if (deliverables.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="Nothing delivered yet"
        description="Your files will appear here once they are ready."
      />
    )
  }

  return (
    <div className="space-y-4">
      {canReview && (
        <Card className="space-y-3 border-brand-200 bg-brand-50">
          <p className="text-sm font-medium">Your delivery is ready. Please review it.</p>
          <p className="text-xs text-slate-500">
            Revisions remaining: {remaining} of {order.revisions_allowed ?? 0}
          </p>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button leftIcon={CheckCircle2} loading={approve.isPending} onClick={handleApprove}>
              Approve
            </Button>
            <Button
              variant="secondary"
              leftIcon={RefreshCw}
              disabled={remaining === 0}
              onClick={() => setOpen(true)}
            >
              Request revision
            </Button>
          </div>
          {remaining === 0 && (
            <p className="text-xs text-slate-500">
              No revisions left. Contact us in Messages for additional changes.
            </p>
          )}
        </Card>
      )}

      {deliverables.map((d) => (
        <DeliverableCard key={d.id} deliverable={d} />
      ))}

      <Modal open={open} onClose={() => setOpen(false)} title="Request a revision">
        <div className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Textarea
            label="What should we change?"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe the changes you need (min. 5 characters)"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={revise.isPending} disabled={note.trim().length < 5} onClick={handleRevision}>
              Send request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}