"use client";

import { BrowserSkeleton } from "@/features/deck-builder/browser/BrowserSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="flex flex-col h-full w-full bg-surface-main overflow-hidden xl:grid xl:grid-cols-[1fr_640px] xl:grid-rows-[auto_1fr]">
       
       {/* === DESKTOP HEADER (xl:flex) === */}
       <div className="hidden xl:flex h-14 border-b border-border-default shrink-0 bg-surface-main xl:col-span-2 items-center px-4 justify-between gap-4">
           {/* Deck Name Input Skeleton */}
           <Skeleton className="h-8 w-64 bg-surface-card rounded" />
           {/* Toolbar Skeleton */}
           <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 bg-surface-card rounded" />
                <Skeleton className="h-8 w-8 bg-surface-card rounded" />
                <Skeleton className="h-8 w-24 bg-surface-card rounded" />
           </div>
       </div>

       {/* === MOBILE HEADERS (xl:hidden) === */}
       <div className="xl:hidden flex flex-col shrink-0">
           {/* 1. App Header (MobileHeader.tsx) */}
           <div className="h-14 border-b border-border-default flex items-center px-4 justify-between bg-surface-main">
               <Skeleton className="h-8 w-8 bg-surface-card rounded-full" /> {/* Library */}
               {/* Mode Switcher */}
               <div className="flex gap-1 bg-surface-card p-1 rounded-lg">
                   <Skeleton className="h-6 w-12 bg-surface-card rounded" />
                   <Skeleton className="h-6 w-12 bg-surface-card rounded" />
               </div>
               {/* Actions */}
               <div className="flex gap-2">
                   <Skeleton className="h-8 w-8 bg-surface-card rounded-full" />
                   <Skeleton className="h-8 w-8 bg-surface-card rounded-full" />
               </div>
           </div>
           
           {/* 2. Context Bar (MobileContextBar.tsx) - WAS MISSING in v1.0.6 */}
           <div className="h-14 border-b border-border-default flex items-center px-4 justify-between bg-surface-main">
               <Skeleton className="h-8 w-40 bg-surface-card rounded" /> {/* Deck Name */}
               <Skeleton className="h-9 w-9 bg-surface-card rounded-full" /> {/* Save Button */}
           </div>
       </div>

       {/* === MAIN CONTENT (Browser) === */}
       <div className="flex flex-col h-full w-full overflow-hidden xl:col-start-1 xl:row-start-2 xl:border-r border-border-default relative">
           <div className="flex-1 overflow-hidden relative">
               <BrowserSkeleton />
           </div>
       </div>

       {/* === MOBILE DOCK (Fixed Overlay) === */}
       {/* Matches MobileDeckDock.tsx: fixed bottom-0, z-40, ~180px height for open drawer */}
       <div className="xl:hidden fixed bottom-0 left-0 right-0 h-[180px] bg-surface-deck border-t border-brand-primary/20 z-40 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
            {/* Active Header (h-6) */}
            <div className="h-6 w-full bg-brand-primary/20 border-b border-brand-primary/10 flex items-center justify-center">
                <div className="w-12 h-1 rounded-full bg-surface-hover" />
            </div>
            {/* Slots */}
            <div className="flex gap-2 p-2 h-full items-start">
                 <Skeleton className="flex-1 aspect-3/4 rounded-lg bg-surface-card" />
                 <Skeleton className="flex-1 aspect-3/4 rounded-lg bg-surface-card" />
                 <Skeleton className="flex-1 aspect-3/4 rounded-lg bg-surface-card" />
                 <Skeleton className="flex-1 aspect-3/4 rounded-lg bg-surface-card" />
                 <Skeleton className="flex-1 aspect-3/4 rounded-lg bg-surface-card" />
            </div>
       </div>

       {/* === DESKTOP RIGHT COL (Inspector + Drawer) === */}
       <div className="hidden xl:flex flex-col gap-4 h-full p-4 overflow-hidden xl:col-start-2 xl:row-start-2">
           {/* Inspector Skeleton */}
           <div className="flex-1 shrink min-h-0 max-h-full flex flex-col border border-border-default rounded-xl bg-surface-card overflow-hidden">
               <div className="h-12 border-b border-border-subtle bg-surface-card animate-pulse" /> 
               <div className="flex-1 bg-surface-card animate-pulse" /> 
           </div>

           {/* Drawer Skeleton */}
           <div className="shrink-0 h-[230px] border border-border-default rounded-xl bg-surface-card overflow-hidden">
                <div className="h-12 border-b border-border-subtle bg-surface-card animate-pulse" />
                <div className="flex-1 bg-surface-card animate-pulse" />
           </div>
       </div>
    </div>
  );
}
