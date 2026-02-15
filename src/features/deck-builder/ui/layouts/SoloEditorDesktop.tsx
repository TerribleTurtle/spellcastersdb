"use client";

import React from "react";
import { BrowserItem } from "@/types/browser";
import { Deck } from "@/types/deck";
import { UnifiedEntity } from "@/types/api";
import { InspectorPanel } from "@/features/shared/inspector/InspectorPanel";
import { DeckDrawer } from "@/features/shared/deck/drawer/DeckDrawer";
import { UnitBrowser } from "@/features/deck-builder/browser/UnitBrowser";
import { SwapModeBanner } from "@/features/deck-builder/ui/overlays/SwapModeBanner";
import { cn } from "@/lib/utils";

interface SoloEditorDesktopProps {
  currentDeck: Deck;
  browserItems: BrowserItem[];
  onSelectItem: (item: UnifiedEntity, pos?: { x: number; y: number }, slotIndex?: number) => void;
  onQuickAdd: (item: BrowserItem) => void;
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
  onCancelSwap
}: SoloEditorDesktopProps) {
  const isSwapMode = !!pendingSwapCard;
  return (
    <div id="active-deck-desktop" className="hidden xl:contents">
      {/* Left Column: Vault / Browser */}
      <section 
        aria-label="Unit Library"
        className="flex-1 overflow-hidden relative transition-all duration-300 ease-in-out xl:col-start-1 xl:row-start-2 xl:pb-0! xl:border-r xl:border-white/10"
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
          <div className={cn("w-full h-full", isSwapMode && "opacity-30 grayscale pointer-events-none")}>
            <UnitBrowser
                items={browserItems}
                onSelectItem={onSelectItem}
                onQuickAdd={onQuickAdd}
            />
          </div>
      </section>

      {/* Right Column: Inspector (Top) + Drawer (Bottom) */}
      <div className="xl:flex xl:col-start-2 xl:row-start-2 xl:flex-col xl:justify-between xl:gap-4 xl:h-full xl:overflow-hidden">
          
          {/* Inspector fills remaining space but shrink wraps if possible */}
          <div className="flex-initial shrink min-h-0 max-h-full flex flex-col">
             <InspectorPanel className="h-auto max-h-full border border-white/10 rounded-xl shadow-lg overflow-hidden" />
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
                className="w-full border border-white/10 rounded-xl shadow-lg overflow-hidden"
                idSuffix="desktop"
                forceActive={true}
            />
          </div>
      </div>
    </div>
  );
}
