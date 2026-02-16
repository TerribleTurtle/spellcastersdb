import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";
import { UnifiedEntity, Spellcaster } from "@/types/api";
import { DeckSlot } from "@/types/deck";

import { DeckSlot as Slot } from "./DeckSlot";
import { SpellcasterSlot } from "./SpellcasterSlot";
import { DropData } from "@/types/dnd";


interface ActiveDeckTrayProps {
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  spellcaster: Spellcaster | null;
  onSelect?: (item: UnifiedEntity | undefined, pos?: {x:number, y:number}, slotIndex?: number) => void;
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
  const dropId = idSuffix ? `deck-background-${deckId}-${idSuffix}` : `deck-background-${deckId}`;
  
  const dropData: DropData = {
      type: "DECK_BACKGROUND",
      deckId
  };

  const { setNodeRef } = useDroppable({
      id: dropId,
      data: dropData,
      disabled: !deckId // Only active if we have a deck ID
  });

  return (
    <div 
        ref={setNodeRef}
        id={idSuffix ? `active-deck-${idSuffix}` : undefined}
        className="h-auto min-h-[140px] xl:min-h-0 bg-transparent border-t border-brand-primary/20 flex flex-col pb-2 xl:pb-0 xl:justify-center relative"
    >
      <div className="grow flex items-center justify-between gap-0.5 px-2 py-1 xl:grid xl:grid-cols-6 xl:gap-2 xl:pl-4 xl:pr-4 xl:py-3 xl:items-center xl:content-center xl:grow-0">
        {/* Spellcaster Area - Fixed Width on Desktop */}
        <div className="relative flex items-center flex-1 min-w-[76px] max-w-[17%] xl:max-w-none xl:w-full justify-center">
          <SpellcasterSlot
            spellcaster={spellcaster}
            onSelect={(item, pos) => onSelect?.(item, pos)}
            deckId={deckId}
            idSuffix={idSuffix}
            priority={prioritySpellcaster}
          />
        </div>

        {/* Separator */}
        <div className="w-px h-24 bg-white/10 mx-2 self-center hidden" />

        {/* Unit Slots 1-4 - Equal Distribution */}
        {slots.slice(0, 4).map((slot) => (
            <div 
                key={slot.index} 
                className={cn(
                    "flex-1 min-w-0 flex justify-center xl:col-span-1 xl:w-full transition-all duration-300",
                    isSwapMode && "scale-105 z-10"
                )}
            >
              <div className={cn(
                  "w-full h-full rounded-lg transition-all",
                  isSwapMode && "ring-2 ring-brand-primary ring-offset-2 ring-offset-gray-900 animate-pulse cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              )}>
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

        {/* Separator */}
        <div className="w-px h-24 bg-white/10 mx-2 self-center hidden" />

        {/* Titan Area - Fixed Width on Desktop */}
        <div className="relative flex items-center flex-1 min-w-0 max-w-[17%] xl:max-w-none xl:w-full justify-center">
          <Slot
            slot={slots[4]}
            allSlots={slots}
            onSelect={(item, pos) => onSelect?.(item, pos, slots[4].index)}
            deckId={deckId}
            idSuffix={idSuffix}
          />

          {/* Validation Indicator - Directly to the right of Titan */}
          {validation && (
            <div
              className={cn(
                "absolute z-50 flex items-center gap-1.5 rounded-full shadow-sm border backdrop-blur-md transition-all cursor-help whitespace-nowrap",
                // Mobile AND XL: Top-Right Corner Overlay
                "-top-2 -right-2 px-1.5 py-0.5 xl:top-0 xl:right-0 xl:p-1 xl:px-2",
                validation.isValid
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              )}
              title={
                validation.isValid ? "Deck Valid" : validation.errors.join("\n")
              }
              data-testid="validation-indicator"
            >
              {validation.isValid ? (
                <CheckCircle2 size={12} />
              ) : (
                <AlertCircle size={12} />
              )}
              <span className="text-[9px] font-bold uppercase tracking-widest hidden">
                {validation.isValid
                  ? "Valid"
                  : `${validation.errors.length} Issues`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


