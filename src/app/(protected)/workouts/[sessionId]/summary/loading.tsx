import { Skeleton } from "@/components/ui/skeleton";

export default function SummaryLoading() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="card p-4 mb-6">
        <Skeleton className="h-8 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-20 mx-auto" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="card px-4 py-3 mb-2 flex items-center justify-between"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
