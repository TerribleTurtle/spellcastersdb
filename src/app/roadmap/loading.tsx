export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="mb-12 text-center">
        <div className="h-10 w-64 bg-slate-800 rounded-lg mx-auto mb-4 animate-pulse" />
        <div className="h-4 w-96 bg-slate-800 rounded mx-auto animate-pulse" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="h-64 rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col animate-pulse"
          >
            <div className="h-6 w-3/4 bg-slate-800 rounded mb-4" />
            <div className="h-4 w-1/2 bg-slate-800 rounded" />
            
            <div className="grow" />
            
            <div className="flex gap-2 mb-6">
                <div className="h-6 w-16 bg-slate-800 rounded-full" />
                <div className="h-6 w-20 bg-slate-800 rounded-full" />
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between">
                <div className="h-4 w-24 bg-slate-800 rounded" />
                <div className="h-4 w-12 bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
