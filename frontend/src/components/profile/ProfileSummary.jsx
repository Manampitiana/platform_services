import { CalendarDays, Mail, Phone } from 'lucide-react'
import Badge from '../common/Badge'
import Card from '../common/Card'
import AvatarUploader from './AvatarUploader'

export default function ProfileSummary({ user }) {
  const verified = Boolean(user.email_verified_at)

  const rows = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone || 'Not provided' },
    {
      icon: CalendarDays,
      label: 'Member since',
      value: user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
        : '—',
    },
  ]

  return (
    <Card padded={false} className="overflow-hidden lg:sticky lg:top-24">
      <div className="h-24 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800" />

      <div className="px-5 pb-6 sm:px-6">
        <div className="-mt-12 flex justify-center lg:justify-start">
          <AvatarUploader />
        </div>

        <div className="mt-4 text-center lg:text-left">
          <h2 className="break-words text-lg font-bold tracking-tight">{user.name}</h2>
          <div className="mt-2 flex flex-wrap justify-center gap-2 lg:justify-start">
            <Badge tone={user.role === 'admin' ? 'purple' : 'gray'}>
              {user.role === 'admin' ? 'Administrator' : 'Client'}
            </Badge>
            <Badge tone={verified ? 'green' : 'yellow'}>
              {verified ? 'Email verified' : 'Email not verified'}
            </Badge>
          </div>
        </div>

        <dl className="mt-6 space-y-4 border-t border-slate-100 pt-5">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <dt className="text-xs text-slate-400">{label}</dt>
                <dd className="break-words text-sm font-medium text-slate-700">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  )
}