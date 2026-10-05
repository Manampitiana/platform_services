import { statuses } from '../../utils/orderStatuses'
import Card from '../common/Card'

export default function OrderTimeline({ histories = [] }) {
  return (
    <Card>
      <h2 className="font-semibold">Timeline</h2>
      <ol className="mt-4 space-y-5 border-l border-slate-200 pl-5">
        {histories.map((h, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-600" />
            <p className="text-sm font-medium">{statuses[h.to_status]?.label ?? h.to_status}</p>
            {h.note && <p className="text-xs text-slate-500">{h.note}</p>}
            <p className="text-xs text-slate-400">{new Date(h.created_at).toLocaleString('en-GB')}</p>
          </li>
        ))}
      </ol>
    </Card>
  )
}