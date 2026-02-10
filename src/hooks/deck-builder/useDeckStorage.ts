
import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { Deck, DeckSlot } from "@/types/deck";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

// Storage Constants
export const STORAGE_KEY_CURRENT = "spellcasters_deck_v1";
export const STORAGE_KEY_SAVED = "spellcasters_saved_decks_v1";
const STORAGE_KEY_LEGACY_CURRENT = "spellcasters_deck";
const STORAGE_KEY_LEGACY_SAVED = "spellcasters_saved_decks";

// Internal Storage Format (IDs only)
export interface StoredDeck {
  id?: string;
  name?: string;
  spellcasterId: string | null;
  slotIds: [
    string | null,
    string | null,
    string | null,
    string | null,
    string | null,
  ];
}

const INITIAL_SLOTS: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot] = [
  { index: 0, unit: null, allowedTypes: ["UNIT"] },
  { index: 1, unit: null, allowedTypes: ["UNIT"] },
  { index: 2, unit: null, allowedTypes: ["UNIT"] },
  { index: 3, unit: null, allowedTypes: ["UNIT"] },
  { index: 4, unit: null, allowedTypes: ["TITAN"] },
];

export const INITIAL_DECK: Deck = {
  spellcaster: null,
  slots: INITIAL_SLOTS,
  name: "",
};

// Helper: Convert Deck to Stored Format
export function serializeDeck(deck: Deck): StoredDeck {
  return {
    id: deck.id,
    name: deck.name,
    spellcasterId: deck.spellcaster?.spellcaster_id || null,
    slotIds: deck.slots.map((s) => s.unit?.entity_id || null) as [
      string | null,
      string | null,
      string | null,
      string | null,
      string | null,
    ],
  };
}

// Helper: Reconstruct Deck from Stored Format
export function reconstructDeck(
  stored: StoredDeck,
  units: (Unit | Spell | Titan)[],
  spellcasters: Spellcaster[]
): Deck {
  const newSlots = INITIAL_SLOTS.map((s) => ({ ...s }));

  stored.slotIds.forEach((id, idx) => {
    if (id && idx < 5) {
      const freshUnit = units.find((u) => u.entity_id === id);
      if (freshUnit) {
        newSlots[idx] = { ...newSlots[idx], unit: freshUnit };
      }
    }
  });

  const freshSpellcaster = stored.spellcasterId
    ? spellcasters.find((s) => s.spellcaster_id === stored.spellcasterId)
    : null;

  return {
    id: stored.id,
    name: stored.name,
    spellcaster: freshSpellcaster || null,
    slots: newSlots as [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot],
  };
}

