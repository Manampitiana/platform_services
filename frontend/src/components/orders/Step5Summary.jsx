import Button from '../common/Button'
import { formatPrice } from '../../utils/formatPrice'

function displayValue(field, value) {
  if (field.type === 'checkbox') return value ? 'Yes' : 'No'
  return String(value)
}

export default function Step5Summary({
  order,
  service,
  fields,
  submitting,
  error,
  onBack,
  onSubmit,
}) {
  const brief = order.brief_data ?? {}
  const briefRows = fields
    .filter((f) => f.type !== 'file')
    .filter((f) => brief[f.name] !== undefined && brief[f.name] !== null && brief[f.name] !== '')

  const isQuote = service.requires_quote || order.total === 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review your order</h2>
        <p className="mt-1 text-sm text-slate-500">Check everything before submitting.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="rounded-xl bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{service.name}</p>
            {order.package && <p className="text-sm text-slate-500">{order.package.name} package</p>}
          </div>
          <p className="text-lg font-bold">
            {isQuote ? 'Quote after review' : formatPrice(order.total, order.currency)}
          </p>
        </div>
      </div>

      {briefRows.length > 0 && (
        <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {briefRows.map((field) => (
            <div key={field.id} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
              <dt className="text-sm text-slate-500">{field.label}</dt>
              <dd className="whitespace-pre-line text-sm sm:col-span-2">
                {displayValue(field, brief[field.name])}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div>
        <p className="text-sm font-medium text-slate-700">Files ({order.files?.length ?? 0})</p>
        {order.files?.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {order.files.map((file) => (
              <li key={file.id}>{file.original_name}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-slate-400">No files attached.</p>
        )}
      </div>

      <p className="text-xs text-slate-400">
        {isQuote
          ? 'Our team will review your request and send you a detailed quote before any payment.'
          : 'After submitting, your order will be ready for payment.'}
      </p>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button onClick={onSubmit} loading={submitting}>
          Submit order
        </Button>
      </div>
    </div>
  )
}