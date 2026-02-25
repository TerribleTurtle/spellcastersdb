import { useDroppable } from "@dnd-kit/core";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Spellcaster, UnifiedEntity } from "@/types/api";
import { DeckSlot } from "@/types/deck";
import { DropData } from "@/types/dnd";

import { DeckSlot as Slot } from "./DeckSlot";
import { SpellcasterSlot } from "./SpellcasterSlot";

interface ActiveDeckTrayProps {
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  spellcaster: Spellcaster | null;
  onSelect?: (
    item: UnifiedEntity | undefined,
    pos?: { x: number; y: number },
    slotIndex?: number
  ) => void;
  validation?: {
    isValid: boolean;
    errors: string[];
  };
  deckId?: string;
  idSuffix?: string;
  isSwapMode?: boolean; // NEW: controlled by parent
  prioritySpellcaster?: boolean;
}

export function ActiveDeckTray({
  slots,
  spellcaster,
  onSelect,
  validation,
  deckId,
  idSuffix,
  isSwapMode = false,
  prioritySpellcaster = false,
}: ActiveDeckTrayProps) {
  // Background Droppable
  const dropId = idSuffix
    ? `deck-background-${deckId}-${idSuffix}`
    : `deck-background-${deckId}`;

  const dropData: DropData = {
    type: "DECK_BACKGROUND",
    deckId,
  };

  const { setNodeRef } = useDroppable({
    id: dropId,
    data: dropData,
    disabled: !deckId, // Only active if we have a deck ID
  });

  return (
    <div
      ref={setNodeRef}
      id={idSuffix ? `active-deck-${idSuffix}` : undefined}
      className="h-auto min-h-[100px] xl:min-h-0 bg-transparent border-t border-brand-primary/20 flex flex-col pb-0 xl:pb-0 xl:justify-center relative"
    >
      <div className="grid grid-cols-6 gap-1 sm:gap-2 xl:gap-3 px-2 py-2 sm:px-3 sm:py-3 xl:px-6 xl:py-4 max-w-[700px] mx-auto w-full">
        {/* Spellcaster Area */}
        <div className="col-span-1">
          <SpellcasterSlot
            spellcaster={spellcaster}
            onSelect={(item, pos) => onSelect?.(item, pos)}
            deckId={deckId}
            idSuffix={idSuffix}
            priority={prioritySpellcaster}
          />
        </div>

        {/* Unit Slots 1-4 */}
        {slots.slice(0, 4).map((slot) => (
          <div
            key={slot.index}
            className={cn(
              "col-span-1 transition-all duration-300",
              isSwapMode && "scale-105 z-10"
            )}
          >
            <div
              className={cn(
                "w-full h-full rounded-lg transition-all",
                isSwapMode &&
                  "ring-2 ring-slot-swap-ring ring-offset-2 ring-offset-surface-main animate-pulse cursor-pointer shadow-[0_0_15px_rgba(var(--sp-brand-primary),0.5)]"
              )}
            >
              <Slot
                slot={slot}
                allSlots={slots}
                onSelect={(item, pos) => {
                  onSelect?.(item, pos, slot.index);
                }}
                deckId={deckId}
                idSuffix={idSuffix}
              />
            </div>
          </div>
        ))}

        {/* Titan Area */}
        <div className="col-span-1">
          <Slot
            slot={slots[4]}
            allSlots={slots}
            onSelect={(item, pos) => onSelect?.(item, pos, slots[4].index)}
            deckId={deckId}
            idSuffix={idSuffix}
          />
        </div>
      </div>
    </div>
  );
}
