import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import ServiceGrid from '../../components/services/ServiceGrid'
import PageHero from '../../components/public/PageHero'
import { useCategories } from '../../hooks/useCategories'
import { useDebounce } from '../../hooks/useDebounce'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useServices } from '../../hooks/useServices'

export default function Services() {
  usePageMeta({
    title: 'Services',
    description: 'CV design, logo design, website creation and custom projects. Fixed prices and clear delivery times.',
  })

  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? ''
  const [query, setQuery] = useState(params.get('q') ?? '')
  const search = useDebounce(query.trim(), 350)

  const { data: categories } = useCategories()
  const { data, isLoading, isError, refetch } = useServices({
    category: category || undefined,
    search: search || undefined,
  })

  const update = (next) => {
    const merged = { category, q: query, ...next }
    const clean = Object.fromEntries(Object.entries(merged).filter(([, v]) => v))
    setParams(clean, { replace: true })
  }

  const chip = (active) =>
    `shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
      active ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
    }`

  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Choose the service that fits your needs"
        description="Prices shown are starting prices. Pick a package, or ask for a custom quote."
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar lg:mx-0 lg:px-0">
            <button className={chip(!category)} onClick={() => update({ category: '' })}>All</button>
            {categories?.map((c) => (
              <button key={c.id} className={chip(category === c.slug)} onClick={() => update({ category: c.slug })}>
                {c.name}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                update({ q: e.target.value })
              }}
              placeholder="Search a service"
              aria-label="Search a service"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  update({ q: '' })
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <ServiceGrid services={data} isLoading={isLoading} isError={isError} refetch={refetch} />
      </div>
    </>
  )
}