import { Plus, Trash2 } from 'lucide-react'
import Button from '../common/Button'

export default function FeatureListEditor({ value, onChange, showIncluded = true }) {
  const update = (i, patch) => onChange(value.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))

  return (
    <div className="space-y-2">
      {value.map((f, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={f.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Feature"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          {showIncluded && (
            <label className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-600"
                checked={f.is_included}
                onChange={(e) => update(i, { is_included: e.target.checked })}
              />
              Included
            </label>
          )}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
            aria-label="Remove feature"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        leftIcon={Plus}
        onClick={() => onChange([...value, { label: '', is_included: true }])}
      >
        Add feature
      </Button>
    </div>
  )
}