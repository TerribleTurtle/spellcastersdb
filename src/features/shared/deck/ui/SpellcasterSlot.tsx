import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { Sparkles } from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { cn } from "@/lib/utils";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { UnifiedEntity, Spellcaster } from "@/types/api";
import { DragData, DropData, DraggableEntity } from "@/types/dnd";
import { ENTITY_CATEGORY } from "@/services/config/constants";


interface SpellcasterSlotProps {
  spellcaster: Spellcaster | null;
  onSelect?: (item: UnifiedEntity, pos?: {x:number, y:number}) => void;
  deckId?: string; // Context ID for Team Mode
  idSuffix?: string;
}

export function SpellcasterSlot({
  spellcaster,
  onSelect,
  deckId,
  idSuffix,
}: SpellcasterSlotProps) {
  const baseZoneId = deckId ? `spellcaster-zone-${deckId}` : "spellcaster-zone";
  const zoneId = idSuffix ? `${baseZoneId}-${idSuffix}` : baseZoneId;
  
  const baseDragId = deckId ? `spellcaster-slot-drag-${deckId}` : "spellcaster-slot-drag";
  const dragId = idSuffix ? `${baseDragId}-${idSuffix}` : baseDragId;

  const dropData: DropData = { 
      type: "SPELLCASTER_SLOT", 
      deckId 
  };

  const { isOver, setNodeRef } = useDroppable({
    id: zoneId,
    data: dropData,
  });

  const dragData: DragData = { 
      type: "SPELLCASTER_SLOT", 
      item: spellcaster as DraggableEntity,
      sourceDeckId: deckId 
  };

  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: dragId,
    data: dragData,
    disabled: !spellcaster,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: isDragging ? 0 : 1,
      }
    : undefined;

  // Valid target check using DND Context
  let isValidTarget = false;
  const { active } = useDndContext();
  const currentDrag = active?.data.current as DragData | undefined;

  if (currentDrag && currentDrag.item) {
     const item = currentDrag.item as UnifiedEntity;
     // Must be Spellcaster type
     if ("spellcaster_id" in item || item.category === ENTITY_CATEGORY.Spellcaster) {
         isValidTarget = true;
     }
  }


  return (
    <div
      ref={setNodeRef}
      data-testid="spellcaster-slot"
      className={cn(
        "relative group aspect-3/4 rounded-lg border-2 transition-all flex flex-col items-center justify-center shadow-lg w-full",
        "md:w-full md:max-w-[160px]",
        // Valid drop target
        isValidTarget && !isOver && "border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.6),0_0_40px_rgba(251,191,36,0.3)] animate-pulse",
        // Active hover
        isOver && isValidTarget && "border-brand-primary bg-brand-primary/10 scale-105 shadow-brand-primary/20",
        // Default
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
             e.stopPropagation(); // Stop propagation to prevent accidental clicks passing through
             if (onSelect) onSelect(spellcaster, { x: e.clientX, y: e.clientY });
          }}
        />
      )}
      {!spellcaster && (
        <div className="text-center opacity-80 text-brand-primary group-hover:opacity-100 transition-opacity">
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
            <span className="text-[11px] font-bold text-white text-center leading-tight line-clamp-2 wrap-break-word w-full shadow-black drop-shadow-md">
              {spellcaster.name}
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
