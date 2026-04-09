import { Skeleton } from "@/components/ui/skeleton";

export default function TemplateDetailLoading() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <Skeleton className="h-6 w-32 mb-6" />
      <Skeleton className="h-10 w-full mb-4" />
      <div className="card overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-0"
          >
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
