import LZString from "lz-string";
import { Deck } from "@/types/deck";

// Minimal structure for sharing to save space
// [SpellcasterID, Slot1ID, Slot2ID, Slot3ID, Slot4ID, Slot5ID]
// Slot ID can be null
type MinifiedDeck = [string | null, string | null, string | null, string | null, string | null, string | null];

export function encodeDeck(deck: Deck): string {
  const minified: MinifiedDeck = [
    deck.spellcaster?.hero_id || null,
    deck.slots[0]?.unit?.entity_id || null,
    deck.slots[1]?.unit?.entity_id || null,
    deck.slots[2]?.unit?.entity_id || null,
    deck.slots[3]?.unit?.entity_id || null,
    deck.slots[4]?.unit?.entity_id || null,
  ];
  const json = JSON.stringify(minified);
  return LZString.compressToEncodedURIComponent(json);
}

export interface DecodedDeckData {
    spellcasterId: string | null;
    slotIds: (string | null)[];
}

export function decodeDeck(hash: string): DecodedDeckData | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(hash);
    if (!json) return null;
    
    const minified: MinifiedDeck = JSON.parse(json);
    if (!Array.isArray(minified) || minified.length !== 6) return null;

    // Validate each element is string or null (prevent malicious payloads)
    if (!minified.every(v => v === null || typeof v === 'string')) {
      console.warn("decodeDeck: invalid payload structure", minified);
      return null;
    }

    return {
        spellcasterId: minified[0],
        slotIds: minified.slice(1)
    };
  } catch (e) {
    console.error("Failed to decode deck", e);
    return null;
  }
}
