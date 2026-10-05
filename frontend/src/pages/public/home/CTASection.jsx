import { Link } from 'react-router-dom'
import Button from '../../../components/common/Button'
import FadeIn from '../../../components/motion/FadeIn'

export default function CTASection() {
  return (
    <section className="px-4 py-20">
      <FadeIn>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-16 text-center text-white">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />

          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">Ready to start your project?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-brand-100">
            Create a free account and submit your first request in minutes.
          </p>

          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register"><Button size="lg" variant="secondary">Get started</Button></Link>
            <Link to="/services">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">Browse services</Button>
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}