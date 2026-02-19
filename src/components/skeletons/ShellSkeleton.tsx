import { Skeleton } from "@/components/ui/skeleton";

export function ShellSkeleton() {
  return (
    <div className="py-8 md:py-12 px-4 md:px-8 mx-auto w-full max-w-4xl">
      {/* Header Skeleton (PageShell style) */}
      <div className="mb-8 md:mb-12 text-center md:text-left">
        <Skeleton className="h-10 md:h-12 w-3/4 md:w-1/2 mb-3 md:mb-4 bg-surface-raised rounded-lg mx-auto md:mx-0" />
        <Skeleton className="h-6 w-full md:w-2/3 bg-surface-raised rounded mx-auto md:mx-0" />
      </div>

      {/* Content Body placeholder */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full bg-surface-card rounded" />
        <Skeleton className="h-4 w-[90%] bg-surface-card rounded" />
        <Skeleton className="h-4 w-[95%] bg-surface-card rounded" />
        <Skeleton className="h-4 w-[85%] bg-surface-card rounded" />
      </div>
    </div>
  );
}
