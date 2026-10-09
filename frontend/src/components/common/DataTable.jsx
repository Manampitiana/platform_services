import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import Card from './Card'
import Skeleton from './Skeleton'

const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' }

function SortIcon({ active, dir }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
  return dir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
}

export default function DataTable({
  columns,
  rows = [],
  rowKey,
  isLoading = false,
  isFetching = false,
  sort,
  dir = 'desc',
  onSort,
  onRowClick,
  renderCard, // raha omena: tableau amin'ny desktop, lisitra carte amin'ny finday
  skeletonRows = 6,
  footer,
}) {
  const refreshing = isFetching && !isLoading
  const clickable = Boolean(onRowClick)

  const onKey = (row) => (e) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onRowClick(row)
    }
  }

  const rowProps = (row) =>
    clickable
      ? { onClick: () => onRowClick(row), onKeyDown: onKey(row), tabIndex: 0 }
      : {}

  return (
    <Card padded={false} className="relative overflow-hidden">
      {refreshing && (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-brand-100" aria-hidden="true">
          <div className="h-full w-1/3 animate-[progress_1.1s_ease-in-out_infinite] bg-brand-600" />
        </div>
      )}

      {/* Tableau */}
      <div className={`overflow-x-auto ${renderCard ? 'hidden md:block' : 'block'}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
              {columns.map((col) => {
                const active = sort === col.key

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={col.sortable ? (active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                    className={`px-4 py-3 font-medium first:pl-6 last:pr-6 ${alignClass[col.align ?? 'left']} ${col.className ?? ''}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className={`inline-flex items-center gap-1.5 uppercase tracking-wide transition hover:text-slate-800 ${
                          active ? 'text-slate-900' : ''
                        }`}
                      >
                        {col.header}
                        <SortIcon active={active} dir={dir} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody className={`divide-y divide-slate-100 transition-opacity ${refreshing ? 'opacity-60' : ''}`}>
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-4 first:pl-6 last:pr-6">
                        <Skeleton className={`h-4 ${col.skeleton ?? 'w-24'} ${col.align === 'right' ? 'ml-auto' : ''}`} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    {...rowProps(row)}
                    className={`transition ${
                      clickable
                        ? 'cursor-pointer hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500'
                        : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        onClick={col.interactive ? (e) => e.stopPropagation() : undefined}
                        className={`px-4 py-3.5 first:pl-6 last:pr-6 ${alignClass[col.align ?? 'left']} ${col.className ?? ''}`}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Lisitra carte amin'ny finday */}
      {renderCard && (
        <ul className={`divide-y divide-slate-100 md:hidden ${refreshing ? 'opacity-60' : ''}`}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-start gap-3 px-4 py-4">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                </li>
              ))
            : rows.map((row) => (
                <li
                  key={rowKey(row)}
                  {...rowProps(row)}
                  className={clickable ? 'cursor-pointer transition active:bg-slate-50' : ''}
                >
                  {renderCard(row)}
                </li>
              ))}
        </ul>
      )}

      {footer && <div className="border-t border-slate-100 px-4 py-3 sm:px-6">{footer}</div>}
    </Card>
  )
}