import { AnimatePresence, motion } from 'motion/react'
import { useSearchParams } from 'react-router-dom'
import { ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/common/PageHeader'
import Tabs from '../../components/common/Tabs'
import GeneralTab from '../../components/profile/GeneralTab'
import ProfileSummary from '../../components/profile/ProfileSummary'
import SecurityTab from '../../components/profile/SecurityTab'

const TABS = [
  { value: 'general', label: 'General', icon: UserRound },
  { value: 'security', label: 'Security', icon: ShieldCheck },
]

export default function Profile() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()


  const requested = params.get('tab')
  const tab = TABS.some((t) => t.value === requested) ? requested : 'general'

  const changeTab = (value) => setParams(value === 'general' ? {} : { tab: value }, { replace: true })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Account settings" description="Manage your profile and security." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18.5rem_minmax(0,1fr)] lg:items-start">
        <ProfileSummary user={user} />

        <div className="min-w-0 space-y-6">
          <Tabs tabs={TABS} value={tab} onChange={changeTab} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {tab === 'general' ? <GeneralTab key={user.id} /> : <SecurityTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}