export function useDeckStorage(
  deck: Deck,
  setDeck: React.Dispatch<React.SetStateAction<Deck>>,
  availableUnits: (Unit | Spell | Titan)[],
  availableSpellcasters: Spellcaster[],
  storageKey: string | null = STORAGE_KEY_CURRENT,
  savedDecksKey: string | null = STORAGE_KEY_SAVED,
  initialDeck: Deck = INITIAL_DECK
) {
  const [savedDecks, setSavedDecks] = useState<Deck[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasHydrated = useRef(false);
  const loadedKeyRef = useRef<string | null>(storageKey);
  const skipPersistence = useRef(false);

  // Events
  const EVENT_SAVED_DECKS_UPDATE = "spellcasters:saved-decks-update";
  const EVENT_CURRENT_DECK_UPDATE = "spellcasters:current-deck-update";

  // 1. Hydration
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if (storageKey) {
      let savedCurrent = localStorage.getItem(storageKey);

      // MIGRATION: Current Deck
      if (!savedCurrent && storageKey === STORAGE_KEY_CURRENT) {
        const legacy = localStorage.getItem(STORAGE_KEY_LEGACY_CURRENT);
        if (legacy) savedCurrent = legacy;
      }

      if (savedCurrent) {
        try {
          const stored: StoredDeck = JSON.parse(savedCurrent);
          const reconstructed = reconstructDeck(
            stored,
            availableUnits,
            availableSpellcasters
          );
          setDeck((prev) => {
            if (
              JSON.stringify(serializeDeck(prev)) ===
              JSON.stringify(serializeDeck(reconstructed))
            ) {
              return prev;
            }
            return reconstructed;
          });
          loadedKeyRef.current = storageKey;
        } catch (e) {
          console.error("Failed to load current deck", e);
        }
      } else {
        if (hasHydrated.current) {
          setDeck(initialDeck);
          loadedKeyRef.current = storageKey;
        }
      }
    }

    // Load Saved Decks
    if (
      savedDecksKey &&
      (!hasHydrated.current || savedDecksKey !== STORAGE_KEY_SAVED)
    ) {
      let savedList = localStorage.getItem(savedDecksKey);

      // MIGRATION: Saved Decks
      if (!savedList && savedDecksKey === STORAGE_KEY_SAVED) {
        const legacy = localStorage.getItem(STORAGE_KEY_LEGACY_SAVED);
        if (legacy) savedList = legacy;
      }

      if (savedList) {
        try {
          const storedList: StoredDeck[] = JSON.parse(savedList);
          const reconstructedList = storedList.map((d) =>
            reconstructDeck(d, availableUnits, availableSpellcasters)
          );
          // eslint-disable-next-line
          setSavedDecks(reconstructedList);
        } catch (e) {
          console.error("Failed to load saved decks list", e);
        }
      }
    }

    hasHydrated.current = true;
    setIsInitialized(true);
  }, [
    availableUnits,
    availableSpellcasters,
    storageKey,
    savedDecksKey,
    initialDeck,
    setDeck
  ]);

  // 2. Persistence (Current Deck)
  useEffect(() => {
    if (isInitialized && storageKey) {
      if (storageKey !== loadedKeyRef.current) return;

      const stored = serializeDeck(deck);
      const json = JSON.stringify(stored);
      localStorage.setItem(storageKey, json);

      window.dispatchEvent(
        new CustomEvent("spellcasters:deck-written", {
          detail: { key: storageKey, deck: stored },
        })
      );
    }
  }, [deck, isInitialized, storageKey]);

  // 3. Persistence (Saved Decks)
  useEffect(() => {
    if (skipPersistence.current) {
      skipPersistence.current = false;
      return;
    }

    if (isInitialized && savedDecksKey) {
      const storedList = savedDecks.map(serializeDeck);
      localStorage.setItem(savedDecksKey, JSON.stringify(storedList));
      window.dispatchEvent(new Event(EVENT_SAVED_DECKS_UPDATE));
    }
  }, [savedDecks, isInitialized, savedDecksKey, EVENT_SAVED_DECKS_UPDATE]);

  // 4. Cross-Tab Sync (Saved Decks)
  useEffect(() => {
    if (!savedDecksKey || !isInitialized) return;

    const handleSync = () => {
      const savedList = localStorage.getItem(savedDecksKey);
      if (savedList) {
        try {
          const storedList: StoredDeck[] = JSON.parse(savedList);
          const currentString = JSON.stringify(savedDecks.map(serializeDeck));
          if (JSON.stringify(storedList) !== currentString) {
            const reconstructedList = storedList.map((d) =>
              reconstructDeck(d, availableUnits, availableSpellcasters)
            );
            skipPersistence.current = true;
            setSavedDecks(reconstructedList);
          }
        } catch (e) {
          console.error("Failed to sync saved decks", e);
        }
      }
    };

    window.addEventListener(EVENT_SAVED_DECKS_UPDATE, handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener(EVENT_SAVED_DECKS_UPDATE, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [
    savedDecksKey,
    isInitialized,
    availableUnits,
    availableSpellcasters,
    savedDecks,
    EVENT_SAVED_DECKS_UPDATE
  ]);

  // 5. Current Deck Sync
  useEffect(() => {
    if (!storageKey || !isInitialized) return;

    const handleCurrentSync = (e: Event) => {
      if (
        e instanceof CustomEvent &&
        e.detail?.key &&
        e.detail.key !== storageKey
      ) {
        return;
      }
      if (e instanceof StorageEvent && e.key !== storageKey) {
        return;
      }

      const savedCurrent = localStorage.getItem(storageKey);
      if (savedCurrent) {
        try {
          const stored: StoredDeck = JSON.parse(savedCurrent);
          const newDeck = reconstructDeck(
            stored,
            availableUnits,
            availableSpellcasters
          );

          if (JSON.stringify(serializeDeck(deck)) !== JSON.stringify(stored)) {
            setDeck(newDeck);
          }
        } catch (err) {
          console.error("Failed to sync current deck", err);
        }
      } else {
        const hasContent =
          deck.id || deck.spellcaster || deck.slots.some((s) => s.unit);
        if (hasContent) {
          setDeck({ ...INITIAL_DECK, id: undefined, name: "" });
        }
      }
    };

    window.addEventListener(EVENT_CURRENT_DECK_UPDATE, handleCurrentSync);
    return () => {
      window.removeEventListener(EVENT_CURRENT_DECK_UPDATE, handleCurrentSync);
    };
  }, [storageKey, isInitialized, availableUnits, availableSpellcasters, deck, setDeck, EVENT_CURRENT_DECK_UPDATE]);

  return {
    savedDecks,
    setSavedDecks,
    isInitialized,
    hasHydrated: isInitialized,
  };
}
