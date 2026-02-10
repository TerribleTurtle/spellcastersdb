"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import { v4 as uuidv4 } from "uuid";

import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { Deck, SlotIndex } from "@/types/deck";

import { useDeckValidation } from "./deck-builder/useDeckValidation";
import { 
    useDeckStorage, 
    INITIAL_DECK, 
    serializeDeck, 
    reconstructDeck,
    type StoredDeck,
    STORAGE_KEY_CURRENT, 
    STORAGE_KEY_SAVED 
} from "./deck-builder/useDeckStorage";

export { 
  STORAGE_KEY_CURRENT, 
  STORAGE_KEY_SAVED, 
  serializeDeck, 
  reconstructDeck, 
  type StoredDeck 
};

export function useDeckBuilder(
  availableUnits: (Unit | Spell | Titan)[] = [],
  availableSpellcasters: Spellcaster[] = [],
  storageKey: string | null = STORAGE_KEY_CURRENT,
  savedDecksKey: string | null = STORAGE_KEY_SAVED,
  initialDeck: Deck = INITIAL_DECK
) {
  const [deck, setDeck] = useState<Deck>(initialDeck);
  const [lastError] = useState<string | null>(null);

  // --- Decomposed Hooks ---
  
  // 1. Storage & Persistence
  const { savedDecks, setSavedDecks, isInitialized } = useDeckStorage(
    deck,
    setDeck,
    availableUnits,
    availableSpellcasters,
    storageKey,
    savedDecksKey,
    initialDeck
  );

  // 2. Validation
  const { isValid, errors, stats, reminder } = useDeckValidation(deck);

  // --- Computed Properties ---

  const isEmpty = !deck.spellcaster && deck.slots.every((s) => !s.unit);

  const hasChanges = useMemo(() => {
    if (!isInitialized) return false;

    if (!deck.id) {
      // New Deck: Changes if not empty
      return !isEmpty;
    }

    const saved = savedDecks.find((d) => d.id === deck.id);
    if (!saved) return true; // Should exist, but if not, it's dirty

    return (
      JSON.stringify(serializeDeck(deck)) !==
      JSON.stringify(serializeDeck(saved))
    );
  }, [deck, savedDecks, isInitialized, isEmpty]);


  // --- Actions (Controller Logic) ---

  const setSpellcaster = useCallback((spellcaster: Spellcaster) => {
    setDeck((prev) => ({
      ...prev,
      spellcaster,
      name: prev.name ? prev.name : `${spellcaster.name} Deck`,
    }));
  }, []);

  const removeSpellcaster = useCallback(() => {
    setDeck((prev) => ({ ...prev, spellcaster: null }));
  }, []);

  const setSlot = useCallback(
    (index: SlotIndex, unit: Unit | Spell | Titan) => {
      setDeck((prev) => {
        const newSlots = [...prev.slots] as typeof prev.slots;

        // Enforce Singleton: Max 1 copy per card (except in testing?)
        if (index < 4) {
          const existingIndex = prev.slots.findIndex(
            (s, i) =>
              i < 4 && i !== index && s.unit?.entity_id === unit.entity_id
          );

          if (existingIndex !== -1) {
            newSlots[existingIndex] = {
              ...newSlots[existingIndex],
              unit: prev.slots[index].unit,
            };
          }
        }

        const slot = newSlots[index];
        const isTitan = unit.category === "Titan";

        if (slot.allowedTypes.includes("TITAN") && !isTitan) return prev;
        if (slot.allowedTypes.includes("UNIT") && isTitan) return prev;

        newSlots[index] = { ...slot, unit };
        return { ...prev, slots: newSlots };
      });
    },
    []
  );

  const clearSlot = useCallback((index: SlotIndex) => {
    setDeck((prev) => {
      const newSlots = [...prev.slots] as typeof prev.slots;
      newSlots[index] = { ...newSlots[index], unit: null };
      return { ...prev, slots: newSlots };
    });
  }, []);

  const swapSlots = useCallback((indexA: number, indexB: number) => {
    setDeck((prev) => {
      const newSlots = [...prev.slots] as typeof prev.slots;
      const unitA = newSlots[indexA].unit;
      const unitB = newSlots[indexB].unit;

      const slotA = newSlots[indexA];
      const slotB = newSlots[indexB];

      if (unitB) {
        const isTitanB = unitB.category === "Titan";
        if (slotA.allowedTypes.includes("TITAN") && !isTitanB) return prev;
        if (slotA.allowedTypes.includes("UNIT") && isTitanB) return prev;
      }

      if (unitA) {
        const isTitanA = unitA.category === "Titan";
        if (slotB.allowedTypes.includes("TITAN") && !isTitanA) return prev;
        if (slotB.allowedTypes.includes("UNIT") && isTitanA) return prev;
      }

      newSlots[indexA] = { ...newSlots[indexA], unit: unitB };
      newSlots[indexB] = { ...newSlots[indexB], unit: unitA };

      return { ...prev, slots: newSlots };
    });
  }, []);

  const clearDeck = useCallback(() => {
    setDeck({ ...INITIAL_DECK, id: undefined, name: "" });
  }, []);

  const setDeckState = useCallback((newDeck: Deck) => {
    setDeck(newDeck);
  }, []);

  const setDeckName = useCallback((name: string) => {
    setDeck((prev) => ({ ...prev, name }));
  }, []);

  // --- Saved Decks Logic ---

  const saveDeck = useCallback(
    (nameInput: string) => {
      let finalName = nameInput.trim();
      if (!finalName) {
        finalName = deck.spellcaster?.name
          ? `${deck.spellcaster.name} Deck`
          : "Untitled Deck";
      }

      let id = deck.id;
      if (!id) {
        const existingByName = savedDecks.find(
          (d) => (d.name || "").toLowerCase() === finalName.toLowerCase()
        );
        if (existingByName) {
          id = existingByName.id;
        } else {
          id = uuidv4();
        }
      }

      const deckToSave: Deck = { ...deck, name: finalName, id };

      setSavedDecks((prev) => {
        const existingIndex = prev.findIndex((d) => d.id === id);
        if (existingIndex >= 0) {
          const newSaved = [...prev];
          newSaved[existingIndex] = deckToSave;
          return newSaved;
        }
        return [...prev, deckToSave];
      });

      setDeck(deckToSave);
    },
    [deck, savedDecks, setSavedDecks]
  );

  const loadDeck = useCallback(
    (id: string) => {
      const target = savedDecks.find((d) => d.id === id);
      if (target) {
        const clone: Deck = {
          ...target,
          slots: target.slots.map((s) => ({ ...s })) as typeof target.slots,
        };
        setDeck(clone);
      }
    },
    [savedDecks]
  );

  const deleteDeck = useCallback((id: string) => {
    setSavedDecks((prev) => prev.filter((d) => d.id !== id));
    setDeck((current) =>
      current.id === id ? { ...INITIAL_DECK, id: undefined, name: "" } : current
    );
  }, [setSavedDecks]);

  const importDecks = useCallback((newDecks: Deck[]) => {
    setSavedDecks((prev) => {
        const safeNewDecks = newDecks.map((d) => ({
            ...d,
            id: uuidv4(),
            name: d.name || "Imported Deck",
        }));
        return [...prev, ...safeNewDecks];
    });
  }, [setSavedDecks]);

  const duplicateDeck = useCallback(
    (id: string) => {
      const target = savedDecks.find((d) => d.id === id);
      if (target) {
        const newId = uuidv4();
        const clone: Deck = {
          ...target,
          id: newId,
          name: `${target.name} (Copy)`,
          slots: target.slots.map((s) => ({ ...s })) as typeof target.slots,
        };

        setSavedDecks((prev) => [...prev, clone]);
        setDeck(clone);
      }
    },
    [savedDecks, setSavedDecks]
  );

  const saveAsCopy = useCallback(
    (nameInput?: string) => {
        const newId = uuidv4();
        const finalName = nameInput ? nameInput.trim() : `${deck.name} (Copy)`;
        const deckToSave: Deck = { ...deck, id: newId, name: finalName };

        setSavedDecks((prev) => [...prev, deckToSave]);
        setDeck(deckToSave);
    },
    [deck, setSavedDecks]
  );

  const saveNow = () => {
      if (storageKey) {
          const effectiveDeck = {
              ...deck,
              name: deck.name || (deck.spellcaster ? `${deck.spellcaster.name} Deck` : "Untitled Deck"),
          };
          const stored = serializeDeck(effectiveDeck);
          localStorage.setItem(storageKey, JSON.stringify(stored));
      }
  };

  const reorderDecks = useCallback((newDecks: Deck[]) => {
      setSavedDecks(newDecks);
  }, [setSavedDecks]);

  return {
    deck,
    savedDecks,
    isInitialized,
    setSpellcaster,
    removeSpellcaster,
    setSlot,
    clearSlot,
    clearDeck,
    moveSlot: swapSlots,
    setDeckState,
    setDeckName,
    saveDeck,
    saveAsCopy,
    saveNow,
    loadDeck,
    deleteDeck,
    importDecks,
    duplicateDeck,
    isEmpty,
    lastError,
    validation: {
      isValid,
      errors,
      reminder,
    },
    stats,
    reorderDecks,
    hasChanges,
  };
}
