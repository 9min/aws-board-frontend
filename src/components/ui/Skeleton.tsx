import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-[hsl(var(--muted))]', className)} />
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
      <Skeleton className="mb-3 h-5 w-3/4" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <div className="flex gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}
