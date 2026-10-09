export default function FilterChips({ options, value, onChange }) {
  return (
    <div
      role="tablist"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0"
    >
      {options.map((option) => {
        const active = value === option.value

        return (
          <button
            key={option.value || 'all'}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              active
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {option.label}
            {option.count !== null && option.count !== undefined && (
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}