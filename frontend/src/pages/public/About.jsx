import { Link } from 'react-router-dom'
import { Eye, Handshake, Lock, Target } from 'lucide-react'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import FadeIn from '../../components/motion/FadeIn'
import { Stagger, StaggerItem } from '../../components/motion/Stagger'
import PageHero from '../../components/public/PageHero'
import { site } from '../../config/site'
import { usePageMeta } from '../../hooks/usePageMeta'

const values = [
  { icon: Eye, title: 'Transparency', text: 'Clear prices, clear deadlines and a visible history of every step of your order.' },
  { icon: Lock, title: 'Privacy', text: 'Your files and information are only accessible to you and the team working on your project.' },
  { icon: Target, title: 'Quality', text: 'Revisions are built into each package, so the result matches what you had in mind.' },
  { icon: Handshake, title: 'Proximity', text: 'A real team, reachable in one place, that understands local needs.' },
]

export default function About() {
  usePageMeta({
    title: 'About us',
    description: `${site.name} helps individuals and businesses in Madagascar get professional CVs, logos and websites.`,
  })

  return (
    <>
      <PageHero
        eyebrow="About us"
        title={`${site.name}, your digital partner`}
        description="We make it simple to order professional digital work: clear packages, secure payment and a tracked delivery."
      />

      <section className="mx-auto max-w-4xl px-4 py-16">
        <FadeIn className="space-y-4 text-lg leading-relaxed text-slate-600">
          <p>
            Ordering a CV, a logo or a website often means long chats, missing information and no real follow-up.
            We built {site.name} to put the whole process in one place: you describe your need, pay securely,
            talk to the team, review the work and download your files.
          </p>
          <p>
            Whether you are a job seeker, an entrepreneur or a growing business, you always know where your
            project stands and what comes next.
          </p>
        </FadeIn>
      </section>

      <section className="border-y border-slate-200/70 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <FadeIn className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">What we stand for</h2>
          </FadeIn>

          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title} className="h-full">
                <Card className="h-full">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Let's work together</h2>
        <p className="mt-2 text-slate-500">Start with a service, or tell us about your project.</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/services"><Button size="lg">Browse services</Button></Link>
          <Link to="/contact"><Button size="lg" variant="secondary">Contact us</Button></Link>
        </div>
      </section>
    </>
  )
}