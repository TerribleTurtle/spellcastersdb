import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { Shield } from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { cn } from "@/lib/utils";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { UnifiedEntity, Unit, Spell, Spellcaster, Titan } from "@/types/api";
import { ENTITY_CATEGORY } from "@/services/config/constants";
import { type DeckSlot, SlotType } from "@/types/deck";


interface DeckSlotProps {
  slot: DeckSlot;
  draggedItem?: UnifiedEntity | null;
  allSlots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  onSelect?: (item: UnifiedEntity, pos?: {x:number, y:number}) => void;
  deckId?: string; // NEW: Context ID for Team Mode
}

export function DeckSlot({
  slot,
  draggedItem,
  allSlots,
  onSelect,
  deckId,
}: DeckSlotProps) {
  // ID format: slot-{deckId}-{index} OR slot-{index} (fallback)
  const droppableId = deckId ? `slot-${deckId}-${slot.index}` : `slot-${slot.index}`;
  const draggableId = deckId ? `slot-drag-${deckId}-${slot.index}` : `slot-drag-${slot.index}`;

  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    data: { index: slot.index, allowedTypes: slot.allowedTypes, deckId },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: draggableId,
    data: { type: "slot", index: slot.index, unit: slot.unit, deckId },
    disabled: !slot.unit, // CRITICAL: Only draggable if populated
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: isDragging ? 0 : 1, // Hide original when dragging (overlay is shown)
      }
    : undefined;

  const isTitanSlot = slot.allowedTypes.includes(SlotType.Titan);

  // Determine if this slot is a valid target for the currently dragged item
  let isValidTarget = false;
  
  // Access global DND context to check source of drag
  const { active } = useDndContext();

  if (draggedItem && "entity_id" in draggedItem) {
    // Spellcasters ALSO have entity_id in V2, so we must explicitly exclude them
    const item = draggedItem as Unit | Spell | Titan | Spellcaster;
    
    if (item.category === ENTITY_CATEGORY.Spellcaster) {
        isValidTarget = false;
    } else {
        // It's a Unit/Spell/Titan
        const draggedUnit = draggedItem as Unit | Spell | Titan;
        const isTitan = draggedUnit.category === ENTITY_CATEGORY.Titan;

        // Check type compatibility
        const typeMatches = isTitanSlot ? isTitan : !isTitan;

        // Check singleton rule: can't drop in a slot that already has this unit (for slots 0-3)
        // EXCEPTION: If we are simply moving the unit within the same deck, it's not a duplicate "add", it's a move.
        
        const activeData = active?.data.current;
        const isInternalMove = activeData?.type === "slot" && 
                               (activeData?.deckId === deckId);
        
        // If moving internally, we ignore the unit's current existence (it's the one we're moving)
        // If external (library/other deck), we must enforce singleton.
        const isDuplicate =
          !isInternalMove && // Only check duplicates for external adds
          slot.index < 4 &&
          allSlots.some(
            (s, i) =>
              i < 4 &&
              i !== slot.index &&
              s.unit?.entity_id === draggedUnit.entity_id
          );

        isValidTarget = typeMatches && !isDuplicate;
    }
  } else if (draggedItem && "spellcaster_id" in draggedItem) {
      // Legacy check or explicit spellcaster type
      isValidTarget = false;
  }



  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative group aspect-3/4 rounded-lg border-2 transition-all flex flex-col items-center justify-center w-full",
        "md:w-full md:max-w-[140px]",
        // Valid drop target (not hovering yet)
        isValidTarget &&
          !isOver &&
          "border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.6),0_0_40px_rgba(251,191,36,0.3)] animate-pulse",
        // Active hover state (Only if Valid)
        isOver && isValidTarget && "border-brand-primary bg-brand-primary/10 scale-105",
        // Invalid Hover State (Optional: Red warning or just default)
        isOver && !isValidTarget && "border-red-500/50 bg-red-500/10",
        // Default states
        !isValidTarget && !isOver && "border-white/10 bg-surface-card md:hover:border-brand-primary/40 md:hover:shadow-lg md:hover:shadow-brand-primary/10",
        isTitanSlot &&
          !isValidTarget &&
          !isOver &&
          "border-brand-accent/30 bg-brand-accent/5",
        slot.unit && "border-brand-secondary/50",
        isDragging && "opacity-50"
      )}
    >
      {/* Draggable Wrapper (only renders if unit exists) */}
      {slot.unit && (
        <div
          ref={setDragNodeRef}
          {...listeners}
          {...attributes}
          style={style}
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(slot.unit!, { x: e.clientX, y: e.clientY });
          }}
        >
        </div>
      )}

      {/* Label for Empty Slot */}
      {!slot.unit && (
        <div className="text-center opacity-30">
          <div className="mb-2 flex justify-center">
            {isTitanSlot ? (
              <Shield size={24} />
            ) : (
              <div className="w-6 h-6 rounded-full border border-current" />
            )}
          </div>
          <span className="text-[9px] md:text-xs font-bold uppercase tracking-wide md:tracking-widest">
            {isTitanSlot ? "Titan" : `Incant. ${slot.index + 1}`}
          </span>
        </div>
      )}

      {/* Filled State - Renders BEHIND the draggable wrapper hit area but visually matches */}
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
              alt={slot.unit.name || "Unit Image"}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-top"
            />
            {/* Rank/Titan Badge - Overlaid */}
            {slot.unit.category === ENTITY_CATEGORY.Titan ? (
              <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm">
                TITAN
              </div>
            ) : (
              <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm">
                {slot.unit.rank ?? "N/A"}
              </div>
            )}
          </div>
          {/* Name Banner */}
          <div className="min-h-[24px] bg-surface-main/95 border-t border-white/10 flex items-center justify-center px-1 py-0.5 z-10 shrink-0">
            <span className="text-[10px] font-bold text-gray-200 text-center leading-tight line-clamp-2 break-words w-full">
              {slot.unit.name}
            </span>
          </div>

          {/* Remove Action - Needs pointer-events-auto to work through draggable overlay layer? */}
        </div>
      )}

      {/* Titan Icon Indicator (Always visible if titan slot) - Removed redundant text label */}
      {isTitanSlot && !slot.unit && (
        <div className="absolute bottom-2 font-mono text-[10px] text-brand-accent opacity-50 hidden">
          TITAN
        </div>
      )}
    </div>
  );
}
