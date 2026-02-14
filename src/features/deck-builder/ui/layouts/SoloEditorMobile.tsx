"use client";

import React from "react";
import { BrowserItem } from "@/types/browser";
import { Deck } from "@/types/deck";
import { UnifiedEntity } from "@/types/api";
import { DeckDrawer } from "@/features/shared/deck/drawer/DeckDrawer";
import { UnitBrowser } from "@/features/deck-builder/browser/UnitBrowser";
import { SwapModeBanner } from "@/features/deck-builder/ui/overlays/SwapModeBanner";
import { cn } from "@/lib/utils";

interface SoloEditorMobileProps {
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
  isDrawerOpen: boolean;
  onToggleDrawer: (open: boolean) => void;
  footerHeight: number;

  pendingSwapCard: UnifiedEntity | null;
  onCancelSwap: () => void;
}

export function SoloEditorMobile({
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
  isDrawerOpen,
  onToggleDrawer,
  footerHeight,
  pendingSwapCard,
  onCancelSwap
}: SoloEditorMobileProps) {
  const isSwapMode = !!pendingSwapCard;
  return (
    <div className="contents xl:hidden">
       {/* Mobile Browser Section */}
       <section 
        aria-label="Unit Library"
        className="flex-1 overflow-hidden relative transition-all duration-300 ease-in-out min-h-0"
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

      {/* Mobile Drawer (Fixed) */}
      <div>
         <DeckDrawer 
            deck={currentDeck}
            onSelect={onSelectItem}
            variant="fixed"
            isExpanded={isDrawerOpen}
            onToggle={onToggleDrawer}
            onRename={onDeckNameChange}
            isSaved={isSaved}
            onSave={onSave}
            onClear={onClear}
            onLibraryOpen={onOpenLibrary}
            onShare={onShare}
            hideGlobalActions={true}
            idSuffix="mobile"
         />
      </div>
    </div>
  );
}
