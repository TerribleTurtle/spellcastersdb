import LZString from "lz-string";

import { monitoring } from "@/services/monitoring";
import { Deck } from "@/types/deck";

const DELIMITER = "\u001F"; // ASCII Unit Separator for intra-deck
const TEAM_DELIMITER = "~"; // Tilde for separating decks in a team

const MAX_NAME_LENGTH = 50;

/** Removes HTML tags to prevent XSS injection in metadata */
const sanitizeHtml = (str: string) => str.replace(/<[^>]*>?/gm, "");

/**
 * Compresses a Deck into a URL-safe string using LZ-string.
 *
 * **Format:** Joins spellcaster ID, 5 slot entity IDs, and deck name with `\x1F` (Unit Separator),
 * then compresses via `LZString.compressToEncodedURIComponent`.
 *
 * @param deck - The deck to encode.
 * @returns A URL-safe compressed string suitable for query params or short links.
 *
 * @example
 * ```ts
 * const hash = encodeDeck(myDeck);
 * // Use in URL: `/deck-builder?d=${hash}`
 * ```
 */
export function encodeDeck(deck: Deck): string {
  const ids = [
    deck.spellcaster?.spellcaster_id || "",
    deck.slots?.[0]?.unit?.entity_id || "",
    deck.slots?.[1]?.unit?.entity_id || "",
    deck.slots?.[2]?.unit?.entity_id || "",
    deck.slots?.[3]?.unit?.entity_id || "",
    deck.slots?.[4]?.unit?.entity_id || "",
    (deck.name || "")
      .replace(new RegExp(DELIMITER, "g"), "")
      .replace(new RegExp(TEAM_DELIMITER, "g"), "")
      .substring(0, MAX_NAME_LENGTH),
  ];

  const packed = ids.join(DELIMITER);
  return LZString.compressToEncodedURIComponent(packed);
}

/**
 * The raw data extracted from a decoded deck hash.
 * Contains entity IDs only — not hydrated entities. Use the Registry to resolve IDs to full objects.
 */
export interface DecodedDeckData {
  /** The spellcaster's ID, or `null` if the deck hash had no spellcaster. */
  spellcasterId: string | null;
  /** Ordered array of 5 slot entity IDs. `null` entries represent empty slots. */
  slotIds: (string | null)[];
  /** Optional deck name extracted from the hash (sanitized, max 50 chars). */
  name?: string;
}

/**
 * Decompresses a URL-safe hash back into deck data (IDs only, not hydrated entities).
 *
 * Expects 6–7 `\x1F`-delimited parts (spellcaster + 5 slots + optional name).
 * Returns `null` for malformed, corrupted, or excessively long inputs.
 * Sanitizes the deck name to prevent XSS via `sanitizeHtml`.
 *
 * @param hash - The LZ-string compressed hash from a URL.
 * @returns Decoded deck data with raw IDs, or `null` on failure.
 *
 * @example
 * ```ts
 * const data = decodeDeck(urlParams.get('d')!);
 * if (data) {
 *   const unit = registry.getUnit(data.slotIds[0]!);
 * }
 * ```
 */
export function decodeDeck(hash: string): DecodedDeckData | null {
  try {
    // Clean hash (handle potential space replacements from URL decoding quirks)
    const cleanHash = hash.replace(/ /g, "+");
    const packed = LZString.decompressFromEncodedURIComponent(cleanHash);
    if (!packed) return null;

    const parts = packed.split(DELIMITER);
    // Support simple format (6 parts) or named format (7 parts).
    // Reject excessive parts to prevent hidden garbage injection (Risk #3).
    if (parts.length < 6 || parts.length > 7) {
      return null;
    }

    const rawName = parts[6]
      ? parts[6].substring(0, MAX_NAME_LENGTH)
      : undefined;
    const sanitizedName = rawName ? sanitizeHtml(rawName) : undefined;

    return {
      spellcasterId: parts[0] || null,
      slotIds: parts.slice(1, 6).map((id) => id || null),
      name: sanitizedName,
    };
  } catch (e) {
    monitoring.captureException(e, {
      message: "Failed to decode deck",
      context: "encoding.ts:decodeDeck",
    });
    return null;
  }
}

// --- Team Encoding ---

const TEAM_V2_PREFIX = "v2~";

