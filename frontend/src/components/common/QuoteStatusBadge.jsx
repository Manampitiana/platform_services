import Badge from './Badge'
import { quoteStatuses } from '../../utils/orderStatuses'

export default function QuoteStatusBadge({ status }) {
  const { label, tone } = quoteStatuses[status] ?? { label: status, tone: 'gray' }
  return <Badge tone={tone}>{label}</Badge>
}