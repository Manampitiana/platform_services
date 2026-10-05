import { Link } from 'react-router-dom'
import { ArrowRight, Lock, ShieldCheck, Tag } from 'lucide-react'
import Badge from '../../../components/common/Badge'
import Button from '../../../components/common/Button'
import FadeIn from '../../../components/motion/FadeIn'
import HeroPreview from './HeroPreview'

const guarantees = [
  { icon: Tag, label: 'Fixed prices' },
  { icon: Lock, label: 'Private files' },
  { icon: ShieldCheck, label: 'Verified payments' },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-14rem] h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-200/70 via-violet-100/60 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-20">
        <div className="text-center lg:text-left">
          <FadeIn>
            <Badge tone="purple">CVs · Logos · Websites</Badge>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your digital projects,{' '}
              <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                ordered and tracked
              </span>{' '}
              in one place
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 lg:mx-0">
              Pick a service, describe your needs, pay securely and follow your project step by step until
              your files are delivered. No more scattered messages.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/services">
                <Button size="lg">
                  Browse services <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="secondary">Talk to us</Button>
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.32}>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-600 lg:justify-start">
              {guarantees.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-brand-600" /> {label}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} y={32}>
          <HeroPreview />
        </FadeIn>
      </div>
    </section>
  )
}