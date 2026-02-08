
import LZString from "lz-string";

const DELIMITER = "\u001F";
const TEAM_DELIMITER = "~";
const MAX_NAME_LENGTH = 50;
const TEAM_V2_PREFIX = "v2~";

// Mock types
interface Deck {
    name?: string;
    spellcaster?: { spellcaster_id: string };
    slots: { unit?: { entity_id: string } }[];
}

interface DecodedDeckData {
    spellcasterId: string | null;
    slotIds: (string | null)[];
    name?: string;
}

// --- Copied & Adapted Logic from src/lib/encoding.ts ---

function encodeDeck(deck: Deck): string {
  const ids = [
    deck.spellcaster?.spellcaster_id || "",
    deck.slots[0]?.unit?.entity_id || "",
    deck.slots[1]?.unit?.entity_id || "",
    deck.slots[2]?.unit?.entity_id || "",
    deck.slots[3]?.unit?.entity_id || "",
    deck.slots[4]?.unit?.entity_id || "",
    (deck.name || "").replace(new RegExp(DELIMITER, 'g'), "").replace(new RegExp(TEAM_DELIMITER, 'g'), "").substring(0, MAX_NAME_LENGTH)
  ];
  
  const packed = ids.join(DELIMITER);
  return LZString.compressToEncodedURIComponent(packed);
}

function decodeDeck(hash: string): DecodedDeckData | null {
  try {
    const packed = LZString.decompressFromEncodedURIComponent(hash);
    if (!packed) return null;
    
    const parts = packed.split(DELIMITER);
    if (parts.length < 6) return null;

    return {
        spellcasterId: parts[0] || null,
        slotIds: parts.slice(1, 6).map(id => id || null),
        name: parts[6] || undefined
    };
  } catch (e) {
    return null;
  }
}

function getDeckIds(deck: Deck): string[] {
    return [
        deck.spellcaster?.spellcaster_id || "",
        deck.slots[0]?.unit?.entity_id || "",
        deck.slots[1]?.unit?.entity_id || "",
        deck.slots[2]?.unit?.entity_id || "",
        deck.slots[3]?.unit?.entity_id || "",
        deck.slots[4]?.unit?.entity_id || "",
        (deck.name || "").replace(new RegExp(DELIMITER, 'g'), "").replace(new RegExp(TEAM_DELIMITER, 'g'), "").substring(0, MAX_NAME_LENGTH)
    ];
}

function encodeTeam(decks: [Deck, Deck, Deck], name: string = ""): string {
    const deck1Ids = getDeckIds(decks[0]);
    const deck2Ids = getDeckIds(decks[1]);
    const deck3Ids = getDeckIds(decks[2]);
    
    const combined = [name.replace(new RegExp(DELIMITER, 'g'), ""), ...deck1Ids, ...deck2Ids, ...deck3Ids];
    const packed = combined.join(DELIMITER);
    return TEAM_V2_PREFIX + LZString.compressToEncodedURIComponent(packed);
}

function decodeTeam(hash: string): { name: string, decks: (DecodedDeckData | null)[] } {
    if (!hash) return { name: "", decks: [null, null, null] };
    const cleanHash = hash.replace(/ /g, '+');

    if (cleanHash.startsWith(TEAM_V2_PREFIX)) {
        try {
            const payload = cleanHash.slice(TEAM_V2_PREFIX.length);
            const packed = LZString.decompressFromEncodedURIComponent(payload);
            
            if (!packed) return { name: "", decks: [null, null, null] };

            const parts = packed.split(DELIMITER);
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
                    slotIds: slice.slice(1, 6).map(id => id || null),
                    name: slice[6] || undefined
                });
            }
            
            return { name: teamName, decks: results };
        } catch (e) {
            return { name: "", decks: [null, null, null] };
        }
    }
    return { name: "", decks: [null, null, null] }; // Fallback
}

// --- TEST EXECUTION ---

console.log("--- Testing LZ String Sanitization (Standalone) ---");

const dirtyDeckName = `Evil${DELIMITER}Deck${TEAM_DELIMITER}Name`;
const deck: Deck = {
    name: dirtyDeckName,
    spellcaster: { spellcaster_id: "sc_1" },
    slots: [
        { unit: { entity_id: "u_1" } }, 
        { unit: { entity_id: "u_2" } }, 
        { unit: { entity_id: "u_3" } }, 
        { unit: { entity_id: "u_4" } }, 
        { unit: { entity_id: "u_5" } }
    ]
};

// 1. Deck Encoding
const encodedDeck = encodeDeck(deck);
const decodedDeck = decodeDeck(encodedDeck);

console.log(`Original Name: ${JSON.stringify(dirtyDeckName)}`);
console.log(`Decoded Name:  ${JSON.stringify(decodedDeck?.name)}`);

if (decodedDeck?.name === "EvilDeckName") {
    console.log("PASS: Deck name sanitized.");
} else {
    console.error("FAIL: Deck name NOT sanitized correctly.");
}

// 2. Team Encoding
const dirtyTeamName = `Bad${DELIMITER}Team`;
const encodedTeam = encodeTeam([deck, deck, deck], dirtyTeamName);
const decodedTeam = decodeTeam(encodedTeam);

console.log(`Original Team Name: ${JSON.stringify(dirtyTeamName)}`);
console.log(`Decoded Team Name:  ${JSON.stringify(decodedTeam.name)}`);

if (decodedTeam.name === "BadTeam") {
    console.log("PASS: Team name sanitized.");
} else {
    console.error("FAIL: Team name NOT sanitized correctly.");
}
