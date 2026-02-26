import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-20 md:pt-28 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Title */}
        <Skeleton className="h-10 w-48 bg-surface-card rounded" />

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-card border border-border-default rounded-xl p-6 space-y-4"
            >
              <div className="flex justify-center">
                <Skeleton className="w-16 h-16 rounded-full bg-surface-hover" />
              </div>
              <Skeleton className="h-6 w-3/4 mx-auto bg-surface-hover rounded" />
              <div className="flex justify-center">
                <Skeleton className="h-5 w-16 bg-surface-hover rounded" />
              </div>
              <Skeleton className="h-4 w-full bg-surface-hover rounded" />
              <Skeleton className="h-4 w-5/6 mx-auto bg-surface-hover rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
