import { Deck, DeckSlot, SlotType } from "@/types/deck";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

// --- Constants ---

// Helper to prevent accidental mutation of constants
import { v4 as uuidv4 } from "uuid";

function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    Object.keys(obj).forEach(key => deepFreeze((obj as Record<string, unknown>)[key]));
  }
  return obj;
}

export const INITIAL_SLOTS: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot] = deepFreeze([
  { index: 0, unit: null, allowedTypes: [SlotType.Unit] },
  { index: 1, unit: null, allowedTypes: [SlotType.Unit] },
  { index: 2, unit: null, allowedTypes: [SlotType.Unit] },
  { index: 3, unit: null, allowedTypes: [SlotType.Unit] },
  { index: 4, unit: null, allowedTypes: [SlotType.Titan] },
]);

export const INITIAL_DECK: Deck = deepFreeze({
  spellcaster: null,
  slots: INITIAL_SLOTS,
  name: "",
});

// --- Types ---

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

// --- Functions ---

// Helper: Convert Deck to Stored Format
export function serializeDeck(deck: Deck): StoredDeck {
  return {
    id: deck.id,
    name: deck.name,
    spellcasterId: deck.spellcaster?.spellcaster_id || null, // Fallback for safety
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

  // Handle potential legacy ID mapping if needed, but strict ID match is safer for now
  const freshSpellcaster = stored.spellcasterId
    ? spellcasters.find((s) => s.spellcaster_id === stored.spellcasterId || s.entity_id === stored.spellcasterId)
    : null;

  return {
    id: stored.id || uuidv4(), // Self-healing: Generate ID if missing
    name: stored.name,
    spellcaster: freshSpellcaster || null,
    slots: newSlots as [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot],
  };
}

// Helper: Efficient Equality Check (avoids JSON.stringify)
export function areDecksEqual(deckA: Deck, deckB: Deck): boolean {
  if (deckA === deckB) return true;
  
  // 1. Compare Core Props
  if (deckA.id !== deckB.id) return false;
  if (deckA.name !== deckB.name) return false;
  
  // 2. Compare Spellcaster ID
  const scA = deckA.spellcaster?.spellcaster_id || null;
  const scB = deckB.spellcaster?.spellcaster_id || null;
  if (scA !== scB) return false;

  // 3. Compare Slots (just entity IDs)
  for (let i = 0; i < 5; i++) {
    const unitA = deckA.slots[i]?.unit?.entity_id || null;
    const unitB = deckB.slots[i]?.unit?.entity_id || null;
    if (unitA !== unitB) return false;
  }

  return true;
}
