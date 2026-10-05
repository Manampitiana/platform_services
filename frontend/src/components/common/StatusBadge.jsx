import Badge from './Badge'
import { statuses } from '../../utils/orderStatuses'

export default function StatusBadge({ status }) {
  const { label, tone } = statuses[status] ?? { label: status, tone: 'gray' }
  return <Badge tone={tone}>{label}</Badge>
}