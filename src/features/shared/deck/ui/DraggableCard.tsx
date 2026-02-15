import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Plus, Shield, Wand2, Swords, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { OptimizedCardImage } from "@/features/deck-builder/browser/OptimizedCardImage";
import { cn } from "@/lib/utils";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { Spellcaster, Unit } from "@/types/api";

import { BrowserItem } from "@/types/browser";
import { DragData } from "@/types/dnd";

interface DraggableCardProps {
  item: BrowserItem;
  onClick: (item: BrowserItem, pos?: { x: number; y: number }) => void;
  onQuickAdd: (item: BrowserItem) => void;
  priority?: boolean;
}

export const DraggableCard = React.memo(function DraggableCard({
  item,
  onClick,
  onQuickAdd,
  priority = false,
}: DraggableCardProps) {
  const id = item.entity_id;
  const isSpellcaster = item.category === "Spellcaster";
  // Casting to Unit for rank acccess is safe because Spells/Titans either have Rank or we check category
  const rank = !isSpellcaster && "rank" in item ? (item as Unit).rank : null;
  const isTitan = !isSpellcaster && item.category === "Titan";
  const spellcasterClass = isSpellcaster ? (item as Spellcaster).class : null;

  const draggableData = useMemo<DragData>(() => ({ 
      type: "BROWSER_CARD",
      item,
      previewUrl: getCardImageUrl(item)
  }), [item]);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `browser-${id}`,
    data: draggableData,
  });

  const CLICK_DELAY_MS = 120;

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling details
    if (isDragging) return;

    // Clear any existing timeout
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    // Set new timeout for single click
    clickTimeoutRef.current = setTimeout(() => {
      onClick(item, { x: e.clientX, y: e.clientY });
      clickTimeoutRef.current = null;
    }, CLICK_DELAY_MS);
  }, [isDragging, onClick, item]);

  const handleQuickAdd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent default double-click selection
    
    // If a double click happens, clear the pending single click action immediately
    if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
    }
    
    onQuickAdd(item);
  }, [onQuickAdd, item]);

  return (
    <div
      ref={setNodeRef}
      data-testid={`browser-item-${item.entity_id}`}
      {...listeners}
      {...attributes}
      onClick={handleClick}
        onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Keyboard nav: center inspector (undefined pos)
          // Since handleClick expects React.MouseEvent, we call onClick directly
          if (!isDragging) onClick(item); 
        }
      }}
      onDoubleClick={handleQuickAdd}
      onContextMenu={(e) => e.preventDefault()}
      role="button"
      tabIndex={0}
      className={cn(
        "relative group cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 select-none",
        "aspect-4/5 rounded-lg overflow-hidden border border-white/10 bg-surface-card", // More compact aspect ratio
        "hover:border-brand-primary/50 transition-all hover:scale-105",
        // Actually, we want the bottom bar to be part of the card visuals.
        isDragging && "opacity-50",
        isSpellcaster &&
          "border-brand-accent/30 shadow-[0_0_10px_rgba(255,255,255,0.05)]",
          "will-change-transform",
          // Fix touch action to allow scrolling but also dragging
          "touch-manipulation"
      )}
    >
      {/* Image Area - Touch action allowed to enable scrolling */}
      <div className="relative flex-1 overflow-hidden bg-gray-800 pointer-events-none">
        <OptimizedCardImage
          src={getCardImageUrl(item)}
          alt={item.name}
          loading={priority ? "eager" : "lazy"}
          className="w-full h-full object-cover object-top transition-transform group-hover:scale-110"
        />
        
        {/* Quick Add Badge - Top Left */}
        <div 
            className="absolute top-1 left-1 bg-black/80 p-1 rounded text-brand-accent shadow-md border border-white/10 hover:bg-brand-primary hover:text-white transition-colors z-20 pointer-events-auto"
            onClick={handleQuickAdd}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            role="button"
            aria-label="Quick Add"
        >
            <Plus className="w-3.5 h-3.5 lg:w-5 lg:h-5 2xl:w-6 2xl:h-6" strokeWidth={4} />
        </div>

        {/* Rank Badge - Overlaid on Image */}
        {rank && !isTitan && (
          <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded text-[10px] lg:text-xs 2xl:text-sm font-mono text-brand-accent shadow-md border border-white/10">
            {rank}
          </div>
        )}
        {/* Titan Badge */}
        {isTitan && (
          <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded text-[10px] lg:text-xs 2xl:text-sm font-mono text-brand-accent shadow-md border border-white/10">
            TITAN
          </div>
        )}
        {/* Spellcaster Class Badge - Icon + Tooltip */}
        {spellcasterClass && (
           <Tooltip>
             <TooltipTrigger asChild>
                <div 
                  className="absolute top-1 right-1 bg-black/80 p-1.5 rounded-full border border-white/10 shadow-md transition-colors hover:border-brand-primary/50 hover:bg-black/90 cursor-help z-20 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {spellcasterClass === "Conqueror" ? (
                    <Shield size={14} className="text-red-400" />
                  ) : spellcasterClass === "Enchanter" ? (
                    <Wand2 size={14} className="text-purple-400" />
                  ) : spellcasterClass === "Duelist" ? (
                    <Swords size={14} className="text-yellow-400" />
                  ) : (
                    <HelpCircle size={14} className="text-gray-400" />
                  )}
                </div>
             </TooltipTrigger>
             <TooltipContent side="bottom" className="z-50 bg-black/90 border-brand-primary/30 text-brand-primary font-bold uppercase tracking-wider text-xs">
               <p>{spellcasterClass}</p>
             </TooltipContent>
           </Tooltip>
        )}

      </div>

      {/* Name Banner / Quick Add Button - Integrated */}
      <div 
        className="absolute bottom-0 inset-x-0 min-h-[32px] lg:min-h-[40px] bg-black/90 border-t border-white/10 flex items-center justify-center px-1 py-1 z-10 transition-colors pointer-events-none"
      >
        <div className="w-full flex justify-center px-1">
          <span className="text-[10px] lg:text-xs 2xl:text-sm font-bold text-gray-200 text-center leading-tight line-clamp-2 uppercase tracking-tight wrap-break-word">
            {item.name}
          </span>
        </div>
      </div>
    </div>
  );
});
