import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './Button'

export default function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-500" />
      <h3 className="font-semibold text-red-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-red-700">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" leftIcon={RefreshCw} onClick={onRetry} className="mt-5">
          Try again
        </Button>
      )}
    </div>
  )
}