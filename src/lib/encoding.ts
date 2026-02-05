import LZString from "lz-string";
import { Deck } from "@/types/deck";

const DELIMITER = "\u001F"; // ASCII Unit Separator

export function encodeDeck(deck: Deck): string {
  const ids = [
    deck.spellcaster?.hero_id || "",
    deck.slots[0]?.unit?.entity_id || "",
    deck.slots[1]?.unit?.entity_id || "",
    deck.slots[2]?.unit?.entity_id || "",
    deck.slots[3]?.unit?.entity_id || "",
    deck.slots[4]?.unit?.entity_id || "",
  ];
  
  const packed = ids.join(DELIMITER);
  return LZString.compressToEncodedURIComponent(packed);
}

export interface DecodedDeckData {
    spellcasterId: string | null;
    slotIds: (string | null)[];
}

export function decodeDeck(hash: string): DecodedDeckData | null {
  try {
    const packed = LZString.decompressFromEncodedURIComponent(hash);
    if (!packed) return null;
    
    const parts = packed.split(DELIMITER);
    if (parts.length !== 6) {
        // Fallback for unexpected lengths, though should be 6
        return null;
    }

    return {
        spellcasterId: parts[0] || null,
        slotIds: parts.slice(1).map(id => id || null)
    };
  } catch (e) {
    console.error("Failed to decode deck", e);
    return null;
  }
}
