import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatPrice } from '../../utils/formatPrice'

export default function Step2Package({ packages, currency, selected, onSelect, onNext }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Choose your package</h2>
        <p className="mt-1 text-sm text-slate-500">You can change it before submitting.</p>
      </div>

      <div className="grid gap-3">
        {packages.map((pkg) => {
          const active = selected === pkg.slug
          return (
            <button
              type="button"
              key={pkg.id}
              onClick={() => onSelect(pkg.slug)}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                active
                  ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  {pkg.name}
                  {pkg.is_popular && <Badge tone="purple">Most popular</Badge>}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {pkg.estimated_days} days · {pkg.revisions_included} revisions
                </p>
              </div>
              <p className="font-bold">{formatPrice(pkg.price, currency)}</p>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!selected}>
          Continue
        </Button>
      </div>
    </div>
  )
}