const filters = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'awaiting_payment', label: 'Awaiting payment' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
]

export default function OrderStatusFilter({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
            value === f.value
              ? 'bg-brand-600 text-white'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}