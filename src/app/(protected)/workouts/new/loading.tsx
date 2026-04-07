import { Skeleton } from "@/components/ui/skeleton";

export default function NewWorkoutLoading() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="card p-4 mb-4">
        <Skeleton className="h-4 w-28 mb-3" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <Skeleton className="h-3 w-48 mb-1.5" />
      <div className="card overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`p-4 space-y-2 ${i < 2 ? "border-b border-border-subtle" : ""}`}
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}
