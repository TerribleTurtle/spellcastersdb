import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { UnifiedEntity, Spellcaster } from "@/types/api";
import { DeckSlot } from "@/types/deck";

import { DeckSlot as Slot } from "./DeckSlot";
import { SpellcasterSlot } from "./SpellcasterSlot";
import { useDeckBuilder } from "@/components/deck-builder/hooks/domain/useDeckBuilder";

interface ActiveDeckTrayProps {
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  spellcaster: Spellcaster | null;
  onSelect?: (item: UnifiedEntity, pos?: {x:number, y:number}) => void;
  validation?: {
    isValid: boolean;
    errors: string[];
  };
  deckId?: string; // NEW
}

export function ActiveDeckTray({
  slots,
  spellcaster,
  onSelect,
  validation,
  deckId,
}: ActiveDeckTrayProps) {
  const { activeDragItem } = useDeckBuilder();
  return (
    <div className="h-full bg-surface-main border-t border-brand-primary/20 flex flex-col pb-2 xl:pb-4 relative">
      <div className="grow flex items-center justify-between gap-0.5 px-2 py-1 xl:grid xl:grid-cols-6 xl:gap-2 xl:pl-4 xl:pr-4 xl:py-4 xl:items-start xl:content-start xl:grow-0">
        {/* Spellcaster Area - Fixed Width on Desktop */}
        <div className="relative flex items-center flex-1 min-w-[76px] max-w-[17%] xl:max-w-none xl:w-full justify-center">
          <SpellcasterSlot
            spellcaster={spellcaster}
            draggedItem={activeDragItem}
            onSelect={(item, pos) => onSelect?.(item, pos)}
            deckId={deckId}
          />
        </div>

        {/* Separator */}
        <div className="w-px h-24 bg-white/10 mx-2 self-center hidden" />

        {/* Unit Slots 1-4 - Equal Distribution */}
        {slots.slice(0, 4).map((slot) => (
            <div key={slot.index} className="flex-1 min-w-0 flex justify-center xl:col-span-1 xl:w-full">
              <Slot
                slot={slot}
                draggedItem={activeDragItem}
                allSlots={slots}
                onSelect={(item, pos) => {
                    onSelect?.(item, pos);
                }}
                deckId={deckId}
              />
            </div>
        ))}

        {/* Separator */}
        <div className="w-px h-24 bg-white/10 mx-2 self-center hidden" />

        {/* Titan Area - Fixed Width on Desktop */}
        <div className="relative flex items-center flex-1 min-w-0 max-w-[17%] xl:max-w-none xl:w-full justify-center">
          <Slot
            slot={slots[4]}
            draggedItem={activeDragItem}
            allSlots={slots}
            onSelect={(item, pos) => onSelect?.(item, pos)}
            deckId={deckId}
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

