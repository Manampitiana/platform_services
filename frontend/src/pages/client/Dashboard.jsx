import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrdersSummary } from '../../hooks/useOrders'
import { useUnread } from '../../hooks/useUnread'
import Button from '../../components/common/Button'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import NextSteps from '../../components/dashboard/NextSteps'
import RecentOrders from '../../components/dashboard/RecentOrders'
import StatsGrid from '../../components/dashboard/StatsGrid'
import { usePageMeta } from '../../hooks/usePageMeta'

export default function Dashboard() {
  usePageMeta({ title: 'Dashboard', noindex: true })

  const { user } = useAuth()
  const { data, isLoading, isError, refetch } = useOrdersSummary()
  const { data: unread } = useUnread()

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
          <NextSteps actions={data?.actions} unread={unread?.total ?? 0} />
          <StatsGrid counts={data?.counts} isLoading={isLoading} />
          <RecentOrders orders={data?.recent} isLoading={isLoading} />
        </>
      )}
    </div>
  )
}