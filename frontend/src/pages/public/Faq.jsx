import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SearchX, Search } from 'lucide-react'
import Accordion from '../../components/common/Accordion'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import PageHero from '../../components/public/PageHero'
import { faqCategories, faqs } from '../../content/faq'
import { usePageMeta } from '../../hooks/usePageMeta'

export default function Faq() {
  usePageMeta({
    title: 'FAQ',
    description: 'Answers about ordering, payments, delivery and your account.',
  })

  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    const term = query.trim().toLowerCase()

    return faqs.filter(
      (f) =>
        (category === 'All' || f.category === category) &&
        (!term || `${f.q} ${f.a}`.toLowerCase().includes(term))
    )
  }, [category, query])

  const chip = (active) =>
    `shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
      active ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
    }`

  return (
    <>
      <PageHero
        eyebrow="Help center"
        title="Frequently asked questions"
        description="Everything you need to know before ordering."
      >
        <div className="relative mx-auto max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a question"
            aria-label="Search a question"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm shadow-card outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </PageHero>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
          {['All', ...faqCategories].map((c) => (
            <button key={c} className={chip(category === c)} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        {items.length ? (
          <Accordion key={`${category}-${query}`} items={items} />
        ) : (
          <EmptyState
            icon={SearchX}
            title="No question found"
            description="Try another word, or ask us directly."
            action={<Link to="/contact"><Button>Contact us</Button></Link>}
          />
        )}

        <div className="mt-12 rounded-2xl bg-brand-50 p-6 text-center">
          <p className="font-semibold">Still have a question?</p>
          <p className="mt-1 text-sm text-slate-600">Our team will get back to you shortly.</p>
          <Link to="/contact" className="mt-4 inline-block"><Button>Contact us</Button></Link>
        </div>
      </div>
    </>
  )
}