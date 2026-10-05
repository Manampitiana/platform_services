import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'

export default function OrderSuccess({ order }) {
  const readyForPayment = order.status === 'awaiting_payment'

  return (
    <Card className="space-y-4 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
      <h1 className="text-2xl font-bold">Order submitted</h1>
      <p className="text-slate-500">
        Your order number is <span className="font-semibold text-slate-800">{order.order_number}</span>
      </p>
      <div className="flex justify-center">
        <StatusBadge status={order.status} />
      </div>
      <p className="mx-auto max-w-md text-sm text-slate-500">
        {readyForPayment
          ? 'Your order is confirmed and waiting for payment. You will be able to pay from your order page.'
          : 'Our team is reviewing your request. You will receive a detailed quote soon.'}
      </p>
      <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
        <Link to="/dashboard">
          <Button>Go to dashboard</Button>
        </Link>
        <Link to="/services">
          <Button variant="secondary">Browse more services</Button>
        </Link>
      </div>
    </Card>
  )
}