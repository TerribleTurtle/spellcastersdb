import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Sparkles } from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { cn } from "@/lib/utils";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { UnifiedEntity, Spellcaster } from "@/types/api";


interface SpellcasterSlotProps {
  spellcaster: Spellcaster | null;
  draggedItem?: UnifiedEntity | null;
  onSelect?: (item: UnifiedEntity, pos?: {x:number, y:number}) => void;
  deckId?: string; // NEW
}

export function SpellcasterSlot({
  spellcaster,
  draggedItem,
  onSelect,
  deckId,
}: SpellcasterSlotProps) {
  const zoneId = deckId ? `spellcaster-zone-${deckId}` : "spellcaster-zone";
  const dragId = deckId ? `spellcaster-slot-drag-${deckId}` : "spellcaster-slot-drag";

  const { isOver, setNodeRef } = useDroppable({
    id: zoneId,
    data: { type: "spellcaster", deckId },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: dragId,
    data: { type: "spellcaster-slot", spellcaster, deckId },
    disabled: !spellcaster,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: isDragging ? 0 : 1,
      }
    : undefined;

  // Valid target if dragging a Spellcaster
  const isValidTarget = draggedItem && "spellcaster_id" in draggedItem;



  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        if (spellcaster && onSelect) {
          onSelect(spellcaster, { x: e.clientX, y: e.clientY });
        }
      }}
      className={cn(
        "relative group aspect-3/4 rounded-lg border-2 transition-all flex flex-col items-center justify-center shadow-lg w-full",
        "md:w-full md:max-w-[160px]",
        // Valid drop target (not hovering yet)
        isValidTarget &&
          !isOver &&
          "border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.6),0_0_40px_rgba(251,191,36,0.3)] animate-pulse",
        // Active hover state (brightest)
        isOver &&
          "border-brand-primary bg-brand-primary/10 scale-105 shadow-brand-primary/20",
        // Default states
        !isValidTarget && !isOver && "border-brand-primary/30 bg-surface-card md:hover:border-brand-primary/60 md:hover:shadow-lg md:hover:shadow-brand-primary/10",
        spellcaster && "border-brand-primary",
        isDragging && "opacity-50"
      )}
    >
      {/* Draggable Wrapper */}
      {spellcaster && (
        <div
          ref={setDragNodeRef}
          {...listeners}
          {...attributes}
          style={style}
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => {
            if (onSelect) onSelect(spellcaster, { x: e.clientX, y: e.clientY });
          }}
        />
      )}
      {!spellcaster && (
        <div className="text-center opacity-30 text-brand-primary">
          <div className="mb-2 flex justify-center">
            <Sparkles size={28} />
          </div>
          <span className="text-[9px] md:text-[9px] lg:text-xs font-bold uppercase tracking-tighter md:tracking-tight lg:tracking-wider">
            Spellcaster
          </span>
        </div>
      )}

      {spellcaster && (
        <div
          className={cn(
            "flex flex-col w-full h-full overflow-hidden rounded text-left pointer-events-none",
            isDragging && "opacity-0"
          )}
        >
          {/* Image Area */}
          <div className="relative flex-1 bg-slate-800 overflow-hidden">
            <GameImage
              src={getCardImageUrl(spellcaster)}
              alt={spellcaster.name || "Spellcaster Image"}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-top"
            />
            {/* Spellcaster Class Badge */}
            <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm uppercase">
              {spellcaster.class}
            </div>
          </div>
          {/* Name Banner */}
          <div className="min-h-[28px] bg-brand-primary/20 backdrop-blur-sm border-t border-brand-primary/30 flex items-center justify-center px-1 py-0.5 z-10 shrink-0">
            <span className="text-[11px] font-bold text-white text-center leading-tight line-clamp-2 break-words w-full shadow-black drop-shadow-md">
              {spellcaster.name}
            </span>
          </div>

          {/* Remove Action */}
        </div>
      )}
    </div>
  );
}
