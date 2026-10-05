export default function CountBadge({ count, className = '' }) {
  if (!count) return null

  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white ${className}`}
      aria-label={`${count} unread`}
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}