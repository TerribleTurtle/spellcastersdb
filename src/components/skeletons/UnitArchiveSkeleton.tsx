import { Skeleton } from "@/components/ui/skeleton";

export function UnitArchiveSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-start min-h-[80vh]">
      {/* Sidebar Skeleton (Desktop: Sticky, Mobile: Hidden/Toggle) */}
      <div className="w-full md:w-64 shrink-0 hidden md:block">
        <div className="sticky top-24 space-y-6">
          <Skeleton className="h-10 w-full bg-surface-card rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 bg-surface-card rounded" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full bg-surface-card rounded" />
              <Skeleton className="h-8 w-full bg-surface-card rounded" />
              <Skeleton className="h-8 w-full bg-surface-card rounded" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 bg-surface-card rounded" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-16 bg-surface-card rounded" />
              <Skeleton className="h-8 w-16 bg-surface-card rounded" />
              <Skeleton className="h-8 w-16 bg-surface-card rounded" />
              <Skeleton className="h-8 w-16 bg-surface-card rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 w-full">
        {/* Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          {/* Results count placeholder */}
          <Skeleton className="h-5 w-32 bg-surface-card rounded" />

          {/* View toggle placeholder */}
          <div className="flex gap-1 bg-surface-card p-1 rounded-lg">
            <Skeleton className="h-6 w-8 bg-surface-hover rounded" />
            <Skeleton className="h-6 w-8 bg-surface-hover rounded" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-card border border-border-default rounded-lg overflow-hidden h-[220px] flex flex-col"
            >
              {/* Image Area */}
              <Skeleton className="w-full h-32 bg-surface-hover" />

              {/* Content Area */}
              <div className="p-3 space-y-2 flex-1 relative">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-16 bg-surface-hover rounded" />
                  <Skeleton className="h-4 w-6 bg-surface-hover rounded" />
                </div>
                <Skeleton className="h-5 w-3/4 bg-surface-hover rounded" />

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center border-t border-border-subtle pt-2">
                  <Skeleton className="h-3 w-20 bg-surface-hover rounded" />
                  <Skeleton className="h-3 w-10 bg-surface-hover rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
