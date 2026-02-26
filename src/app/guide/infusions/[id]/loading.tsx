import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-20 md:pt-28 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-12 bg-surface-card rounded" />
          <Skeleton className="h-4 w-20 bg-surface-card rounded" />
          <Skeleton className="h-4 w-24 bg-surface-card rounded" />
        </div>

        {/* Header */}
        <div className="bg-surface-card border border-border-default rounded-lg p-6 lg:p-8 flex items-start gap-6">
          <Skeleton className="w-20 h-20 rounded-xl bg-surface-hover shrink-0 hidden sm:block" />
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-48 bg-surface-hover rounded" />
              <Skeleton className="h-6 w-16 bg-surface-hover rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 bg-surface-inset rounded border border-border-subtle" />
              <Skeleton className="h-24 bg-surface-inset rounded border border-border-subtle" />
            </div>
          </div>
        </div>

        {/* Related entities */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-40 bg-surface-card rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[220px] bg-surface-card rounded-lg border border-border-default"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
