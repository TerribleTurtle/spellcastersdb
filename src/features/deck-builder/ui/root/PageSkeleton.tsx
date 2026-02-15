"use client";

import { BrowserSkeleton } from "@/features/deck-builder/browser/BrowserSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="flex flex-col h-full w-full bg-surface-main overflow-hidden xl:grid xl:grid-cols-[1fr_640px] xl:grid-rows-[auto_1fr]">
       
       {/* DESKTOP HEADER SKELETON (Matches SoloEditorLayout Header) */}
       <div className="hidden xl:flex h-14 border-b border-white/10 items-center justify-between px-4 shrink-0 bg-surface-main xl:col-span-2 gap-4">
           {/* Deck Name Input Skeleton */}
           <Skeleton className="h-8 w-64 bg-white/5 rounded" />
           {/* Toolbar Skeleton */}
           <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 bg-white/5 rounded" />
                <Skeleton className="h-8 w-8 bg-white/5 rounded" />
                <Skeleton className="h-8 w-24 bg-white/5 rounded" />
           </div>
       </div>

       {/* LEFT COLUMN (Browser) */}
       <div className="flex flex-col h-full w-full overflow-hidden xl:col-start-1 xl:row-start-2 xl:border-r border-white/10 relative">
           {/* Mobile Top Bar Skeleton (Matches MobileHeader.tsx) */}
           <div className="h-14 border-b border-white/10 flex items-center px-4 gap-2 shrink-0 bg-surface-main xl:hidden">
               <Skeleton className="h-8 w-24 bg-white/5 rounded" />
               <Skeleton className="h-8 w-8 ml-auto bg-white/5 rounded" />
           </div>
           
           <div className="flex-1 overflow-hidden relative">
               <BrowserSkeleton />
           </div>
           
           {/* Mobile Footer Dock */}
           <div className="h-16 border-t border-white/10 bg-surface-main shrink-0 xl:hidden flex items-center justify-around px-4">
              <Skeleton className="h-10 w-10 bg-white/5 rounded" />
              <Skeleton className="h-10 w-10 bg-white/5 rounded" />
              <Skeleton className="h-10 w-10 bg-white/5 rounded" />
              <Skeleton className="h-10 w-10 bg-white/5 rounded" />
           </div>
       </div>

       {/* RIGHT COLUMN (Desktop Only - Inspector + Drawer) */}
       <div className="hidden xl:flex flex-col gap-4 h-full p-4 overflow-hidden xl:col-start-2 xl:row-start-2">
           {/* Inspector Skeleton */}
           <div className="flex-initial shrink min-h-0 max-h-full flex flex-col border border-white/10 rounded-xl bg-surface-card overflow-hidden">
               <div className="h-12 border-b border-white/5 bg-white/5 animate-pulse" /> 
               <div className="flex-1 bg-white/5 animate-pulse" /> 
           </div>

           {/* Drawer Skeleton */}
           <div className="shrink-0 h-48 border border-white/10 rounded-xl bg-surface-card overflow-hidden">
                <div className="h-12 border-b border-white/5 bg-white/5 animate-pulse" />
                <div className="flex-1 bg-white/5 animate-pulse" />
           </div>
       </div>
    </div>
  );
}
