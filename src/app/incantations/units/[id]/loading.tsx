import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-20 md:pt-28 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-12 bg-surface-card rounded" />
          <Skeleton className="h-4 w-24 bg-surface-card rounded" />
        </div>

        {/* Entity header */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Image */}
          <Skeleton className="aspect-[3/4] w-full rounded-xl bg-surface-card border border-border-default" />

          {/* Stats */}
          <div className="space-y-6">
            <Skeleton className="h-10 w-64 bg-surface-card rounded" />
            <Skeleton className="h-5 w-full bg-surface-card rounded" />
            <Skeleton className="h-5 w-3/4 bg-surface-card rounded" />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-16 bg-surface-card rounded-lg border border-border-default"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Related section */}
        <Skeleton className="h-8 w-40 bg-surface-card rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[220px] bg-surface-card rounded-lg border border-border-default"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
