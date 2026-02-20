import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { useDraggable } from "@dnd-kit/core";
import { HelpCircle, Plus, Shield, Swords, Wand2 } from "lucide-react";

import { RankBadge } from "@/components/ui/rank-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OptimizedCardImage } from "@/features/deck-builder/browser/OptimizedCardImage";
import { cn } from "@/lib/utils";
import {
  getCardAltText,
  getCardImageUrl,
} from "@/services/assets/asset-helpers";
import { CLASS_STYLES } from "@/services/config/rank-class-styles";
import { DECK_THEMES, DeckThemeIndex } from "@/services/config/theme-constants";
import { Spellcaster, Unit } from "@/types/api";
import { BrowserItem } from "@/types/browser";
import { DragData } from "@/types/dnd";

interface DraggableCardProps {
  item: BrowserItem;
  onClick: (item: BrowserItem, pos?: { x: number; y: number }) => void;
  onQuickAdd: (item: BrowserItem) => void;
  priority?: boolean;
  isDimmed?: boolean;
  otherDeckIndices?: number[];
}

export const DraggableCard = React.memo(function DraggableCard({
  item,
  onClick,
  onQuickAdd,
  priority = false,
  isDimmed = false,
  otherDeckIndices,
}: DraggableCardProps) {
  const id = item.entity_id;
  const isSpellcaster = item.category === "Spellcaster";
  // Casting to Unit for rank acccess is safe because Spells/Titans either have Rank or we check category
  const rank = !isSpellcaster && "rank" in item ? (item as Unit).rank : null;
  const isTitan = !isSpellcaster && item.category === "Titan";
  const spellcasterClass = isSpellcaster ? (item as Spellcaster).class : null;

  const draggableData = useMemo<DragData>(
    () => ({
      type: "BROWSER_CARD",
      item,
      previewUrl: getCardImageUrl(item),
    }),
    [item]
  );

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

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent bubbling details
      if (isDragging) return;

      // Clear any existing timeout
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

      // Set new timeout for single click
      clickTimeoutRef.current = setTimeout(() => {
        onClick(item, { x: e.clientX, y: e.clientY });
        clickTimeoutRef.current = null;
      }, CLICK_DELAY_MS);
    },
    [isDragging, onClick, item]
  );

  const handleQuickAdd = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      e.preventDefault(); // Prevent default double-click selection

      // If a double click happens, clear the pending single click action immediately
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      onQuickAdd(item);
    },
    [onQuickAdd, item]
  );

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
        "aspect-3/4 rounded-lg overflow-hidden border border-border-default bg-surface-card",
        "hover:border-brand-primary/50 transition-[border-color,transform] hover:scale-105",
        // Actually, we want the bottom bar to be part of the card visuals.
        isDragging && "opacity-50",
        isDimmed && "opacity-40 grayscale",
        isSpellcaster &&
          "border-brand-accent/30 shadow-[0_0_10px_rgba(255,255,255,0.05)]",
        "will-change-transform",
        // Fix touch action to allow scrolling but also dragging
        "touch-manipulation"
      )}
    >
      {/* Image Area - Touch action allowed to enable scrolling */}
      <div className="relative flex-1 overflow-hidden bg-surface-raised pointer-events-none">
        <OptimizedCardImage
          src={getCardImageUrl(item)}
          alt={getCardAltText(item)}
          priority={priority}
          className="w-full h-full object-cover object-top transition-transform group-hover:scale-110"
        />

        {/* Quick Add Badge - Top Left */}
        <div
          className="absolute top-1 left-1 bg-surface-overlay p-1 rounded text-brand-accent shadow-md border border-border-default hover:bg-brand-primary hover:text-text-primary transition-colors z-20 pointer-events-auto"
          onClick={handleQuickAdd}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          role="button"
          aria-label="Quick Add"
        >
          <Plus
            className="w-4 h-4 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5"
            strokeWidth={3}
          />
        </div>

        {/* Rank Badge - Overlaid on Image */}
        {(rank || isTitan) && (
          <div className="absolute bottom-9 lg:bottom-12 left-1 z-20">
            <RankBadge
              rank={isTitan ? "V" : rank!}
              isTitan={isTitan}
              mode="icon"
              className={
                isTitan
                  ? "scale-100 lg:scale-125 origin-bottom-left"
                  : "scale-100 lg:scale-125 origin-bottom-left"
              }
            />
          </div>
        )}
        {/* Spellcaster Class Badge - Icon + Tooltip */}
        {spellcasterClass && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "absolute bottom-9 lg:bottom-12 left-1 flex items-center justify-center w-6 h-6 rounded-full border-2 shadow-sm transition-colors cursor-help z-20 pointer-events-auto scale-100 lg:scale-125 origin-bottom-left",
                  // Apply colors from config manually or use inline styles if needed, but here we can map
                  // Apply colors from config manually or use inline styles if needed, but here we can map
                  spellcasterClass && CLASS_STYLES[spellcasterClass]
                    ? cn(
                        CLASS_STYLES[spellcasterClass].bg,
                        CLASS_STYLES[spellcasterClass].border
                      )
                    : "bg-surface-main border-slate-400"
                )}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {spellcasterClass === "Conqueror" ? (
                  <Shield
                    size={14}
                    className="text-status-danger-text scale-110"
                  />
                ) : spellcasterClass === "Enchanter" ? (
                  <Wand2 size={14} className="text-purple-400 scale-110" />
                ) : spellcasterClass === "Duelist" ? (
                  <Swords size={14} className="text-amber-400 scale-110" />
                ) : (
                  <HelpCircle size={14} className="text-text-muted scale-110" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="z-50 bg-surface-overlay-heavy border-brand-primary/30 text-brand-primary font-bold uppercase tracking-wider text-xs"
            >
              <p>{spellcasterClass}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Deck Usage Badges (Team Mode) */}
        {otherDeckIndices && otherDeckIndices.length > 0 && (
          <div className="absolute bottom-9 lg:bottom-11 right-1 flex flex-col items-end gap-1 pointer-events-none z-20 scale-75 origin-bottom-right md:scale-100">
            {otherDeckIndices.map((deckIndex) => {
              // Safe lookup for theme, fallback to default if index out of bounds (shouldn't happen in normal team flow)
              const theme = DECK_THEMES[deckIndex as DeckThemeIndex];
              if (!theme) return null;

              return (
                <div
                  key={deckIndex}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm backdrop-blur-sm border",
                    theme.badge
                  )}
                >
                  {theme.textData}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Name Banner / Quick Add Button - Integrated */}
      <div className="absolute bottom-0 inset-x-0 min-h-[32px] lg:min-h-[40px] bg-surface-overlay-heavy border-t border-border-default flex items-center justify-center px-1 py-1 z-10 transition-colors pointer-events-none">
        <div className="w-full flex justify-center px-1">
          <span className="text-[10px] lg:text-xs 2xl:text-sm font-bold text-text-secondary text-center leading-tight line-clamp-2 uppercase tracking-tight wrap-break-word">
            {item.name}
          </span>
        </div>
      </div>
    </div>
  );
});
