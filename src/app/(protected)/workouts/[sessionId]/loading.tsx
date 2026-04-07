import { Skeleton } from "@/components/ui/skeleton";

export default function SessionLoading() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="card p-4 mb-4 space-y-3">
          <Skeleton className="h-5 w-36" />
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex items-center gap-3">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
