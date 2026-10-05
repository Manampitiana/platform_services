import PageHeader from '../../components/common/PageHeader'
import ServiceGrid from '../../components/services/ServiceGrid'
import { useServices } from '../../hooks/useServices'

export default function Services() {
  const { data, isLoading, isError, refetch } = useServices()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader
        title="Services"
        description="Choose the service that fits your needs. Prices shown are starting prices."
      />
      <ServiceGrid services={data} isLoading={isLoading} isError={isError} refetch={refetch} />
    </div>
  )
}