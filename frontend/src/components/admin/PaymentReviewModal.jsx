import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { paymentsApi } from '../../api/paymentsApi'
import { useRejectPayment, useVerifyPayment } from '../../hooks/useAdmin'
import { getApiError } from '../../utils/getApiError'
import { formatPrice } from '../../utils/formatPrice'
import Button from '../common/Button'
import Modal from '../common/Modal'
import PaymentStatusBadge from '../common/PaymentStatusBadge'
import Textarea from '../common/Textarea'

export default function PaymentReviewModal({ payment, onClose }) {
  const verify = useVerifyPayment()
  const reject = useRejectPayment()
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setNote('')
    setError('')
  }, [payment?.id])

  if (!payment) return null

  const isOpen = ['pending', 'proof_submitted'].includes(payment.status)

  const run = async (mutation, payload) => {
    setError('')
    try {
      await mutation.mutateAsync(payload)
      onClose()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const openProof = async () => {
    try {
      await paymentsApi.downloadProof(payment)
    } catch {
      setError('Could not open the proof.')
    }
  }

  return (
    <Modal open={!!payment} onClose={onClose} title={`Payment ${payment.payment_number}`}>
      <div className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <dl className="grid grid-cols-3 gap-y-2 text-sm">
          <dt className="text-slate-500">Client</dt>
          <dd className="col-span-2">{payment.order?.client}</dd>
          <dt className="text-slate-500">Order</dt>
          <dd className="col-span-2">{payment.order?.order_number}</dd>
          <dt className="text-slate-500">Amount</dt>
          <dd className="col-span-2 font-semibold">{formatPrice(payment.amount, payment.currency)}</dd>
          <dt className="text-slate-500">Method</dt>
          <dd className="col-span-2 capitalize">{payment.method.replace(/_/g, ' ')}</dd>
          <dt className="text-slate-500">Reference</dt>
          <dd className="col-span-2 break-all">{payment.transaction_reference ?? '—'}</dd>
          <dt className="text-slate-500">Status</dt>
          <dd className="col-span-2"><PaymentStatusBadge status={payment.status} /></dd>
        </dl>

        {payment.has_proof && (
          <Button variant="secondary" size="sm" leftIcon={FileText} onClick={openProof}>
            View proof
          </Button>
        )}

        {payment.admin_note && !isOpen && (
          <p className="text-sm text-slate-500">Note: {payment.admin_note}</p>
        )}

        {isOpen && (
          <>
            <Textarea
              label="Note (required to reject)"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="danger"
                loading={reject.isPending}
                onClick={() => run(reject, { id: payment.id, note })}
              >
                Reject
              </Button>
              <Button
                loading={verify.isPending}
                onClick={() => run(verify, { id: payment.id, note: note || undefined })}
              >
                Verify payment
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}