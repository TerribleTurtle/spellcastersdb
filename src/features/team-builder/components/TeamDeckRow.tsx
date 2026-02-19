"use client";

import {
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { Deck } from "@/types/deck";
import { validateDeck } from "@/services/validation/deck-validation";
import { cn } from "@/lib/utils";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { DeckOverview } from "@/features/shared/deck/ui/DeckOverview";
import { UnifiedEntity } from "@/types/api";

interface TeamDeckRowProps {
  index: number;
  deck: Deck;
  onEdit: () => void;
  isReadOnly?: boolean;
  onInspect?: (item: UnifiedEntity, position: { x: number; y: number }) => void;
  onStopInspect?: () => void;
}

import { memo } from "react";
// ... imports

export const TeamDeckRow = memo(function TeamDeckRow({
  index,
  deck,
  onEdit,
  isReadOnly,
  onInspect,
  onStopInspect,
}: TeamDeckRowProps) {
  const { isValid, errors } = validateDeck(deck);

  return (
    <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden hover:border-brand-primary/30 transition-all group">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Header / Info Column */}
        <button
          type="button"
          className={cn(
            "w-full lg:w-64 bg-surface-dim border-b lg:border-b-0 lg:border-r border-border-subtle p-2 md:p-3 flex flex-col justify-between relative overflow-hidden text-left",
            !isReadOnly && "cursor-pointer hover:bg-surface-card transition-colors"
          )}
          onClick={!isReadOnly ? onEdit : undefined}
          disabled={isReadOnly}
        >
          {deck.spellcaster && (
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <GameImage
                src={getCardImageUrl(deck.spellcaster)}
                alt={deck.spellcaster.name}
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-linear-to-r from-surface-card/90 to-transparent" />
            </div>
          )}

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-wider border border-brand-primary/20">
                Slot {index + 1}
              </div>
              {/* Validation Badge */}
              <div
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full border-2",
                  isValid
                    ? "bg-green-500 text-text-primary border-green-400"
                    : "bg-red-500 text-text-primary border-red-400"
                )}
                title={isValid ? "Deck Valid" : errors.join("\n")}
                aria-label={isValid ? "Deck Valid" : "Deck Invalid"}
              >
                {isValid ? (
                  <CheckCircle2 size={10} strokeWidth={3} />
                ) : (
                  <AlertCircle size={10} strokeWidth={3} />
                )}
              </div>
            </div>
            <h3 className="text-lg font-black text-text-primary uppercase tracking-wider truncate max-w-[calc(100vw-6rem)] lg:max-w-full">
              Slot {index + 1}
            </h3>
            <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mt-1">
              {deck.spellcaster?.name || "No Spellcaster"}
            </p>
          </div>

          {!isReadOnly && (
            <div className="mt-4 flex gap-2 relative z-10">
              <div
                className="w-full py-2 rounded bg-brand-primary text-brand-dark text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/80 transition-colors text-center"
              >
                Edit
              </div>
            </div>
          )}
        </button>

        {/* Deck Visuals - Horizontal Tray */}
        <div className="flex-1 p-2 lg:p-4 overflow-x-auto">
             <DeckOverview 
                deck={deck} 
                onInspect={onInspect}
                onStopInspect={onStopInspect}
             />
        </div>
      </div>
    </div>
  );
});
