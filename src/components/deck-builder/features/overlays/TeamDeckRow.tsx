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
import { DeckOverview } from "../../shared/ui/DeckOverview";
import { UnifiedEntity } from "@/types/api";

interface TeamDeckRowProps {
  index: number;
  deck: Deck;
  onEdit: () => void;
  isReadOnly?: boolean;
  onInspect?: (item: UnifiedEntity, position: { x: number; y: number }) => void;
  onStopInspect?: () => void;
}

export function TeamDeckRow({
  index,
  deck,
  onEdit,
  isReadOnly,
  onInspect,
  onStopInspect,
}: TeamDeckRowProps) {
  const { isValid, errors } = validateDeck(deck);

  return (
    <div className="bg-surface-card border border-white/10 rounded-xl overflow-hidden hover:border-brand-primary/30 transition-all group">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Header / Info Column */}
        <div
          className={cn(
            "w-full lg:w-64 bg-black/20 border-b lg:border-b-0 lg:border-r border-white/5 p-3 md:p-4 flex flex-col justify-between relative overflow-hidden",
            !isReadOnly && "cursor-pointer hover:bg-white/5 transition-colors"
          )}
          onClick={!isReadOnly ? onEdit : undefined}
        >
          {deck.spellcaster && (
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <GameImage
                src={getCardImageUrl(deck.spellcaster)}
                alt=""
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
                    ? "bg-green-500 text-white border-green-400"
                    : "bg-red-500 text-white border-red-400"
                )}
                title={isValid ? "Deck Valid" : errors.join("\n")}
              >
                {isValid ? (
                  <CheckCircle2 size={10} strokeWidth={3} />
                ) : (
                  <AlertCircle size={10} strokeWidth={3} />
                )}
              </div>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider truncate">
              {deck.name || "Untitled Deck"}
            </h3>
            <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mt-1">
              {deck.spellcaster?.name || "No Spellcaster"}
            </p>
          </div>

          {!isReadOnly && (
            <div className="mt-4 flex gap-2 relative z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="w-full py-2 rounded bg-brand-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/80 transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>

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
}
