"use client";

import { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDeckStore } from "@/store/index";

import { DeckDrawer } from "@/features/shared/deck/drawer/DeckDrawer";
import { useToast } from "@/hooks/useToast";

import { Unit, Spell, Titan } from "@/types/api";

interface TeamDeckEditorRowProps {
  index: number;
  isExpanded: boolean;
  onToggle: (index: number, expanded: boolean) => void;
  idSuffix?: string;
  hideGlobalActions?: boolean;
  onExport?: () => void;
}

/**
 * Connected Component for a single Team Deck in the Editor.
 * Isolates re-renders so that typing in one deck name doesn't re-render others.
 * Subscribes ONLY to its specific deck slot in the store.
 */
export const TeamDeckEditorRow = memo(function TeamDeckEditorRow({
  index,
  isExpanded,
  onToggle,
  idSuffix,
  hideGlobalActions,
  onExport
}: TeamDeckEditorRowProps) {
  
  // 1. Precise Selector: Only re-renders if THIS deck changes reference
  // We use a selector that returns the specific deck object.
  // Assuming the store update logic creates a new object reference ONLY for the changed deck.
  const deck = useDeckStore(useShallow((state) => state.teamDecks[index]));
  const activeTeamId = useDeckStore((state) => state.activeTeamId);
  
  // Actions - Stable References from Store
  const { 
      openCommandCenter, 
      setActiveSlot, 
      openInspector,
      pendingSwapCard,
      setPendingSwapCard,
      setTeamSlot
  } = useDeckStore(useShallow((state) => ({
      openCommandCenter: state.openCommandCenter,
      setActiveSlot: state.setActiveSlot,
      openInspector: state.openInspector,
      pendingSwapCard: state.pendingSwapCard,
      setPendingSwapCard: state.setPendingSwapCard,
      setTeamSlot: state.setTeamSlot
  })));

  const { showToast } = useToast();

  const handleImport = useCallback(() => {
      setActiveSlot(index);
      useDeckStore.getState().setIsImporting(true);
      openCommandCenter();
  }, [index, setActiveSlot, openCommandCenter]);
  
  const handleShare = useCallback(async () => {
      const { encodeTeam } = await import("@/services/utils/encoding");
      const { copyToClipboard } = await import("@/lib/clipboard");
      
      const state = useDeckStore.getState();
      const hash = encodeTeam(state.teamDecks, state.teamName);
      const url = `${window.location.origin}${window.location.pathname}?team=${hash}`;
      
      if (await copyToClipboard(url)) showToast("Team Link Copied!", "success");
  }, [showToast]);



  /* 
     NOTE: 'onClear' is omitted to isolate state. 
     Clearing is a rare action. Renaming is frequent.
     We prioritize optimizing rename/typing lag.
  */

  if (!deck) return null;

  // Enforce Static Name (DECK 1, DECK 2, etc.)
  // We explicitly override the name for display purposes.
  // The underlying deck in store retains its real name, but it is invisible to the user here.
  const displayDeck = { ...deck, name: `DECK ${index + 1}` };

  return (
    <DeckDrawer
      deck={displayDeck}
            // It bubbles up from ActiveDeckTray -> DeckSlot.
            // ActiveDeckTray calls `onSelect?.(item, pos, slot.index);`
            
            // We need to capture that 3rd argument. 
            // BUT DeckDrawer prop `onSelect` is `(item: UnifiedEntity, pos: {x,y}) => void`.
            // It seems the interface ignores the 3rd arg?
            // I need to update DeckDrawer to pass the index or handle it differently.
            // Actually, for now, let's assume DeckDrawer passes the slot index as valid 3rd arg even if TS complains, 
            // OR I should check DeckDrawer definition.
            
            // Checking DeckDrawer.tsx...
            // `onSelect: (item: UnifiedEntity, pos?: { x: number; y: number }, slotIndex?: number) => void;` -> It IS there?
      onSelect={(item, pos, slotIndex) => {
        if (pendingSwapCard && slotIndex !== undefined) {
             setTeamSlot(index, slotIndex, pendingSwapCard as Unit | Spell | Titan);
             setPendingSwapCard(null);
             showToast(`Swapped ${pendingSwapCard.name} with ${item.name}`, "success");
             return;
        }
        openInspector(item, pos);
      }}
      variant="static"
      slotIndex={index}
      isExpanded={isExpanded}
      onToggle={(val) => onToggle(index, val)}
      
      onActivate={() => setActiveSlot(index)}
      // onSave={handleSave} // Removed to hide individual save icon
      isSaved={!!activeTeamId}
      
      onImport={handleImport}
      onExportToSolo={onExport}
      onShare={handleShare}
      
      hideGlobalActions={hideGlobalActions}
      className="border-b-0 first:border-t-0 border-t border-brand-primary/20 shadow-lg pointer-events-auto"
      idSuffix={idSuffix}
    />
  );
});
