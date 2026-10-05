import { useState } from 'react'
import { CheckCircle2, Play, XCircle } from 'lucide-react'
import { useChangeOrderStatus } from '../../hooks/useAdmin'
import { getApiError } from '../../utils/getApiError'
import Button from '../common/Button'
import Card from '../common/Card'

const actionsByStatus = {
  submitted: [{ to: 'under_review', label: 'Start review', icon: Play }],
  paid: [{ to: 'in_progress', label: 'Start production', icon: Play }],
  delivered: [{ to: 'completed', label: 'Mark as completed', icon: CheckCircle2 }],
}

const cancellable = ['submitted', 'under_review', 'quote_pending', 'quote_sent', 'awaiting_payment', 'in_progress']

const hints = {
  submitted: 'Review the brief, then create a quote from the Quote tab if this is a custom project.',
  under_review: 'Create a quote from the Quote tab.',
  quote_pending: 'Finish the draft in the Quote tab and send it to the client.',
  quote_sent: 'Waiting for the client to accept or decline the quote.',
  awaiting_payment: 'Waiting for the client to pay. You will be notified when a payment is submitted.',
  in_progress: 'Production in progress. Use the Deliverables tab to deliver the work.',
  delivered: 'Waiting for the client to approve or request a revision.',
  revision: 'The client requested changes. Deliver a new version from the Deliverables tab.',
}

export default function AdminOrderActions({ order }) {
  const changeStatus = useChangeOrderStatus(order.uuid)
  const [error, setError] = useState('')

  const actions = actionsByStatus[order.status] ?? []
  const canCancel = cancellable.includes(order.status)

  if (!actions.length && !canCancel && !hints[order.status]) return null

  const run = async (payload) => {
    setError('')
    try {
      await changeStatus.mutateAsync(payload)
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const cancel = () => {
    if (window.confirm('Cancel this order? This cannot be undone.')) {
      run({ status: 'cancelled', note: 'Cancelled by admin' })
    }
  }

  return (
    <Card className="space-y-4">
      <h2 className="font-semibold">Actions</h2>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {hints[order.status] && (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{hints[order.status]}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {actions.map(({ to, label, icon }) => (
          <Button key={to} leftIcon={icon} loading={changeStatus.isPending} onClick={() => run({ status: to })}>
            {label}
          </Button>
        ))}
        {canCancel && (
          <Button variant="danger" leftIcon={XCircle} onClick={cancel}>
            Cancel order
          </Button>
        )}
      </div>
    </Card>
  )
}