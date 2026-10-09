import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'

export default function SearchInput({ value = '', onChange, placeholder = 'Search', className = '' }) {
  const [text, setText] = useState(value)
  const debounced = useDebounce(text, 350)
  const committed = useRef(value)

  // Mandefa ny vokatra aorian'ny 350 ms
  useEffect(() => {
    const next = debounced.trim()

    if (next !== committed.current) {
      committed.current = next
      onChange(next)
    }
  }, [debounced, onChange])

  // Rehefa novain'ny hafa ny URL (oh: "Clear filters")
  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value
      setText(value)
    }
  }, [value])

  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => setText('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}