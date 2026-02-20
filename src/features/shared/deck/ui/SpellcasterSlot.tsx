import { useDndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { HelpCircle, Shield, Sparkles, Swords, Wand2, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { GameImage } from "@/components/ui/GameImage";
import { cn } from "@/lib/utils";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { ENTITY_CATEGORY } from "@/services/config/constants";
import { CLASS_STYLES } from "@/services/config/rank-class-styles";
import { useDeckStore } from "@/store/index";
import { Spellcaster, UnifiedEntity } from "@/types/api";
import { DragData, DraggableEntity, DropData } from "@/types/dnd";

interface SpellcasterSlotProps {
  spellcaster: Spellcaster | null;
  onSelect?: (item: UnifiedEntity, pos?: { x: number; y: number }) => void;
  deckId?: string; // Context ID for Team Mode
  idSuffix?: string;
  priority?: boolean;
}

export function SpellcasterSlot({
  spellcaster,
  onSelect,
  deckId,
  idSuffix,
  priority = false,
}: SpellcasterSlotProps) {
  const baseZoneId = deckId ? `spellcaster-zone-${deckId}` : "spellcaster-zone";
  const zoneId = idSuffix ? `${baseZoneId}-${idSuffix}` : baseZoneId;

  const baseDragId = deckId
    ? `spellcaster-slot-drag-${deckId}`
    : "spellcaster-slot-drag";
  const dragId = idSuffix ? `${baseDragId}-${idSuffix}` : baseDragId;

  const {
    mode,
    isReadOnly,
    removeSpellcaster,
    removeTeamSpellcaster,
    teamDecks,
  } = useDeckStore(
    useShallow((state) => ({
      mode: state.mode,
      isReadOnly: state.isReadOnly,
      removeSpellcaster: state.removeSpellcaster,
      removeTeamSpellcaster: state.removeTeamSpellcaster,
      teamDecks: state.teamDecks,
    }))
  );

  const handleRemove = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;

    if (mode === "TEAM" && deckId) {
      const deckIndex = teamDecks.findIndex((d) => d.id === deckId);
      if (deckIndex !== -1) {
        removeTeamSpellcaster(deckIndex);
      }
    } else {
      removeSpellcaster();
    }
  };

  const dropData: DropData = {
    type: "SPELLCASTER_SLOT",
    deckId,
  };

  const { isOver, setNodeRef } = useDroppable({
    id: zoneId,
    data: dropData,
  });

  const dragData: DragData = {
    type: "SPELLCASTER_SLOT",
    item: spellcaster as DraggableEntity,
    sourceDeckId: deckId,
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
    if (
      "spellcaster_id" in item ||
      item.category === ENTITY_CATEGORY.Spellcaster
    ) {
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
        isValidTarget &&
          !isOver &&
          "border-slot-border-valid bg-slot-bg-valid shadow-(--sp-slot-glow-valid) animate-pulse",
        // Active hover
        isOver &&
          isValidTarget &&
          "border-brand-primary bg-brand-primary/10 scale-105 shadow-brand-primary/20",
        // Default
        !isValidTarget &&
          !isOver &&
          "border-brand-primary/30 bg-surface-card md:hover:border-brand-primary/60 md:hover:shadow-lg md:hover:shadow-brand-primary/10",
        spellcaster && "border-brand-primary",
        isDragging && "opacity-50"
      )}
    >
      {/* Remove Button */}
      {spellcaster && !isReadOnly && !isDragging && (
        <button
          type="button"
          className="absolute -top-1.5 -right-1.5 z-60 p-1 md:p-1 bg-surface-main hover:bg-status-danger hover:text-white rounded-full text-text-muted transition-colors shadow-md ring-1 ring-border-default/50 hover:ring-status-danger cursor-pointer pointer-events-auto"
          onPointerDown={handleRemove}
          onClick={(e) => {
            e.stopPropagation();
          }}
          title="Remove Spellcaster"
          data-testid="remove-spellcaster"
        >
          <X size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" />
        </button>
      )}

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
          <div className="relative flex-1 bg-surface-raised overflow-hidden">
            <GameImage
              src={getCardImageUrl(spellcaster)}
              alt={spellcaster.name || "Spellcaster Image"}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-top"
            />
            {/* Spellcaster Class Badge - Icon */}
            {/* Spellcaster Class Badge - Icon */}
            <div
              className={cn(
                "absolute bottom-1 left-1 flex items-center justify-center w-5 h-5 lg:w-7 lg:h-7 rounded-full border-2 shadow-sm backdrop-blur-sm z-20",
                spellcaster.class && CLASS_STYLES[spellcaster.class]
                  ? cn(
                      CLASS_STYLES[spellcaster.class].bg,
                      CLASS_STYLES[spellcaster.class].border
                    )
                  : "bg-surface-main border-slate-400"
              )}
            >
              {spellcaster.class === "Conqueror" ? (
                <Shield
                  size={14}
                  className="text-status-danger-text scale-110"
                />
              ) : spellcaster.class === "Enchanter" ? (
                <Wand2 size={14} className="text-purple-400 scale-110" />
              ) : spellcaster.class === "Duelist" ? (
                <Swords size={14} className="text-amber-400 scale-110" />
              ) : (
                <HelpCircle size={14} className="text-text-muted scale-110" />
              )}
            </div>
          </div>
          {/* Name Banner */}
          <div className="min-h-[28px] bg-brand-primary/20 backdrop-blur-sm border-t border-brand-primary/30 flex items-center justify-center px-1 py-0.5 z-10 shrink-0">
            <span className="text-[11px] font-bold text-text-primary text-center leading-tight line-clamp-2 wrap-break-word w-full shadow-black drop-shadow-md">
              {spellcaster.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
