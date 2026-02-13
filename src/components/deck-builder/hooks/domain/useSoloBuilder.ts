"use client";

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { Deck } from "@/types/deck";
import { useDeckStore } from "@/store/index";
import { selectIsEmpty, selectHasChanges } from "@/store/selectors";

export function useSoloBuilder() {
  const store = useDeckStore(
    useShallow((state) => ({
      // State
      currentDeck: state.currentDeck,
      savedDecks: state.savedDecks,

      // Actions
      swapSlots: state.swapSlots,
      setDeck: state.setDeck,
      setSavedDecks: state.setSavedDecks,
      saveDeck: state.saveDeck,
      setSpellcaster: state.setSpellcaster,
      removeSpellcaster: state.removeSpellcaster,
      setSlot: state.setSlot,
      clearSlot: state.clearSlot,
      quickAdd: state.quickAdd,
      clearDeck: state.clearDeck,
      setDeckName: state.setDeckName,
      saveAsCopy: state.saveAsCopy,
      loadDeck: state.loadDeck,
      deleteDeck: state.deleteDeck,
      deleteDecks: state.deleteDecks,
      duplicateDeck: state.duplicateDeck,
      importDecks: state.importDecks,
      renameSavedDeck: state.renameSavedDeck,
    }))
  );

  const { swapSlots, setDeck, saveDeck, setSavedDecks, currentDeck } = store;

  const isEmpty = selectIsEmpty(store);
  const hasChanges = selectHasChanges(store);

  // Adapter for "moveSlot" -> "swapSlots"
  const moveSlot = swapSlots;

  const setDeckState = useCallback(
    (newDeck: Deck) => {
      setDeck(newDeck);
    },
    [setDeck]
  );

  const saveNow = useCallback(() => {
    saveDeck(currentDeck.name || "");
  }, [saveDeck, currentDeck.name]);

  const reorderDecks = useCallback(
    (newDecks: Deck[]) => {
      setSavedDecks(newDecks);
    },
    [setSavedDecks]
  );

  return {
    ...store,
    isEmpty,
    hasChanges,
    moveSlot,
    setDeckState,
    saveNow,
    reorderDecks,
  };
}
