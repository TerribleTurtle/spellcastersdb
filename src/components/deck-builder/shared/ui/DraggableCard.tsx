import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { OptimizedCardImage } from "../../features/browser/OptimizedCardImage";
import { cn } from "@/lib/utils";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { Spellcaster, Unit } from "@/types/api";

import { BrowserItem } from "@/types/browser";

interface DraggableCardProps {
  item: BrowserItem;
  onClick: (item: BrowserItem, pos?: { x: number; y: number }) => void;
  onQuickAdd: (item: BrowserItem) => void;
}

export const DraggableCard = React.memo(function DraggableCard({
  item,
  onClick,
  onQuickAdd,
}: DraggableCardProps) {
  const id = item.entity_id;
  const isSpellcaster = !("entity_id" in item);
  // Casting to Unit for rank acccess is safe because Spells/Titans either have Rank or we check category
  const rank = !isSpellcaster && "rank" in item ? (item as Unit).rank : null;
  const isTitan = !isSpellcaster && item.category === "Titan";
  const spellcasterClass = isSpellcaster ? (item as Spellcaster).class : null;



  const draggableData = useMemo(() => ({ item }), [item]);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `browser-${id}`,
    data: draggableData,
  });

  const CLICK_DELAY_MS = 175;

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
    
    // If a double click happens, clear the pending single click action
    if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
    }
    
    onQuickAdd(item);
  }, [onQuickAdd, item]);

  return (
    <div
      ref={setNodeRef}
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
      role="button"
      tabIndex={0}
      className={cn(
        "relative group cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
        "aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-surface-card", // More compact aspect ratio
        "hover:border-brand-primary/50 transition-all hover:scale-105",
        // Actually, we want the bottom bar to be part of the card visuals.
        "opacity-100", // Reset default
        isDragging && "opacity-50",
        isSpellcaster &&
          "border-brand-accent/30 shadow-[0_0_10px_rgba(255,255,255,0.05)]",
          "will-change-transform"
      )}
    >
      {/* Image Area - Touch action allowed to enable scrolling */}
      <div className="relative flex-1 overflow-hidden bg-gray-800">
        <OptimizedCardImage
          src={getCardImageUrl(item)}
          alt={item.name}
          className="w-full h-full object-cover object-top transition-transform group-hover:scale-110"
        />
        {/* Rank Badge - Overlaid on Image */}
        {rank && !isTitan && (
          <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent shadow-md border border-white/10">
            {rank}
          </div>
        )}
        {/* Titan Badge */}
        {isTitan && (
          <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent shadow-md border border-white/10">
            TITAN
          </div>
        )}
        {/* Spellcaster Class Badge */}
        {spellcasterClass && (
          <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent shadow-md border border-white/10 uppercase">
            {spellcasterClass}
          </div>
        )}

      </div>

      {/* Name Banner / Quick Add Button - Integrated */}
      <div 
        className="absolute bottom-0 inset-x-0 min-h-[32px] bg-black/90 border-t border-white/10 flex items-center justify-center px-1 py-1 z-10 cursor-pointer transition-colors hover:bg-brand-primary/90"
        onClick={handleQuickAdd}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 w-full justify-center">
          <Plus size={12} className="text-brand-accent shrink-0" strokeWidth={4} />
          <span className="text-[10px] font-bold text-gray-200 text-center leading-tight line-clamp-2 uppercase tracking-tight break-words">
            {item.name}
          </span>
        </div>
      </div>
    </div>
  );
});
