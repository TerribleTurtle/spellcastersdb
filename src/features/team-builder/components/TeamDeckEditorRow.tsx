"use client";

import { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDeckStore } from "@/store/index";
import { DeckDrawer } from "@/features/shared/deck/drawer/DeckDrawer";
import { useToast } from "@/hooks/useToast";
import { v4 as uuidv4 } from "uuid";
import { UnifiedEntity } from "@/types/api";

interface TeamDeckEditorRowProps {
  index: number;
  isExpanded: boolean;
  onToggle: (index: number, expanded: boolean) => void;
  idSuffix?: string;
  hideGlobalActions?: boolean;
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
  hideGlobalActions
}: TeamDeckEditorRowProps) {
  
  // 1. Precise Selector: Only re-renders if THIS deck changes reference
  // We use a selector that returns the specific deck object.
  // Assuming the store update logic creates a new object reference ONLY for the changed deck.
  const deck = useDeckStore(useShallow((state) => state.teamDecks[index]));
  const activeTeamId = useDeckStore((state) => state.activeTeamId);
  
  // Actions - Stable References from Store
  const { 
      setTeamDecks, 
      saveTeam, 
      openCommandCenter, 
      setActiveSlot, 
      exportTeamSlotToSolo, 
      openInspector
  } = useDeckStore(useShallow((state) => ({
      setTeamDecks: state.setTeamDecks,
      saveTeam: state.saveTeam,
      openCommandCenter: state.openCommandCenter,
      setActiveSlot: state.setActiveSlot,
      exportTeamSlotToSolo: state.exportTeamSlotToSolo,
      openInspector: state.openInspector
  })));

  const { showToast } = useToast();

  // Handlers - Defined locally to close over 'index'
  
  const handleRename = useCallback((name: string) => {
      // Functional update to avoid dependency on 'teamDecks'
      const state = useDeckStore.getState();
      const currentDecks = state.teamDecks;
      
      const newDecks = [...currentDecks] as [any, any, any]; // Tuple cast
      newDecks[index] = { ...newDecks[index], name };
      
      state.setTeamDecks(newDecks);
  }, [index]);

  const handleSave = useCallback(() => {
      const state = useDeckStore.getState();
      const targetId = state.activeTeamId || uuidv4();
      
      // Save Team with this slot as active to ensure sync
      state.saveTeam(targetId, undefined, index, undefined); 
      showToast("Team saved successfully", "success");
  }, [index, showToast]);

  const handleImport = useCallback(() => {
      setActiveSlot(index);
      useDeckStore.getState().setIsImporting(true);
      openCommandCenter();
  }, [index, setActiveSlot, openCommandCenter]);
  
  const handleExport = useCallback(() => {
      // deck is stable from props/selector
      if (deck) {
          const newId = uuidv4();
          exportTeamSlotToSolo(index, deck, newId);
          showToast("Deck exported to Library", "success");
      }
  }, [deck, index, exportTeamSlotToSolo, showToast]);

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

  return (
    <DeckDrawer
      deck={deck}
      onSelect={(item, pos) => openInspector(item, pos)}
      variant="static"
      slotIndex={index}
      isExpanded={isExpanded}
      onToggle={(val) => onToggle(index, val)}
      
      onRename={handleRename}
      onActivate={() => setActiveSlot(index)}
      onSave={handleSave}
      isSaved={!!activeTeamId}
      
      onImport={handleImport}
      onExportToSolo={handleExport}
      onShare={handleShare}
      
      hideGlobalActions={hideGlobalActions}
      className="border-b-0 first:border-t-0 border-t border-brand-primary/20 shadow-lg pointer-events-auto"
      idSuffix={idSuffix}
    />
  );
});
