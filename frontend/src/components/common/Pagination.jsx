import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

export default function Pagination({
  meta,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 15, 25, 50],
  className = 'mt-6',
}) {
  if (!meta || !meta.total) return null

  const single = meta.last_page <= 1
  if (single && !onPerPageChange) return null

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-800 tabular-nums">{meta.from}–{meta.to}</span> of{' '}
        <span className="font-medium text-slate-800 tabular-nums">{meta.total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {onPerPageChange && (
          <label className="flex items-center gap-2 text-sm text-slate-500">
            Rows
            <select
              value={meta.per_page}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white py-1.5 pl-2 pr-7 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              {perPageOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        )}

        {!single && (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-500 sm:inline tabular-nums">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={ChevronLeft}
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange(meta.current_page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => onPageChange(meta.current_page + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}