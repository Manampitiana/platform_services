import { Link } from 'react-router-dom'
import Card from '../common/Card'
import { statuses } from '../../utils/orderStatuses'
import { timeAgo } from '../../utils/timeAgo'

const dots = {
  gray: 'bg-slate-400',
  blue: 'bg-sky-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
  purple: 'bg-violet-500',
}

export default function ActivityFeed({ items }) {
  return (
    <Card>
      <h2 className="font-semibold">Recent activity</h2>

      {!items?.length ? (
        <p className="mt-4 text-sm text-slate-500">No activity yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((item) => {
            const status = statuses[item.to_status] ?? { label: item.to_status, tone: 'gray' }
            return (
              <li key={item.id} className="flex gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dots[status.tone]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <Link to={`/admin/orders/${item.order_uuid}`} className="font-medium hover:text-brand-600">
                      {item.order_number}
                    </Link>{' '}
                    <span className="text-slate-500">→ {status.label}</span>
                  </p>
                  {item.note && <p className="truncate text-xs text-slate-400">{item.note}</p>}
                </div>
                <span className="shrink-0 text-xs text-slate-400">{timeAgo(item.created_at)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}