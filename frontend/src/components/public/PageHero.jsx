import Badge from '../common/Badge'
import FadeIn from '../motion/FadeIn'

export default function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-brand-50/70 to-white">
      <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
        <FadeIn>
          {eyebrow && <Badge tone="purple">{eyebrow}</Badge>}
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          {description && (
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">{description}</p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </FadeIn>
      </div>
    </section>
  )
}