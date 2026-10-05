import { forwardRef } from 'react'

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder = 'Select an option', className = '', ...props },
  ref
) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <select
        ref={ref}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition
          focus:ring-2 focus:ring-brand-500
          ${error ? 'border-red-400' : 'border-slate-300'} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Select