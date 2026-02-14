"use client";

import { cn } from "@/lib/utils";
import { GameImage } from "@/components/ui/GameImage";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { UnifiedEntity } from "@/types/api";
import { Deck } from "@/types/deck";

interface DeckOverviewProps {
  deck: Deck;
  className?: string;
  size?: "sm" | "lg";
  onInspect?: (item: UnifiedEntity, position: { x: number; y: number }) => void;
  onStopInspect?: () => void;
}

export function DeckOverview({ deck, className, size = "sm", onInspect, onStopInspect }: DeckOverviewProps) {
  return (
    <div className={cn("flex flex-col md:flex-row items-center gap-2 md:gap-4", className)}>
      {/* Spellcaster */}
      <VisualSlot 
        item={deck.spellcaster} 
        type="spellcaster" 
        size={size} 
        onInspect={onInspect}
        onStopInspect={onStopInspect}
      />

      {/* Separator - Horizontal on Mobile, Vertical on Desktop */}
      <div className={cn(
        "bg-white/10 mx-2",
        "w-16 h-px md:w-px md:h-16", // Default sizes
        size === "lg" && "hidden md:block md:h-32" 
      )} />

       {/* Units Container - Grid on Mobile, Row on Desktop */}
       <div className="grid grid-cols-2 gap-2 md:flex md:gap-4">
          {/* Units 0-3 */}
          {deck.slots.slice(0, 4).map((s) => (
            <VisualSlot
              key={s.index}
              item={s.unit}
              type="unit"
              isEmpty={!s.unit}
              label={`Incant. ${s.index + 1}`}
              size={size}
              onInspect={onInspect}
              onStopInspect={onStopInspect}
            />
          ))}
      </div>

      {/* Separator */}
      <div className={cn(
        "bg-white/10 mx-2",
         "w-16 h-px md:w-px md:h-16",
        size === "lg" && "hidden md:block md:h-32"
      )} />

      {/* Titan */}
      <VisualSlot
        item={deck.slots[4].unit}
        type="titan"
        isEmpty={!deck.slots[4].unit}
        label="Titan"
        size={size}
        onInspect={onInspect}
        onStopInspect={onStopInspect}
      />
    </div>
  );
}

interface VisualSlotProps {
  item?: UnifiedEntity | null;
  type: "spellcaster" | "unit" | "titan";
  isEmpty?: boolean;
  label?: string;
  size: "sm" | "lg";
  onInspect?: (item: UnifiedEntity, position: { x: number; y: number }) => void;
  onStopInspect?: () => void;
}

function VisualSlot({ item, type, isEmpty, label, size, onInspect, onStopInspect }: VisualSlotProps) {
  const isLarge = size === "lg";

  if (isEmpty || !item) {
    return (
      <div
        className={cn(
          "rounded-lg border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2 transition-all",
          type === "spellcaster"
        ? (isLarge ? "w-16 h-24 md:w-32 md:h-48 rounded-xl shadow-lg border-2 border-brand-primary" : "w-16 h-22 rounded-lg border border-white/20")
        : (isLarge ? "w-12 h-18 md:w-20 md:h-32 rounded-lg shadow-md border border-white/20" : "w-12 h-18 rounded border border-white/10")
        )}
      >
        {type === "spellcaster" && (
          <p className="text-[9px] uppercase font-bold text-gray-600 text-center px-1">
            Choose Spellcaster
          </p>
        )}
        {label && (
          <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-transparent group">
      <div
        className={cn(
          "relative rounded-lg overflow-hidden border border-white/10 bg-gray-900 group shadow-lg transition-transform duration-300",
          isLarge && "hover:scale-105 hover:z-10 hover:shadow-brand-primary/20",
          type === "spellcaster"
            ? (isLarge ? "w-24 h-36 md:w-32 md:h-48 border-brand-primary ring-2 ring-brand-primary/20" : "w-16 h-22 md:w-20 md:h-28 border-brand-primary shadow-brand-primary/20")
            : (isLarge ? "w-16 h-24 md:w-20 md:h-32" : "w-12 h-18 md:w-16 md:h-24")
        )}
        onMouseEnter={(e) => {
            if (onInspect && item) {
                const rect = e.currentTarget.getBoundingClientRect();
                onInspect(item, { x: rect.right + 10, y: rect.top });
            }
        }}
        onMouseLeave={() => {
            if (onStopInspect) onStopInspect();
        }}
        onClick={(e) => {
            if (onInspect && item) {
                const rect = e.currentTarget.getBoundingClientRect();
                onInspect(item, { x: rect.right + 10, y: rect.top });
            }
        }}
      >
        <GameImage
          src={getCardImageUrl(item)}
          alt={item.name}
          fill
          className="object-cover object-top"
        />

        {/* Badges */}
        {item.category === "Titan" && (
          <div className="absolute top-1 left-1 bg-black/60 px-1 py-0.5 rounded text-[8px] font-mono text-brand-accent backdrop-blur-sm">
            TITAN
          </div>
        )}
        {"rank" in item && item.rank && (
          <div className="absolute top-1 left-1 bg-black/60 px-1 py-0.5 rounded text-[8px] font-mono text-brand-accent backdrop-blur-sm">
            {item.rank}
          </div>
        )}

        {/* Name */}
        <div className="absolute bottom-0 inset-x-0 bg-surface-main/90 border-t border-white/10 py-1 px-0.5">
          <p className="text-[9px] font-bold text-center text-gray-200 truncate leading-tight">
            {item.name}
          </p>
        </div>
      </div>
    </div>
  );
}
