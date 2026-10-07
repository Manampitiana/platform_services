import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronRight, ClipboardList, CreditCard, FileText, Inbox, MessageSquare, RefreshCw } from 'lucide-react'
import Card from '../common/Card'

const tones = {
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600',
  brand: 'bg-brand-50 text-brand-600',
}

const rows = [
  { key: 'payments_to_verify', label: 'Payments to verify', icon: CreditCard, to: '/admin/payments?status=proof_submitted', tone: 'amber' },
  { key: 'orders_to_review', label: 'Orders to review', icon: ClipboardList, to: '/admin/orders?status=submitted', tone: 'sky' },
  { key: 'quotes_to_prepare', label: 'Quotes to prepare', icon: FileText, to: '/admin/orders?status=quote_pending', tone: 'violet' },
  { key: 'revisions_requested', label: 'Revisions requested', icon: RefreshCw, to: '/admin/orders?status=revision', tone: 'rose' },
  { key: 'unread_messages', label: 'Unread messages', icon: MessageSquare, to: '/admin/orders', tone: 'brand' },
  { key: 'contact_messages', label: 'Contact messages', icon: Inbox, to: '/admin/contact', tone: 'sky' },
]

export default function ActionQueue({ actions }) {
  const pending = rows.filter((r) => (actions[r.key] ?? 0) > 0)

  return (
    <Card className="h-full">
      <h2 className="font-semibold">Needs your attention</h2>
      <p className="text-sm text-slate-500">Things waiting for you right now.</p>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <p className="mt-3 font-medium">You're all caught up</p>
          <p className="text-sm text-slate-500">Nothing needs your action.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-1">
          {pending.map(({ key, label, icon: Icon, to, tone }) => (
            <li key={key}>
              <Link
                to={to}
                className="group flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums">
                  {actions[key]}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}