import { ArrowUpDown } from 'lucide-react'

export default function SortSelect({ options, sort, dir, onChange, className = '' }) {
  const value = `${sort}:${dir}`

  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Sort by</span>
      <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <select
        value={options.some((o) => o.value === value) ? value : ''}
        onChange={(e) => {
          const [nextSort, nextDir] = e.target.value.split(':')
          onChange(nextSort, nextDir)
        }}
        className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
      >
        {!options.some((o) => o.value === value) && <option value="">Sort by</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}