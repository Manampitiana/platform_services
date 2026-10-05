import { Link, useParams } from 'react-router-dom'
import { ChevronRight, SearchX, Sparkles } from 'lucide-react'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Skeleton from '../../components/common/Skeleton'
import FadeIn from '../../components/motion/FadeIn'
import { Stagger, StaggerItem } from '../../components/motion/Stagger'
import FeatureList from '../../components/services/FeatureList'
import PackageCard from '../../components/services/PackageCard'
import ServiceSummary from '../../components/services/ServiceSummary'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useService } from '../../hooks/useServices'
import { formatPrice } from '../../utils/formatPrice'

export default function ServiceDetail() {
  const { slug } = useParams()
  const { data: service, isLoading, isError, error, refetch } = useService(slug)

  usePageMeta({
    title: service?.name ?? 'Service',
    description: service?.short_description,
    noindex: isError,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Skeleton className="h-4 w-48" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    )
  }

  if (isError) {
    const notFound = error?.response?.status === 404
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        {notFound ? (
          <EmptyState
            icon={SearchX}
            title="Service not found"
            description="This service does not exist or is no longer available."
            action={<Link to="/services"><Button>Browse services</Button></Link>}
          />
        ) : (
          <ErrorState onRetry={refetch} />
        )}
      </div>
    )
  }

  const hasPackages = service.packages?.length > 0
  const quote = service.requires_quote || !service.base_price

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:pt-12 lg:pb-16">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/services" className="hover:text-brand-600">Services</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate font-medium text-slate-800">{service.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="min-w-0 space-y-12">
          <FadeIn>
            {service.category && <Badge tone="purple">{service.category.name}</Badge>}
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{service.name}</h1>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-slate-600">
              {service.description || service.short_description}
            </p>
          </FadeIn>

          <FadeIn><FeatureList features={service.features} /></FadeIn>

          {hasPackages ? (
            <section id="packages" className="scroll-mt-24">
              <FadeIn className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Choose your package</h2>
                <p className="mt-1 text-sm text-slate-500">You can change your package before submitting your order.</p>
              </FadeIn>
              <Stagger className="grid gap-5 md:grid-cols-3">
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
                  Describe what you need and attach your requirements. We will review it and send a detailed
                  quote before any payment.
                </p>
                <Link to={`/orders/new?service=${service.slug}`} className="mt-5 inline-block">
                  <Button size="lg">Request a quote</Button>
                </Link>
              </Card>
            </FadeIn>
          )}
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <ServiceSummary service={service} hasPackages={hasPackages} />
        </aside>
      </div>

      {/* Bara CTA amin'ny finday */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">{quote ? 'Pricing' : 'Starting at'}</p>
            <p className="font-bold tabular-nums">
              {quote ? 'Custom quote' : formatPrice(service.base_price, service.currency)}
            </p>
          </div>
          {hasPackages ? (
            <a href="#packages"><Button>Choose a package</Button></a>
          ) : (
            <Link to={`/orders/new?service=${service.slug}`}><Button>Request a quote</Button></Link>
          )}
        </div>
      </div>
    </div>
  )
}