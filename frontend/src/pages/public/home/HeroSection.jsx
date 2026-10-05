import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '../../../components/common/Button'
import Badge from '../../../components/common/Badge'
import FadeIn from '../../../components/motion/FadeIn'

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-brand-50 to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
        <FadeIn>
          <Badge tone="purple">CVs • Logos • Websites</Badge>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Your digital projects, <span className="text-brand-600">ordered and tracked</span> in one place
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Choose a service, describe your needs, receive a quote, pay and get your files delivered.
            No more scattered messages.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/services">
              <Button size="lg">
                Browse services <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary">Create an account</Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}