import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-20 md:pt-28 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <Skeleton className="h-10 w-56 bg-surface-card rounded" />

        {/* Header card */}
        <div className="bg-surface-card border border-border-default rounded-lg p-6 space-y-3">
          <Skeleton className="h-4 w-40 bg-surface-hover rounded" />
          <Skeleton className="h-5 w-full bg-surface-hover rounded" />
        </div>

        {/* Content sections */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-card border border-border-default rounded-lg p-6 space-y-4"
          >
            <Skeleton className="h-7 w-48 bg-surface-hover rounded" />
            <Skeleton className="h-4 w-full bg-surface-hover rounded" />
            <Skeleton className="h-4 w-5/6 bg-surface-hover rounded" />
            <Skeleton className="h-4 w-3/4 bg-surface-hover rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
