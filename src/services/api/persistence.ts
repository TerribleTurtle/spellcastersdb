// --- Constants ---
// Helper to prevent accidental mutation of constants
import { v4 as uuidv4 } from "uuid";

import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { Deck, DeckSlot, SlotType } from "@/types/deck";

function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    Object.keys(obj).forEach((key) =>
      deepFreeze((obj as Record<string, unknown>)[key])
    );
  }
  return obj;
}

export const INITIAL_SLOTS: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot] =
  deepFreeze([
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

/**
 * Converts a hydrated Deck into a lightweight storage format containing only IDs.
 *
 * This is used by `zustand/persist` to serialize decks into `localStorage`
 * without storing full entity objects (which would be stale after data refreshes).
 *
 * @param deck - The hydrated deck with full entity references.
 * @returns A `StoredDeck` containing only `spellcasterId` and `slotIds`.
 *
 * @example
 * ```ts
 * const stored = serializeDeck(currentDeck);
 * // stored = { id: "abc", name: "Fire", spellcasterId: "nadia", slotIds: ["fire_imp_1", ...] }
 * ```
 */
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

/**
 * Rehydrates a `StoredDeck` (IDs only) back into a full `Deck` with entity references.
 *
 * Builds O(1) lookup maps from the provided entity arrays, then resolves each ID.
 * Self-heals missing `id` fields by generating a new UUID.
 *
 * @param stored - The lightweight stored deck from `localStorage`.
 * @param units - All available units, spells, and titans to resolve slot IDs against.
 * @param spellcasters - All available spellcasters to resolve the spellcaster ID.
 * @returns A fully hydrated `Deck` with resolved entity references.
 *
 * @example
 * ```ts
 * const deck = reconstructDeck(storedDeck, allUnits, allSpellcasters);
 * console.log(deck.spellcaster?.name); // "Nadia"
 * ```
 */
export function reconstructDeck(
  stored: StoredDeck,
  units: (Unit | Spell | Titan)[],
  spellcasters: Spellcaster[]
): Deck {
  // O(1) lookup maps (built once per call)
  const unitMap = new Map(units.map((u) => [u.entity_id, u]));
  const scMap = new Map<string, Spellcaster>();
  for (const sc of spellcasters) {
    const primaryId = sc.spellcaster_id || sc.entity_id;
    if (primaryId) scMap.set(primaryId, sc);
    if (sc.entity_id && sc.entity_id !== primaryId) {
      scMap.set(sc.entity_id, sc);
    }
  }

  const newSlots = INITIAL_SLOTS.map((s) => ({ ...s }));

  stored.slotIds.forEach((id, idx) => {
    if (id && idx < 5) {
      const freshUnit = unitMap.get(id);
      if (freshUnit) {
        newSlots[idx] = { ...newSlots[idx], unit: freshUnit };
      }
    }
  });

  // Handle potential legacy ID mapping if needed, but strict ID match is safer for now
  const freshSpellcaster = stored.spellcasterId
    ? (scMap.get(stored.spellcasterId) ?? null)
    : null;

  return {
    id: stored.id || uuidv4(), // Self-healing: Generate ID if missing
    name: stored.name,
    spellcaster: freshSpellcaster || null,
    slots: newSlots as [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot],
  };
}

/**
 * Performs a fast structural equality check between two decks.
 *
 * Compares `id`, `name`, `spellcaster_id`, and all 5 slot `entity_id` values.
 * Avoids expensive `JSON.stringify` and is safe for use in React selectors.
 *
 * @param deckA - First deck to compare.
 * @param deckB - Second deck to compare.
 * @returns `true` if both decks have identical IDs and entity references.
 *
 * @example
 * ```ts
 * if (!areDecksEqual(currentDeck, savedDeck)) {
 *   showUnsavedChangesModal();
 * }
 * ```
 */
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
