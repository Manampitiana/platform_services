import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import FadeIn from '../../../components/motion/FadeIn'
import ServiceGrid from '../../../components/services/ServiceGrid'
import { useServices } from '../../../hooks/useServices'

export default function ServicesSection() {
  const { data, isLoading, isError, refetch } = useServices({ featured: 1 })

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <FadeIn className="mb-12 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Everything you need to get started</h2>
          <p className="mt-2 text-slate-500">Ready-made packages with clear prices, or a tailored quote.</p>
        </div>
        <Link to="/services" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
          See all services <ArrowRight className="h-4 w-4" />
        </Link>
      </FadeIn>

      <ServiceGrid services={data} isLoading={isLoading} isError={isError} refetch={refetch} />
    </section>
  )
}