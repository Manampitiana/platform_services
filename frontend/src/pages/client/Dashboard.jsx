import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrdersSummary } from '../../hooks/useOrders'
import Button from '../../components/common/Button'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import RecentOrders from '../../components/dashboard/RecentOrders'
import StatsGrid from '../../components/dashboard/StatsGrid'

export default function Dashboard() {
  const { user } = useAuth()
  const { data, isLoading, isError, refetch } = useOrdersSummary()

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        title={`Welcome, ${user.name.split(' ')[0]}`}
        description="Here is an overview of your orders."
        action={
          <Link to="/services">
            <Button leftIcon={Plus}>New order</Button>
          </Link>
        }
      />

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <>
          <StatsGrid counts={data?.counts} isLoading={isLoading} />
          <RecentOrders orders={data?.recent} isLoading={isLoading} />
        </>
      )}
    </div>
  )
}