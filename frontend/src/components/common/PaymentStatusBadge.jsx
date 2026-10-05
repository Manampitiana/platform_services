import Badge from './Badge'
import { paymentStatuses } from '../../utils/orderStatuses'

export default function PaymentStatusBadge({ status }) {
  const { label, tone } = paymentStatuses[status] ?? { label: status, tone: 'gray' }
  return <Badge tone={tone}>{label}</Badge>
}