import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <Skeleton className="h-6 w-24 mb-6" />
      <div className="card p-4 mb-4 space-y-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="card overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-3.5 ${
              i < 4 ? "border-b border-border-subtle" : ""
            }`}
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
