import { Skeleton } from "@/components/ui/skeleton";

export default function ExercisesLoading() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <Skeleton className="h-6 w-36 mb-6" />
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-16 rounded-lg" />
      </div>
      <div className="card overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-3 ${
              i < 5 ? "border-b border-border-subtle" : ""
            }`}
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
