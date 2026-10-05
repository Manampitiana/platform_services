import PageHero from './PageHero'
import { usePageMeta } from '../../hooks/usePageMeta'

export default function LegalLayout({ title, description, updated, intro, sections }) {
  usePageMeta({ title, description })

  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={`Last updated: ${updated}`} />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-24 space-y-2 border-l border-slate-200 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-slate-500 transition hover:border-brand-500 hover:text-brand-700">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="min-w-0 max-w-3xl">
          <p className="text-lg leading-relaxed text-slate-600">{intro}</p>

          <div className="mt-10 space-y-10">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-xl font-semibold tracking-tight">{s.title}</h2>
                <div className="mt-3 space-y-3 leading-relaxed text-slate-600">
                  {s.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </>
  )
}