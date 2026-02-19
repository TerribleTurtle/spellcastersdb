"use client";

import React from "react";
import { DeckSlot } from "@/types/deck";
import { UnifiedEntity, Spellcaster } from "@/types/api";
import { ActiveDeckTray } from "@/features/shared/deck/ui/ActiveDeckTray";

interface MobileDeckDockProps {
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  spellcaster: Spellcaster | null;
  validation?: {
    isValid: boolean;
    errors: string[];
  };
  onSelect: (item: UnifiedEntity | undefined, pos: { x: number; y: number } | undefined, slotIndex?: number) => void;
  deckId?: string;
  isSwapMode?: boolean;
}

export function MobileDeckDock({
    slots,
    spellcaster,
    validation,
    onSelect,
    deckId,
    isSwapMode
}: MobileDeckDockProps) {
  return (
    <div data-testid="mobile-deck-dock" className="fixed bottom-0 left-0 right-0 bg-surface-deck border-t border-brand-primary/20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-40 pb-[env(safe-area-inset-bottom)]">
        {/* Active Header for Mobile */}
        <div className="h-6 w-full bg-brand-primary/20 border-b border-brand-primary/10 flex items-center justify-center">
            <div className="w-12 h-1 rounded-full bg-surface-hover" />
        </div>
        <div className="relative">
             <ActiveDeckTray 
                slots={slots}
                spellcaster={spellcaster}
                validation={validation}
                onSelect={onSelect}
                deckId={deckId}
                isSwapMode={isSwapMode}
                idSuffix="mobile-dock"
                prioritySpellcaster={true}
             />
             
             {/* Gradient fade to show it continues */}
             <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent opacity-50" />
        </div>
    </div>
  );
}
