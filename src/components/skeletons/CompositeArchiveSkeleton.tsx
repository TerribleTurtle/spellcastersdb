import { UnitArchiveSkeleton } from "@/components/skeletons/UnitArchiveSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function CompositeArchiveSkeleton() {
  return (
    <div className="min-h-screen bg-surface-main text-foreground p-4 md:p-8">
      <div className="max-w-page-grid mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 md:h-12 w-64 mb-2 bg-surface-card rounded-lg" />
          <Skeleton className="h-5 w-48 bg-surface-card rounded" />
        </div>

        {/* Content Skeleton */}
        <UnitArchiveSkeleton />
      </div>
    </div>
  );
}
