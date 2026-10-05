import Card from '../common/Card'
import QuoteStatusBadge from '../common/QuoteStatusBadge'
import { formatPrice } from '../../utils/formatPrice'
import QuoteTotals from './QuoteTotals'

export default function QuoteCard({ quote, children }) {
  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            {quote.quote_number} <span className="text-slate-400">· v{quote.version}</span>
          </p>
          <p className="text-xs text-slate-500">
            {quote.sent_at && `Sent ${new Date(quote.sent_at).toLocaleDateString('en-GB')}`}
            {quote.valid_until && ` · Valid until ${new Date(quote.valid_until).toLocaleDateString('en-GB')}`}
          </p>
        </div>
        <QuoteStatusBadge status={quote.is_expired ? 'expired' : quote.status} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="py-2 pr-3 font-medium">Item</th>
              <th className="px-3 py-2 text-right font-medium">Qty</th>
              <th className="px-3 py-2 text-right font-medium">Unit price</th>
              <th className="py-2 pl-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quote.items?.map((item) => (
              <tr key={item.id}>
                <td className="py-3 pr-3">
                  <p className="font-medium">{item.title}</p>
                  {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                  {item.discount > 0 && (
                    <p className="text-xs text-green-700">Discount: -{formatPrice(item.discount, quote.currency)}</p>
                  )}
                </td>
                <td className="px-3 py-3 text-right">{item.quantity}</td>
                <td className="px-3 py-3 text-right">{formatPrice(item.unit_price, quote.currency)}</td>
                <td className="py-3 pl-3 text-right font-medium">{formatPrice(item.total, quote.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <QuoteTotals totals={quote} taxRate={quote.tax_rate} currency={quote.currency} />

      {quote.notes && (
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Notes</p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{quote.notes}</p>
        </div>
      )}
      {quote.terms && (
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Terms</p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{quote.terms}</p>
        </div>
      )}
      {quote.response_note && (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          Client comment: {quote.response_note}
        </p>
      )}

      {children}
    </Card>
  )
}