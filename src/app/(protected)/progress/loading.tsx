import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressLoading() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <Skeleton className="h-6 w-28 mb-6" />

      {/* Streak section */}
      <div className="card p-4 mb-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>

      {/* Chart */}
      <div className="card p-4 mb-4">
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-44 w-full rounded-md" />
      </div>

      {/* PR board */}
      <Skeleton className="h-4 w-36 mb-2" />
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-3 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>
        ))}
      </div>

      {/* Achievements */}
      <Skeleton className="h-4 w-32 mb-2" />
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-3 flex flex-col items-center gap-1.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}
