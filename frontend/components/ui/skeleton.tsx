import { cn } from "@/lib/utils"

// Base shimmer block (shadcn-style). Size it with className.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-white/[0.07]", className)}
      {...props}
    />
  )
}

// Matches the post cards on Explore and Profile
function PostSkeleton() {
  return (
    <div className="bg-[#111] border border-white/[0.08] rounded-3xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="px-5 pb-5 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="px-5 py-3 border-t border-white/5 flex justify-between">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="px-4 py-3 border-t border-white/5 flex justify-around">
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  )
}

// Avatar + two text lines, for friend / request / conversation lists
function UserRowSkeleton({ avatar = "w-10 h-10", className }: { avatar?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-2", className)}>
      <Skeleton className={cn("rounded-full shrink-0", avatar)} />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

// Matches the 12-column leaderboard table rows
function TableRowSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5">
          <div className="col-span-2 md:col-span-1 flex justify-center">
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <div className="col-span-6 md:col-span-5 flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="col-span-4 md:col-span-3 flex justify-end">
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="hidden md:flex md:col-span-3 justify-end">
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      ))}
    </>
  )
}

export { Skeleton, PostSkeleton, UserRowSkeleton, TableRowSkeleton }
