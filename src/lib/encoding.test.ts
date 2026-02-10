import { describe, it, expect } from "vitest";
import { encodeDeck, decodeDeck, encodeTeam, decodeTeam } from "./encoding";
import { Deck, DeckSlot } from "@/types/deck";
import LZString from "lz-string";

// Mock helpers
const mockUnit = (id: string, category: string = "Creature") => ({
  entity_id: id,
  category,
  name: `Unit ${id}`,
  description: "desc",
  rank: "I",
  health: 100,
  tags: [],
  magic_school: "Fire"
} as any);

const mockDeck = (id: string, name: string, spellcasterId: string, unitIds: string[]): Deck => ({
  id,
  name,
  spellcaster: { spellcaster_id: spellcasterId, name: "Caster", category: "Spellcaster" } as any,
  slots: [
      { index: 0, unit: unitIds[0] ? mockUnit(unitIds[0]) : null, allowedTypes: ["UNIT"] } as DeckSlot,
      { index: 1, unit: unitIds[1] ? mockUnit(unitIds[1]) : null, allowedTypes: ["UNIT"] } as DeckSlot,
      { index: 2, unit: unitIds[2] ? mockUnit(unitIds[2]) : null, allowedTypes: ["UNIT"] } as DeckSlot,
      { index: 3, unit: unitIds[3] ? mockUnit(unitIds[3]) : null, allowedTypes: ["UNIT"] } as DeckSlot,
      { index: 4, unit: unitIds[4] ? mockUnit(unitIds[4], "Titan") : null, allowedTypes: ["TITAN"] } as DeckSlot,
  ],
});

describe("Deck Encoding", () => {
  it("should round-trip a complete deck", () => {
    const original = mockDeck("d1", "My Deck", "sc1", ["u1", "u2", "u3", "u4", "t1"]);
    const encoded = encodeDeck(original);
    const decoded = decodeDeck(encoded);

    expect(decoded).toEqual({
      spellcasterId: "sc1",
      slotIds: ["u1", "u2", "u3", "u4", "t1"],
      name: "My Deck",
    });
  });

  it("should handle partial decks", () => {
    const original = mockDeck("d2", "Incomplete", "sc1", ["u1", "", "", "", ""]);
    const encoded = encodeDeck(original);
    const decoded = decodeDeck(encoded);

    expect(decoded).toEqual({
      spellcasterId: "sc1",
      slotIds: ["u1", null, null, null, null],
      name: "Incomplete",
    });
  });
});

describe("Team Encoding", () => {
    it("should round-trip a team (V2 format)", () => {
        const d1 = mockDeck("d1", "P1", "sc1", ["u1"]);
        const d2 = mockDeck("d2", "P2", "sc2", ["u2"]);
        const d3 = mockDeck("d3", "P3", "sc3", ["u3"]);
        const teamName = "Dream Team";

        const encoded = encodeTeam([d1, d2, d3], teamName);
        const decoded = decodeTeam(encoded);

        // Expect V2 prefix
        expect(encoded.startsWith("v2~")).toBe(true);

        expect(decoded.name).toBe(teamName);
        expect(decoded.decks).toHaveLength(3);
        
        expect(decoded.decks[0]?.spellcasterId).toBe("sc1");
        expect(decoded.decks[2]?.slotIds[0]).toBe("u3");
    });

    it("should correctly decode a Legacy V1 Team string", () => {
        // V1 Format: DeckHash ~ DeckHash ~ DeckHash (No V2 prefix, individually compressed)
        // We'll manually construct this using encodeDeck logic
        const d1 = mockDeck("d1", "Legacy1", "sc1", ["u1"]);
        const d2 = mockDeck("d2", "Legacy2", "sc2", ["u2"]);
        const d3 = mockDeck("d3", "Legacy3", "sc3", ["u3"]);

        const hash1 = encodeDeck(d1);
        const hash2 = encodeDeck(d2);
        const hash3 = encodeDeck(d3);

        const v1String = `${hash1}~${hash2}~${hash3}`;
        
        const decoded = decodeTeam(v1String);

        // V1 didn't store a global team name
        expect(decoded.name).toBe(""); 
        expect(decoded.decks).toHaveLength(3);
        expect(decoded.decks[0]?.name).toBe("Legacy1");
        expect(decoded.decks[1]?.spellcasterId).toBe("sc2");
        expect(decoded.decks[2]?.slotIds[0]).toBe("u3");
    });
});
