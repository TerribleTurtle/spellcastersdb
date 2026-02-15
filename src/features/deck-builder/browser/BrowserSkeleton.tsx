"use client";


import { Skeleton } from "@/components/ui/skeleton";

export function BrowserSkeleton() {
  // Mimic the grid structure: 4 columns usually on mobile/desktop
  // We'll render enough rows to fill the viewport
  return (
    <div className="flex flex-col h-full bg-surface-main border-r border-white/10 relative animate-pulse">
        {/* Header Skeleton - Matches UnitBrowserHeader */}
        <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
             {/* Left: Search/Tabs placeholder */}
             <div className="flex gap-4">
                 <Skeleton className="h-4 w-16 bg-white/10 rounded" />
                 <Skeleton className="h-4 w-16 bg-white/10 rounded" />
                 <Skeleton className="h-4 w-16 bg-white/10 rounded" />
             </div>
             {/* Right: Actions */}
             <div className="flex gap-1">
                <Skeleton className="h-8 w-8 bg-white/10 rounded-lg" />
                <Skeleton className="h-8 w-8 bg-white/10 rounded-lg" />
             </div>
        </div>

        {/* Main Content Area - Matches MemoizedUnitBrowserList container (bg-black/20) */}
        <div className="flex-1 bg-black/20 overflow-hidden">
             {/* Grid Skeleton - Matches UnitGridRow (px-4 py-1) */}
             {/* Mock Category: Spellcasters */}
             <div className="px-4 pt-6 pb-2">
                <Skeleton className="h-5 w-32 bg-white/10 rounded" />
             </div>
             <div className="px-4 py-1 grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`sc-${i}`} className="aspect-4/5 rounded-lg bg-white/5 border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5" />
                        <div className="absolute bottom-0 w-full h-8 bg-black/20" />
                    </div>
                ))}
             </div>

             {/* Mock Category: Creatures (Main Bulk) */}
             <div className="px-4 pt-6 pb-2">
                <Skeleton className="h-5 w-24 bg-white/10 rounded" />
             </div>
             <div className="px-4 py-1 grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {Array.from({ length: 18 }).map((_, i) => (
                    <div key={`cr-${i}`} className="aspect-4/5 rounded-lg bg-white/5 border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5" />
                        <div className="absolute bottom-0 w-full h-8 bg-black/20" />
                    </div>
                ))}
             </div>
        </div>
    </div>
  );
}
