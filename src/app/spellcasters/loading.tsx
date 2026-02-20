import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        {/* Title Skeleton */}
        <Skeleton className="h-10 md:h-12 w-64 mb-8 bg-surface-card rounded-lg" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="block bg-surface-card border border-border-default rounded-xl p-6 h-[200px] flex flex-col"
            >
              {/* Header: Title + Stars */}
              <div className="flex justify-between items-start mb-6">
                <Skeleton className="h-8 w-1/2 bg-surface-hover rounded" />
                <Skeleton className="h-6 w-20 bg-surface-hover rounded" />
              </div>

              {/* Stats Rows */}
              <div className="space-y-3 mt-auto">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-16 bg-surface-hover rounded" />
                  <Skeleton className="h-3 w-32 bg-surface-hover rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-16 bg-surface-hover rounded" />
                  <Skeleton className="h-3 w-24 bg-surface-hover rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-16 bg-surface-hover rounded" />
                  <Skeleton className="h-3 w-28 bg-surface-hover rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
