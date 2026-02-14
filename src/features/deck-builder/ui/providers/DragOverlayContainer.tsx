"use client";

import { DragOverlay } from "@dnd-kit/core";
import { useDeckStore } from "@/store/index";
import { GameImage } from "@/components/ui/GameImage";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { centerUnderCursor } from "@/features/deck-builder/dnd/modifiers";
import { useShallow } from "zustand/react/shallow";

export function DragOverlayContainer() {
  // Subscribe ONLY here to activeDragItem
  const activeDragItem = useDeckStore(useShallow(state => state.activeDragItem));

  if (!activeDragItem) return null;

  return (
    <DragOverlay zIndex={100} dropAnimation={null} modifiers={[centerUnderCursor]}>
      <div className="w-[110px] aspect-3/4 rounded-lg border-2 border-brand-secondary/50 bg-slate-800 flex flex-col overflow-hidden shadow-2xl relative cursor-grabbing pointer-events-none">
         {/* Image Area */}
        <div className="relative flex-1 overflow-hidden">
          <GameImage
            src={getCardImageUrl(activeDragItem)}
            alt={activeDragItem.name || "Card Image"}
            fill
            className="object-cover object-top opacity-90"
          />
        </div>
        {/* Name Banner */}
        <div className="min-h-[24px] bg-surface-main/95 border-t border-white/10 flex items-center justify-center px-1 py-0.5 shrink-0">
           <span className="text-[10px] font-bold text-gray-200 text-center leading-tight line-clamp-2">
             {activeDragItem.name}
           </span>
        </div>
      </div>
    </DragOverlay>
  );
}
