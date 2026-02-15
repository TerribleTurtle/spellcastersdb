"use client";


import { Skeleton } from "@/components/ui/skeleton";

export function BrowserSkeleton() {
  // Mimic the grid structure: 4 columns usually on mobile/desktop
  // We'll render enough rows to fill the viewport
  return (
    <div className="flex flex-col h-full bg-surface-main/50 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-12 border-b border-white/10 mx-4 mt-2 mb-2 flex items-center gap-2">
            <Skeleton className="h-6 w-32 bg-white/10 rounded" />
            <Skeleton className="h-6 w-8 bg-white/10 rounded-full ml-auto" />
        </div>

        {/* Grid Skeleton */}
        <div className="flex-1 p-4 grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 overflow-hidden">
            {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="aspect-4/5 rounded-lg bg-white/5 border border-white/5 relative overflow-hidden">
                    {/* Image Area */}
                    <div className="absolute inset-0 bg-white/5" />
                    {/* Text Bar */}
                    <div className="absolute bottom-0 w-full h-8 bg-black/20" />
                </div>
            ))}
        </div>
    </div>
  );
}
