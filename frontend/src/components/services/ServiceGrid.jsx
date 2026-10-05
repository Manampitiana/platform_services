import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import Skeleton from '../common/Skeleton'
import ServiceCard from './ServiceCard'
import { Stagger, StaggerItem } from '../motion/Stagger'

export default function ServiceGrid({ services, isLoading, isError, refetch }) {
  const gridClass = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4'

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState onRetry={refetch} />

  if (!services?.length) {
    return <EmptyState title="No services found" description="Please check back soon." />
  }

  return (
    <Stagger className={gridClass}>
      {services.map((service) => (
        <StaggerItem key={service.id} className="h-full">
          <ServiceCard service={service} />
        </StaggerItem>
      ))}
    </Stagger>
  )
}