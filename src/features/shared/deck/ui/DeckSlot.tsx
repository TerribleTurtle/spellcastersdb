import { useDndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { Shield } from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { RankBadge } from "@/components/ui/rank-badge";
import { cn } from "@/lib/utils";
import { getCardAltText, getCardImageUrl } from "@/services/assets/asset-helpers";
import { ENTITY_CATEGORY } from "@/services/config/constants";
import { Spell, Titan, UnifiedEntity, Unit } from "@/types/api";
import { type DeckSlot, SlotType } from "@/types/deck";
import { DragData, DraggableEntity, DropData } from "@/types/dnd";

interface DeckSlotProps {
  slot: DeckSlot;
  allSlots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  onSelect?: (item: UnifiedEntity | undefined, pos?: { x: number; y: number }) => void;
  deckId?: string; // Context ID for Team Mode
  idSuffix?: string; // To prevent ID collisions (e.g. mobile vs desktop)
}

export function DeckSlot({
  slot,
  allSlots,
  onSelect,
  deckId,
  idSuffix,
}: DeckSlotProps) {
  // ID format: slot-{deckId}-{index} OR slot-{index} (fallback)
  const baseId = deckId ? `slot-${deckId}-${slot.index}` : `slot-${slot.index}`;
  const droppableId = idSuffix ? `${baseId}-${idSuffix}` : baseId;

  const baseDragId = deckId
    ? `slot-drag-${deckId}-${slot.index}`
    : `slot-drag-${slot.index}`;
  const draggableId = idSuffix ? `${baseDragId}-${idSuffix}` : baseDragId;

  const dropData: DropData = {
    type: "DECK_SLOT",
    slotIndex: slot.index,
    deckId,
    accepts: slot.allowedTypes,
  };

  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    data: dropData,
  });

  // Debug Mount removed

  const dragData: DragData = {
    type: "DECK_SLOT",
    item: slot.unit as DraggableEntity,
    sourceDeckId: deckId,
    sourceSlotIndex: slot.index,
  };

  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: draggableId,
    data: dragData,
    disabled: !slot.unit,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: isDragging ? 0 : 1, // Hide original when dragging (overlay is shown)
      }
    : undefined;

  const isTitanSlot = slot.allowedTypes.includes(SlotType.Titan);

  // Determine if this Slot is valid for the current Drag
  let isValidTarget = false;

  const { active } = useDndContext();
  const currentDrag = active?.data.current as DragData | undefined;

  if (currentDrag && currentDrag.item) {
    // Check if it's a Spellcaster (Invalid for Deck Slots)
    const item = currentDrag.item as UnifiedEntity;

    if (
      "spellcaster_id" in item ||
      item.category === ENTITY_CATEGORY.Spellcaster
    ) {
      isValidTarget = false;
    } else {
      // Unit/Spell/Titan
      const unitItem = item as Unit | Spell | Titan;
      const isTitan = unitItem.category === ENTITY_CATEGORY.Titan;
      const typeMatches = isTitanSlot ? isTitan : !isTitan;

      // Singleton Rule
      const isInternalMove =
        currentDrag.type === "DECK_SLOT" && currentDrag.sourceDeckId === deckId;

      // If dragging from browser or another deck, check for duplicates in this deck
      // Note: If dragging from slot 1 to slot 2 in same deck, we don't count slot 1 as a duplicate source.
      const isDuplicate =
        !isInternalMove &&
        slot.index < 4 &&
        allSlots.some(
          (s, i) =>
            i < 4 &&
            i !== slot.index &&
            s.unit?.entity_id === unitItem.entity_id
        );

      isValidTarget = typeMatches && !isDuplicate;
    }
  }

  return (
    <div
      ref={setNodeRef}
      data-testid={`deck-slot-${slot.index}`}
      className={cn(
        "relative group aspect-3/4 rounded-lg border-2 transition-all flex flex-col items-center justify-center w-full z-50",
        "md:w-full md:max-w-[140px]",
        // Valid drop target
        isValidTarget &&
          !isOver &&
          "border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.6),0_0_40px_rgba(251,191,36,0.3)] animate-pulse",
        // Active hover
        isOver &&
          isValidTarget &&
          "border-brand-primary bg-brand-primary/10 scale-105",
        // Invalid Hover
        isOver && !isValidTarget && "border-red-500/50 bg-red-500/10",
        // Default
        !isValidTarget &&
          !isOver &&
          "border-white/10 bg-surface-card md:hover:border-brand-primary/40 md:hover:shadow-lg md:hover:shadow-brand-primary/10",
        isTitanSlot &&
          !isValidTarget &&
          !isOver &&
          "border-brand-accent/30 bg-brand-accent/5",
        slot.unit && "border-brand-secondary/50",
        isDragging && "opacity-50"
      )}
      onClick={(e) => {
        if (!isDragging && onSelect) {
          e.stopPropagation();
          onSelect(slot.unit || undefined, { x: e.clientX, y: e.clientY });
        }
      }}
    >
      {/* Draggable Wrapper */}
      {slot.unit && (
        <div
          ref={setDragNodeRef}
          {...listeners}
          {...attributes}
          style={style}
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-none"
        ></div>
      )}

      {/* Label for Empty Slot */}
      {!slot.unit && (
        <div className="text-center opacity-70 group-hover:opacity-100 transition-opacity text-gray-200">
          <div className="mb-2 flex justify-center">
            {isTitanSlot ? (
              <Shield size={24} />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-current border-dashed opacity-50" />
            )}
          </div>
          <span className="text-[9px] md:text-xs font-bold uppercase tracking-wide md:tracking-widest">
            {isTitanSlot ? "Titan" : `Incant. ${slot.index + 1}`}
          </span>
        </div>
      )}

      {/* Filled State */}
      {slot.unit && (
        <div
          className={cn(
            "flex flex-col w-full h-full overflow-hidden rounded text-left pointer-events-none",
            isDragging && "opacity-0"
          )}
        >
          {/* Image Area */}
          <div className="relative flex-1 bg-slate-800 overflow-hidden">
            <GameImage
              src={getCardImageUrl(slot.unit)}
              alt={getCardAltText(slot.unit)}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-top"
            />
            {/* Rank/Titan Badge */}
            {(slot.unit.rank ||
              slot.unit.category === ENTITY_CATEGORY.Titan) && (
              <div className="absolute bottom-1 left-1 z-20">
                <RankBadge
                  rank={
                    slot.unit.category === ENTITY_CATEGORY.Titan
                      ? "V"
                      : slot.unit.rank!
                  }
                  isTitan={slot.unit.category === ENTITY_CATEGORY.Titan}
                  mode="icon"
                  className="scale-75 lg:scale-100 origin-bottom-left bg-black/60 backdrop-blur-sm shadow-md"
                />
              </div>
            )}
          </div>
          {/* Name Banner */}
          <div className="min-h-[24px] bg-surface-main/95 border-t border-white/10 flex items-center justify-center px-1 py-0.5 z-10 shrink-0">
            <span className="text-[10px] font-bold text-gray-200 text-center leading-tight line-clamp-2 wrap-break-word w-full">
              {slot.unit.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
