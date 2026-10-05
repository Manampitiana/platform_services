import { Link, useParams } from 'react-router-dom'
import { SearchX, Sparkles } from 'lucide-react'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Skeleton from '../../components/common/Skeleton'
import FadeIn from '../../components/motion/FadeIn'
import { Stagger, StaggerItem } from '../../components/motion/Stagger'
import FeatureList from '../../components/services/FeatureList'
import PackageCard from '../../components/services/PackageCard'
import ServiceHero from '../../components/services/ServiceHero'
import { useService } from '../../hooks/useServices'

export default function ServiceDetail() {
  const { slug } = useParams()
  const { data: service, isLoading, isError, error, refetch } = useService(slug)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  if (isError) {
    const notFound = error?.response?.status === 404
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        {notFound ? (
          <EmptyState
            icon={SearchX}
            title="Service not found"
            description="This service does not exist or is no longer available."
            action={
              <Link to="/services">
                <Button>Browse services</Button>
              </Link>
            }
          />
        ) : (
          <ErrorState onRetry={refetch} />
        )}
      </div>
    )
  }

  const hasPackages = service.packages?.length > 0

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
      <FadeIn>
        <ServiceHero service={service} />
      </FadeIn>

      <FadeIn>
        <FeatureList features={service.features} />
      </FadeIn>

      {hasPackages ? (
        <section>
          <FadeIn className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Choose your package</h2>
          </FadeIn>
          <Stagger className="grid gap-6 md:grid-cols-3">
            {service.packages.map((pkg) => (
              <StaggerItem key={pkg.id} className="h-full">
                <PackageCard pkg={pkg} serviceSlug={service.slug} currency={service.currency} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : (
        <FadeIn>
          <Card className="text-center">
            <Sparkles className="mx-auto h-8 w-8 text-brand-600" />
            <h2 className="mt-3 text-xl font-semibold">Tell us about your project</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Describe what you need and we will send you a detailed quote before starting.
            </p>
            <Link to={`/orders/new?service=${service.slug}`} className="mt-5 inline-block">
              <Button size="lg">Request a quote</Button>
            </Link>
          </Card>
        </FadeIn>
      )}
    </div>
  )
}