import { Skeleton } from "@/components/ui/skeleton";

export default function SocialLoading() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <Skeleton className="h-6 w-20 mb-6" />
      {/* Search bar */}
      <div className="mb-6">
        <Skeleton className="h-3 w-32 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-12" />
        </div>
      </div>
      {/* Following section */}
      <Skeleton className="h-3 w-24 mb-3" />
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-3 flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
