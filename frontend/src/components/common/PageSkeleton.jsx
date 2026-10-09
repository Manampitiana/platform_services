import Skeleton from './Skeleton'

export default function PageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />

      <div className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <Skeleton className="h-64 w-full" />
    </div>
  )
}