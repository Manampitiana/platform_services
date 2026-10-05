import { formatPrice } from '../../utils/formatPrice'

export default function QuoteTotals({ totals, taxRate, currency }) {
  const row = 'flex justify-between text-sm'

  return (
    <dl className="ml-auto w-full max-w-xs space-y-1.5">
      <div className={row}>
        <dt className="text-slate-500">Subtotal</dt>
        <dd>{formatPrice(totals.subtotal, currency)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className={row}>
          <dt className="text-slate-500">Discount</dt>
          <dd>- {formatPrice(totals.discount, currency)}</dd>
        </div>
      )}
      {Number(taxRate) > 0 && (
        <div className={row}>
          <dt className="text-slate-500">Tax ({taxRate}%)</dt>
          <dd>{formatPrice(totals.tax, currency)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
        <dt>Total</dt>
        <dd>{formatPrice(totals.total, currency)}</dd>
      </div>
    </dl>
  )
}