"use client";

import { DragOverlay } from "@dnd-kit/core";
import { useDeckStore } from "@/store/index";
import { GameImage } from "@/components/ui/GameImage";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { centerUnderCursor } from "@/features/deck-builder/dnd/modifiers";
import { useShallow } from "zustand/react/shallow";
import { RankBadge } from "@/components/ui/rank-badge";
import { ENTITY_CATEGORY } from "@/services/config/constants";
import { Unit, Spellcaster } from "@/types/api";
import { Shield, Wand2, Swords, HelpCircle } from "lucide-react";

export function DragOverlayContainer() {
  // Subscribe ONLY here to activeDragItem
  const activeDragItem = useDeckStore(useShallow(state => state.activeDragItem));

  if (!activeDragItem) return null;

  return (
    <DragOverlay zIndex={100} dropAnimation={null} modifiers={[centerUnderCursor]}>
      <div className="w-[110px] aspect-3/4 rounded-lg border-2 border-brand-secondary/50 bg-surface-raised flex flex-col overflow-hidden shadow-2xl relative cursor-grabbing pointer-events-none">
         {/* Image Area */}
        <div className="relative flex-1 overflow-hidden">
          <GameImage
            src={getCardImageUrl(activeDragItem)}
            alt={activeDragItem.name || "Card Image"}
            fill
            className="object-cover object-top opacity-90"
          />
          {/* Rank Badge for Units/Titans */}
          {activeDragItem.category !== ENTITY_CATEGORY.Spellcaster && (
              <div className="absolute bottom-1 left-1 z-20">
                  <RankBadge 
                      rank={(activeDragItem as Unit).rank || ((activeDragItem.category === ENTITY_CATEGORY.Titan) ? "V" : "")} 
                      isTitan={activeDragItem.category === ENTITY_CATEGORY.Titan}
                      mode="icon"
                      className="scale-90 lg:scale-100 origin-bottom-left bg-surface-scrim backdrop-blur-sm shadow-md"
                  />
              </div>
          )}
          
          {/* Spellcaster Class Icon */}
          {activeDragItem.category === ENTITY_CATEGORY.Spellcaster && (
             <div className="absolute bottom-1 left-1 flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 rounded-full border-2 border-slate-400 bg-surface-main shadow-sm backdrop-blur-sm z-20">
                {(activeDragItem as Spellcaster).class === "Conqueror" ? (
                    <Shield size={14} className="text-status-danger-text scale-110" />
                  ) : (activeDragItem as Spellcaster).class === "Enchanter" ? (
                    <Wand2 size={14} className="text-purple-400 scale-110" />
                  ) : (activeDragItem as Spellcaster).class === "Duelist" ? (
                    <Swords size={14} className="text-amber-400 scale-110" />
                  ) : (
                    <HelpCircle size={14} className="text-text-muted scale-110" />
                  )}
             </div>
          )}
        </div>
        {/* Name Banner */}
        <div className="min-h-[24px] bg-surface-main/95 border-t border-border-default flex items-center justify-center px-1 py-0.5 shrink-0">
           <span className="text-[10px] font-bold text-text-secondary text-center leading-tight line-clamp-2">
             {activeDragItem.name}
           </span>
        </div>
      </div>
    </DragOverlay>
  );
}
