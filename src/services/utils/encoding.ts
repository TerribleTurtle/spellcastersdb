import LZString from "lz-string";

import { Deck } from "@/types/deck";

const DELIMITER = "\u001F"; // ASCII Unit Separator for intra-deck
const TEAM_DELIMITER = "~"; // Tilde for separating decks in a team

const MAX_NAME_LENGTH = 50;

export function encodeDeck(deck: Deck): string {
  const ids = [
    deck.spellcaster?.spellcaster_id || "",
    deck.slots[0]?.unit?.entity_id || "",
    deck.slots[1]?.unit?.entity_id || "",
    deck.slots[2]?.unit?.entity_id || "",
    deck.slots[3]?.unit?.entity_id || "",
    deck.slots[4]?.unit?.entity_id || "",
    (deck.name || "")
      .replace(new RegExp(DELIMITER, "g"), "")
      .replace(new RegExp(TEAM_DELIMITER, "g"), "")
      .substring(0, MAX_NAME_LENGTH),
  ];

  const packed = ids.join(DELIMITER);
  return LZString.compressToEncodedURIComponent(packed);
}

export interface DecodedDeckData {
  spellcasterId: string | null;
  slotIds: (string | null)[];
  name?: string;
}

export function decodeDeck(hash: string): DecodedDeckData | null {
  try {
    const packed = LZString.decompressFromEncodedURIComponent(hash);
    if (!packed) return null;

    const parts = packed.split(DELIMITER);
    // Support simple format (6 parts) or named format (7 parts)
    if (parts.length < 6) {
      return null;
    }

    return {
      spellcasterId: parts[0] || null,
      slotIds: parts.slice(1, 6).map((id) => id || null),
      name: parts[6] || undefined,
    };
  } catch (e) {
    console.error("Failed to decode deck", e);
    return null;
  }
}

// --- Team Encoding ---

const TEAM_V2_PREFIX = "v2~";

export function encodeTeam(
  decks: [Deck, Deck, Deck],
  name: string = ""
): string {
  // V2: Flatten everything and compress once for better efficiency
  // Format: name ~ d1_caster ~ d1_u1 ... ~ d2_caster ...

  // Flatten each deck into its IDs
  const deck1Ids = getDeckIds(decks[0]);
  const deck2Ids = getDeckIds(decks[1]);
  const deck3Ids = getDeckIds(decks[2]);

  // Combined array: [name, ...deck1, ...deck2, ...deck3]
  const combined = [
    name.replace(new RegExp(DELIMITER, "g"), ""),
    ...deck1Ids,
    ...deck2Ids,
    ...deck3Ids,
  ];

  // Join with DELIMITER
  const packed = combined.join(DELIMITER);

  // Compress
  return TEAM_V2_PREFIX + LZString.compressToEncodedURIComponent(packed);
}

function getDeckIds(deck: Deck): string[] {
  return [
    deck.spellcaster?.spellcaster_id || "",
    deck.slots[0]?.unit?.entity_id || "",
    deck.slots[1]?.unit?.entity_id || "",
    deck.slots[2]?.unit?.entity_id || "",
    deck.slots[3]?.unit?.entity_id || "",
    deck.slots[4]?.unit?.entity_id || "",
    // Include deck name for compatibility with decodeTeam (7 items expected)
    (deck.name || "")
      .replace(new RegExp(DELIMITER, "g"), "")
      .replace(new RegExp(TEAM_DELIMITER, "g"), "")
      .substring(0, MAX_NAME_LENGTH),
  ];
}

export function decodeTeam(hash: string): {
  name: string;
  decks: (DecodedDeckData | null)[];
} {
  if (!hash) return { name: "", decks: [null, null, null] };

  // Clean hash (handle potential space replacements from URL decoding quirks)
  const cleanHash = hash.replace(/ /g, "+");

  // Check for V2 Headers
  if (cleanHash.startsWith(TEAM_V2_PREFIX)) {
    try {
      const payload = cleanHash.slice(TEAM_V2_PREFIX.length);
      const packed = LZString.decompressFromEncodedURIComponent(payload);

      if (!packed) {
        console.error(
          "decodeTeam: Decompression returned null/empty for payload",
          payload.substring(0, 20) + "..."
        );
        return { name: "", decks: [null, null, null] };
      }

      const parts = packed.split(DELIMITER);
      // Structure: Name (1) + Deck1 (7) + Deck2 (7) + Deck3 (7) = 22 parts

      const teamName = parts[0] || "";
      const deckParts = parts.slice(1);

      const results: (DecodedDeckData | null)[] = [];

      for (let i = 0; i < 3; i++) {
        const start = i * 7;
        const slice = deckParts.slice(start, start + 7);
        if (slice.length < 6) {
          results.push(null);
          continue;
        }
        results.push({
          spellcasterId: slice[0] || null,
          slotIds: slice.slice(1, 6).map((id) => id || null),
          name: slice[6] || undefined,
        });
      }

      return { name: teamName, decks: results };
    } catch (e) {
      console.error("decodeTeam: Exception during V2 decoding", e);
      return { name: "", decks: [null, null, null] };
    }
  }

  // Legacy V1 (Tilde separated individual deck hashes)
  try {
    const parts = cleanHash.split(TEAM_DELIMITER);
    const results = parts.map(decodeDeck);

    while (results.length < 3) results.push(null);
    return { name: "", decks: results.slice(0, 3) };
  } catch (e) {
    console.error("decodeTeam: Exception during legacy decoding", e);
    return { name: "", decks: [null, null, null] };
  }
}
