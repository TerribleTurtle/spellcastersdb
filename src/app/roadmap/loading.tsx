export default function Loading() {
  return (
    <div className="mx-auto max-w-page-grid px-4 md:px-8 py-8 md:py-12 w-full">
      {/* Header Skeleton - Matches PageShell h1 styles */}
      <div className="mb-8 md:mb-12 text-center md:text-left">
        <div className="h-10 md:h-12 w-64 bg-surface-raised rounded-lg mx-auto md:mx-0 mb-3 md:mb-4 animate-pulse" />
        <div className="h-7 w-96 bg-surface-raised rounded mx-auto md:mx-0 animate-pulse" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="h-64 rounded-2xl bg-surface-card border border-border-default p-6 flex flex-col animate-pulse"
          >
            <div className="h-6 w-3/4 bg-surface-raised rounded mb-4" />
            <div className="h-4 w-1/2 bg-surface-raised rounded" />
            
            <div className="grow" />
            
            <div className="flex gap-2 mb-6">
                <div className="h-6 w-16 bg-surface-raised rounded-full" />
                <div className="h-6 w-20 bg-surface-raised rounded-full" />
            </div>

            <div className="border-t border-border-default pt-4 flex justify-between">
                <div className="h-4 w-24 bg-surface-raised rounded" />
                <div className="h-4 w-12 bg-surface-raised rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
