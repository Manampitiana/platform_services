import { Link } from 'react-router-dom'
import FadeIn from '../../../components/motion/FadeIn'
import ServiceGrid from '../../../components/services/ServiceGrid'
import { useServices } from '../../../hooks/useServices'

export default function ServicesSection() {
  const { data, isLoading, isError, refetch } = useServices({ featured: 1 })

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <FadeIn className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Our services</h2>
        <p className="mt-2 text-slate-500">Everything you need to build your professional presence.</p>
      </FadeIn>

      <ServiceGrid services={data} isLoading={isLoading} isError={isError} refetch={refetch} />

      <div className="mt-8 text-center">
        <Link to="/services" className="text-sm font-medium text-brand-600 hover:underline">
          See all services
        </Link>
      </div>
    </section>
  )
}