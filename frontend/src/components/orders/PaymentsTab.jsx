import { useState } from 'react'
import { FileText } from 'lucide-react'
import { paymentsApi } from '../../api/paymentsApi'
import Button from '../common/Button'
import Card from '../common/Card'
import PaymentStatusBadge from '../common/PaymentStatusBadge'
import PaymentReviewModal from '../admin/PaymentReviewModal'
import PaymentForm from './PaymentForm'
import { formatPrice } from '../../utils/formatPrice'

export default function PaymentsTab({ order, readOnly = false }) {
  const payments = order.payments ?? []
  const [error, setError] = useState('')
  const [reviewing, setReviewing] = useState(null)

  const hasOpenPayment = payments.some((p) => ['pending', 'proof_submitted'].includes(p.status))
  const canPay = !readOnly && order.status === 'awaiting_payment' && order.due_amount > 0 && !hasOpenPayment

  const openProof = async (payment) => {
    setError('')
    try {
      await paymentsApi.downloadProof(payment)
    } catch {
      setError('Could not open this proof.')
    }
  }

  const summary = [
    { label: 'Total', value: order.total, className: '' },
    { label: 'Paid', value: order.paid_amount, className: 'text-emerald-700' },
    { label: 'Remaining', value: order.due_amount, className: 'text-amber-700' },
  ]

  return (
    <div className="space-y-4">
      <Card className="grid gap-3 sm:grid-cols-3 sm:gap-4 sm:text-center">
        {summary.map(({ label, value, className }) => (
          <div key={label} className="flex items-center justify-between sm:block">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`font-semibold tabular-nums sm:mt-0.5 ${className}`}>
              {formatPrice(value, order.currency)}
            </p>
          </div>
        ))}
      </Card>

      {canPay && (
        <Card>
          <PaymentForm order={order} />
        </Card>
      )}

      {!readOnly && hasOpenPayment && (
        <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          Your payment is being verified. You will be notified once it is confirmed.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <h3 className="font-semibold">Payment history</h3>

        {payments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No payments yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {p.payment_number}
                    <span className="tabular-nums"> · {formatPrice(p.amount, p.currency)}</span>
                  </p>
                  <p className="break-all text-xs text-slate-500">
                    <span className="capitalize">{p.method.replace(/_/g, ' ')}</span>
                    {p.transaction_reference && ` · ${p.transaction_reference}`}
                  </p>
                  {p.status === 'rejected' && p.admin_note && (
                    <p className="mt-1 text-xs text-red-600">Reason: {p.admin_note}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {p.has_proof && (
                    <button
                      onClick={() => openProof(p)}
                      className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" /> Proof
                    </button>
                  )}
                  {readOnly && ['pending', 'proof_submitted'].includes(p.status) && (
                    <Button size="sm" onClick={() => setReviewing(p)}>
                      Review
                    </Button>
                  )}
                  <PaymentStatusBadge status={p.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {readOnly && (
        <PaymentReviewModal
          payment={
            reviewing && {
              ...reviewing,
              order: { order_number: order.order_number, client: order.client?.name },
            }
          }
          onClose={() => setReviewing(null)}
        />
      )}
    </div>
  )
}