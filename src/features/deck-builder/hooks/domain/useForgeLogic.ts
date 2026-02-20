"use client";

import { Deck } from "@/types/deck";

import {
  SavedListTab,
  useDeckPersistence,
} from "../persistence/useDeckPersistence";
import { useDeckSharing } from "../persistence/useDeckSharing";
import { useDeckBuilder } from "./useDeckBuilder";

export type { SavedListTab }; // Re-export for components

interface UseForgeLogicProps {
  onClear: () => void;
  onImportSolo?: (deck: Deck) => void;
}

export function useForgeLogic({ onClear, onImportSolo }: UseForgeLogicProps) {
  const {
    // Solo Actions
    currentDeck: deck,
    setDeckName: onRename,

    teamName,
    setTeamName: onRenameTeam,
    teamDecks,
    activeSlot,

    // UI Slice
    mode,
    setMode,
  } = useDeckBuilder();

  const isTeamMode = mode === "TEAM";

  // --- Composition ---
  const persistence = useDeckPersistence({ onClear, onImportSolo });

  const sharing = useDeckSharing({
    deck,
    isTeamMode,
    teamDecks: teamDecks || undefined, // undefined if null
    teamName,
    activeSlot,
  });

  return {
    // State
    isTeamMode,
    mode,
    setMode,
    deck,
    teamName,
    onRename,
    onRenameTeam,

    // Composed Hooks
    ...persistence,
    ...sharing,
  };
}
