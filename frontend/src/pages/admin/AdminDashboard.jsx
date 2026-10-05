import { useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, ShoppingBag, TrendingUp, Wallet } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useAdminDashboard } from '../../hooks/useAdmin'
import { useUnread } from '../../hooks/useUnread'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import SegmentedControl from '../../components/common/SegmentedControl'
import DashboardSkeleton from '../../components/admin/DashboardSkeleton'
import KpiCard from '../../components/admin/KpiCard'
import RevenueChart from '../../components/admin/RevenueChart'
import ActionQueue from '../../components/admin/ActionQueue'
import RecentOrdersCard from '../../components/admin/RecentOrdersCard'
import PipelineCard from '../../components/admin/PipelineCard'
import ActivityFeed from '../../components/admin/ActivityFeed'


const RANGES = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [days, setDays] = useState(30)
  const { data, isError, refetch } = useAdminDashboard(days)
  const { data: unread } = useUnread()

  if (isError && !data) return <ErrorState onRetry={refetch} />

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] ?? 'Admin'}`}
        description="Here's what is happening with your platform."
        action={<SegmentedControl options={RANGES} value={days} onChange={setDays} />}
      />

      {!data ? (
        <DashboardSkeleton />
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={Wallet} label="Revenue" value={data.kpis.revenue.value} unit="MGA" change={data.kpis.revenue.change} tone="brand" />
            <KpiCard icon={ShoppingBag} label="New orders" value={data.kpis.orders.value} change={data.kpis.orders.change} tone="blue" />
            <KpiCard icon={CheckCircle2} label="Completed" value={data.kpis.completed.value} change={data.kpis.completed.change} tone="green" />
            <KpiCard icon={TrendingUp} label="Avg. order value" value={data.kpis.average_order.value} unit="MGA" change={data.kpis.average_order.change} tone="amber" />
          </motion.div>

          <motion.p variants={item} className="-mt-3 text-xs text-slate-400">
            Changes compare with the previous {data.days} days.
          </motion.p>

          <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart series={data.series} total={data.kpis.revenue.value} days={data.days} />
            </div>
            <ActionQueue actions={{ ...data.actions, unread_messages: unread?.total ?? 0 }} />
          </motion.div>

          <motion.div variants={item} className="space-y-6 lg:grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentOrdersCard orders={data.recent_orders} />
            </div>
            <div className="space-y-6">
              <PipelineCard counts={data.counts} />
              <ActivityFeed items={data.activity} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}