/**
 * Compresses a team of 3 decks + team name into a single URL-safe string (V2 format).
 *
 * **V2 Format:** Prefixed with `"v2~"`, then a single LZ-string payload containing
 * `[teamName, ...deck1Ids(7), ...deck2Ids(7), ...deck3Ids(7)]` joined by `\x1F`.
 * This is more efficient than V1 which compressed each deck individually.
 *
 * @param decks - Exactly 3 Deck objects.
 * @param name - Optional team name (max 50 chars, delimiters stripped).
 * @returns A `"v2~"`-prefixed, URL-safe compressed string.
 *
 * @example
 * ```ts
 * const hash = encodeTeam([deck1, deck2, deck3], "My Team");
 * // Use in URL: `/deck-builder?t=${hash}`
 * ```
 */
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
    name
      .replace(new RegExp(DELIMITER, "g"), "")
      .replace(new RegExp(TEAM_DELIMITER, "g"), ""),
    ...deck1Ids,
    ...deck2Ids,
    ...deck3Ids,
  ];

  // Join with DELIMITER
  const packed = combined.join(DELIMITER);

  // Compress
  return TEAM_V2_PREFIX + LZString.compressToEncodedURIComponent(packed);
}

function getDeckIds(deck: Deck | null | undefined): string[] {
  if (!deck) return ["", "", "", "", "", "", ""];
  return [
    deck.spellcaster?.spellcaster_id || "",
    deck.slots?.[0]?.unit?.entity_id || "",
    deck.slots?.[1]?.unit?.entity_id || "",
    deck.slots?.[2]?.unit?.entity_id || "",
    deck.slots?.[3]?.unit?.entity_id || "",
    deck.slots?.[4]?.unit?.entity_id || "",
    // Include deck name for compatibility with decodeTeam (7 items expected)
    (deck.name || "")
      .replace(new RegExp(DELIMITER, "g"), "")
      .replace(new RegExp(TEAM_DELIMITER, "g"), "")
      .substring(0, MAX_NAME_LENGTH),
  ];
}

/**
 * Decompresses a team hash back into a team name and 3 decoded decks.
 *
 * Supports both V2 (`"v2~"` prefix, single payload) and legacy V1 (tilde-separated
 * individual deck hashes). Returns `{ name: "", decks: [null, null, null] }` on any
 * decompression or parsing failure.
 *
 * @param hash - The compressed team hash from a URL.
 * @returns An object with the team `name` and an array of 3 decoded decks (or `null` per deck).
 *
 * @example
 * ```ts
 * const { name, decks } = decodeTeam(urlParams.get('t')!);
 * decks.forEach((d, i) => {
 *   if (d) console.log(`Deck ${i}: ${d.spellcasterId}`);
 * });
 * ```
 */
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
        monitoring.captureMessage(
          "decodeTeam: Decompression returned null/empty for payload",
          "error",
          { payloadStart: payload.substring(0, 20) + "..." }
        );
        return { name: "", decks: [null, null, null] };
      }

      const parts = packed.split(DELIMITER);
      // Structure: Name (1) + Deck1 (7) + Deck2 (7) + Deck3 (7) = 22 parts

      const rawTeamName = parts[0]
        ? parts[0].substring(0, MAX_NAME_LENGTH)
        : "";
      const teamName = rawTeamName ? sanitizeHtml(rawTeamName) : "";
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
          name: slice[6]
            ? sanitizeHtml(slice[6].substring(0, MAX_NAME_LENGTH))
            : undefined,
        });
      }

      return { name: teamName, decks: results };
    } catch (e) {
      monitoring.captureException(e, {
        message: "decodeTeam: Exception during V2 decoding",
        context: "encoding.ts:decodeTeam:v2",
      });
      return { name: "", decks: [null, null, null] };
    }
  }

  // Legacy V1 (Tilde separated individual deck hashes)
  try {
    // Limit to 3 parts before executing computationally expensive decodeDeck
    const parts = cleanHash.split(TEAM_DELIMITER).slice(0, 3);
    const results = parts.map(decodeDeck);

    while (results.length < 3) results.push(null);
    return { name: "", decks: results.slice(0, 3) };
  } catch (e) {
    monitoring.captureException(e, {
      message: "decodeTeam: Exception during legacy decoding",
      context: "encoding.ts:decodeTeam:legacy",
    });
    return { name: "", decks: [null, null, null] };
  }
}
