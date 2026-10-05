import { AlertCircle, CheckCircle2 } from 'lucide-react'

const tones = {
  success: { box: 'bg-emerald-50 text-emerald-800 ring-emerald-200', icon: CheckCircle2 },
  error: { box: 'bg-red-50 text-red-800 ring-red-200', icon: AlertCircle },
}

export default function Alert({ tone = 'success', children }) {
  const { box, icon: Icon } = tones[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl p-3 text-sm ring-1 ring-inset ${box}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="min-w-0 break-words">{children}</p>
    </div>
  )
}