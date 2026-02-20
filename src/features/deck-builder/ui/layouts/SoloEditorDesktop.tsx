"use client";

import React from "react";

import { UnitBrowser } from "@/features/deck-builder/browser/UnitBrowser";
import { SwapModeBanner } from "@/features/deck-builder/ui/overlays/SwapModeBanner";
import { DeckDrawer } from "@/features/shared/deck/drawer/DeckDrawer";
import { InspectorPanel } from "@/features/shared/inspector/InspectorPanel";
import { cn } from "@/lib/utils";
import { UnifiedEntity } from "@/types/api";
import { BrowserItem, ItemUsageState } from "@/types/browser";
import { Deck } from "@/types/deck";

interface SoloEditorDesktopProps {
  currentDeck: Deck;
  browserItems: BrowserItem[];
  onSelectItem: (
    item: UnifiedEntity | undefined,
    pos?: { x: number; y: number },
    slotIndex?: number
  ) => void;
  onQuickAdd: (item: BrowserItem) => boolean | void;
  onDeckNameChange: (name: string) => void;
  isSaved: boolean;
  onSave: () => void;
  onClear: () => void;
  onShare: () => void;
  onOpenLibrary: () => void;
  footerHeight: number;
  pendingSwapCard: UnifiedEntity | null;
  onCancelSwap: () => void;
}

export function SoloEditorDesktop({
  currentDeck,
  browserItems,
  onSelectItem,
  onQuickAdd,
  onDeckNameChange,
  isSaved,
  onSave,
  onClear,
  onShare,
  onOpenLibrary,
  footerHeight,
  pendingSwapCard,
  onCancelSwap,
}: SoloEditorDesktopProps) {
  const isSwapMode = !!pendingSwapCard;

  const itemStates = React.useMemo(() => {
    const states = new Map<string, ItemUsageState>();

    // Helper to mark active
    const markActive = (id: string) => {
      states.set(id, { isActive: true, memberOfDecks: [] });
    };

    if (currentDeck.spellcaster) markActive(currentDeck.spellcaster.entity_id);

    currentDeck.slots.forEach((s) => {
      if (s.unit) markActive(s.unit.entity_id);
    });

    return states;
  }, [currentDeck]);

  return (
    <div id="active-deck-desktop" className="hidden xl:contents">
      {/* Left Column: Vault / Browser */}
      <section
        aria-label="Unit Library"
        className="flex-1 overflow-hidden relative transition-[flex,width] duration-300 ease-in-out xl:col-start-1 xl:row-start-2 xl:pb-0! xl:border-r xl:border-border-default"
        style={{ paddingBottom: `${footerHeight}px` }}
      >
        {pendingSwapCard && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[90%] w-auto">
            <SwapModeBanner
              pendingCard={pendingSwapCard}
              onCancel={onCancelSwap}
            />
          </div>
        )}
        <div
          className={cn(
            "w-full h-full",
            isSwapMode && "opacity-30 grayscale pointer-events-none"
          )}
        >
          <UnitBrowser
            items={browserItems}
            onSelectItem={onSelectItem}
            onQuickAdd={onQuickAdd}
            itemStates={itemStates}
          />
        </div>
      </section>

      {/* Right Column: Inspector (Top) + Drawer (Bottom) */}
      <div className="xl:flex xl:col-start-2 xl:row-start-2 xl:flex-col xl:justify-between xl:gap-4 xl:h-full xl:overflow-hidden">
        {/* Inspector fills remaining space but shrink wraps if possible */}
        <div className="flex-initial shrink min-h-0 max-h-full flex flex-col">
          <InspectorPanel className="h-auto max-h-full border border-border-default rounded-xl shadow-lg overflow-hidden" />
        </div>

        {/* Drawer fixed at bottom of column */}
        <div className="shrink-0">
          <DeckDrawer
            deck={currentDeck}
            onSelect={onSelectItem}
            variant="static" // Use static variant for layout flow
            isExpanded={true} // Always expanded on Desktop
            onToggle={() => {}}
            onRename={onDeckNameChange}
            isSaved={isSaved}
            onSave={onSave}
            onClear={onClear}
            onLibraryOpen={onOpenLibrary}
            onShare={onShare}
            hideGlobalActions={true}
            className="w-full border border-border-default rounded-xl shadow-lg overflow-hidden"
            idSuffix="desktop"
            forceActive={true}
          />
        </div>
      </div>
    </div>
  );
}
