export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-surface-main/30 relative">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6">

        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-3 pt-16 md:pt-4">
          <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          <div className="h-3 w-40 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Hero Section Skeleton */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {/* Image */}
          <div className="w-full md:w-80 shrink-0">
            <div className="w-full aspect-square md:aspect-[4/5] bg-surface-card border border-white/10 rounded-2xl animate-pulse" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-5 w-full">
            <div>
              <div className="h-10 w-3/4 bg-white/5 rounded-lg animate-pulse mb-3" />
              <div className="h-4 w-full bg-white/5 rounded animate-pulse mb-2" />
              <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
            </div>

            {/* Quick Facts */}
            <div className="flex gap-2">
              <div className="h-7 w-20 bg-white/5 rounded-full animate-pulse" />
              <div className="h-7 w-16 bg-white/5 rounded-full animate-pulse" />
            </div>

            {/* Stats Card */}
            <div className="bg-surface-card border border-white/10 rounded-xl p-5">
              <div className="h-3 w-12 bg-white/5 rounded mb-4 animate-pulse" />
              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="text-center space-y-1">
                    <div className="h-6 w-10 bg-white/5 rounded mx-auto animate-pulse" />
                    <div className="h-2 w-8 bg-white/5 rounded mx-auto animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections Skeleton */}
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-surface-card border border-white/10 rounded-xl p-5 space-y-3">
            <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
