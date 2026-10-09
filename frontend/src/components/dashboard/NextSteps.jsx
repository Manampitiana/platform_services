import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CreditCard, FileText, MessageSquare, PackageCheck } from 'lucide-react'
import Card from '../common/Card'
import { formatPrice } from '../../utils/formatPrice'

const steps = {
  awaiting_payment: {
    icon: CreditCard,
    tone: 'bg-amber-50 text-amber-600',
    title: 'Complete your payment',
    text: (o) => `Pay ${formatPrice(o.total, o.currency)} to start production.`,
    cta: 'Pay now',
  },
  quote_sent: {
    icon: FileText,
    tone: 'bg-violet-50 text-violet-600',
    title: 'Review your quote',
    text: () => 'Accept or decline the quote we prepared for you.',
    cta: 'View quote',
  },
  delivered: {
    icon: PackageCheck,
    tone: 'bg-emerald-50 text-emerald-600',
    title: 'Review your delivery',
    text: () => 'Your files are ready. Approve them or request a revision.',
    cta: 'Review',
  },
}

export default function NextSteps({ actions = [], unread = 0 }) {
  if (!actions.length && !unread) return null

  return (
    <Card padded={false} className="overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50/60 to-white">
      <div className="px-4 pb-1 pt-5 sm:px-6">
        <h2 className="font-semibold">Next steps</h2>
        <p className="text-sm text-slate-500">These orders are waiting for you.</p>
      </div>

      <ul className="divide-y divide-slate-100 pb-1">
        {actions.map((order, i) => {
          const step = steps[order.status]
          if (!step) return null

          const Icon = step.icon

          return (
            <motion.li
              key={order.uuid}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
            >
              <Link
                to={`/orders/${order.uuid}`}
                className="group flex flex-col gap-3 px-4 py-4 transition hover:bg-white/80 sm:flex-row sm:items-center sm:px-6"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-slate-500">{step.text(order)}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {order.service ?? 'Order'} · {order.order_number}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 sm:shrink-0">
                  {step.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.li>
          )
        })}

        {unread > 0 && (
          <li>
            <Link
              to="/orders"
              className="group flex items-center gap-3 px-4 py-4 transition hover:bg-white/80 sm:px-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {unread} unread message{unread > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-slate-500">Our team replied on your orders.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
            </Link>
          </li>
        )}
      </ul>
    </Card>
  )
}