import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-20 md:pt-28 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-80 bg-surface-card rounded" />
          <Skeleton className="h-5 w-64 bg-surface-card rounded" />
        </div>

        {/* Tab bar */}
        <div className="flex p-1 bg-surface-card border border-border-default rounded-lg w-full max-w-md">
          <Skeleton className="flex-1 h-8 bg-surface-hover rounded-md" />
          <Skeleton className="flex-1 h-8 bg-surface-card rounded-md" />
          <Skeleton className="flex-1 h-8 bg-surface-card rounded-md" />
        </div>

        {/* Content area */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-24 bg-surface-card rounded-lg border border-border-default"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
