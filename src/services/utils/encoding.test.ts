import LZString from "lz-string";
import { describe, expect, it } from "vitest";

import { Spellcaster, Unit } from "@/types/api";
import { Deck, DeckSlot } from "@/types/deck";

import { decodeDeck, decodeTeam, encodeDeck, encodeTeam } from "./encoding";

// Mock helpers
const mockUnit = (id: string, category: string = "Creature") =>
  ({
    entity_id: id,
    category,
    name: `Unit ${id}`,
    description: "desc",
    rank: "I",
    health: 100,
    tags: [],
    magic_school: "Fire",
  }) as unknown as Unit;

const mockDeck = (
  id: string,
  name: string,
  spellcasterId: string,
  unitIds: string[]
): Deck => ({
  id,
  name,
  spellcaster: {
    spellcaster_id: spellcasterId,
    name: "Caster",
    category: "Spellcaster",
  } as Spellcaster,
  slots: [
    {
      index: 0,
      unit: unitIds[0] ? mockUnit(unitIds[0]) : null,
      allowedTypes: ["UNIT"],
    } as DeckSlot,
    {
      index: 1,
      unit: unitIds[1] ? mockUnit(unitIds[1]) : null,
      allowedTypes: ["UNIT"],
    } as DeckSlot,
    {
      index: 2,
      unit: unitIds[2] ? mockUnit(unitIds[2]) : null,
      allowedTypes: ["UNIT"],
    } as DeckSlot,
    {
      index: 3,
      unit: unitIds[3] ? mockUnit(unitIds[3]) : null,
      allowedTypes: ["UNIT"],
    } as DeckSlot,
    {
      index: 4,
      unit: unitIds[4] ? mockUnit(unitIds[4], "Titan") : null,
      allowedTypes: ["TITAN"],
    } as DeckSlot,
  ],
});

describe("Deck Encoding", () => {
  it("should round-trip a complete deck", () => {
    const original = mockDeck("d1", "My Deck", "sc1", [
      "u1",
      "u2",
      "u3",
      "u4",
      "t1",
    ]);
    const encoded = encodeDeck(original);
    const decoded = decodeDeck(encoded);

    expect(decoded).toEqual({
      spellcasterId: "sc1",
      slotIds: ["u1", "u2", "u3", "u4", "t1"],
      name: "My Deck",
    });
  });

  it("should handle partial decks", () => {
    const original = mockDeck("d2", "Incomplete", "sc1", [
      "u1",
      "",
      "",
      "",
      "",
    ]);
    const encoded = encodeDeck(original);
    const decoded = decodeDeck(encoded);

    expect(decoded).toEqual({
      spellcasterId: "sc1",
      slotIds: ["u1", null, null, null, null],
      name: "Incomplete",
    });
  });

  it("should not crash if deck.slots is undefined", () => {
    // Simulate a corrupted deck from local storage
    const corruptedDeck = {
      id: "d3",
      name: "Corrupt",
      spellcaster: { spellcaster_id: "sc1" },
      slots: undefined as any,
    } as Deck;

    const encoded = encodeDeck(corruptedDeck);
    const decoded = decodeDeck(encoded);

    expect(decoded).toEqual({
      spellcasterId: "sc1",
      slotIds: [null, null, null, null, null],
      name: "Corrupt",
    });
  });

  it("should enforce a maximum name length on decode (DoS mitigation)", () => {
    // Generate a payload with a massive name to simulate a zip bomb
    const original = mockDeck("d4", "A".repeat(100_000), "sc1", []);

    const encoded = encodeDeck(original);
    // Directly mutate the uncompressed payload to bypass the encode truncated check
    // Wait, let's just create an encoded string manually
    const DELIMITER = "\x1F";
    const maliciousPayload = `sc1${DELIMITER}${DELIMITER}${DELIMITER}${DELIMITER}${DELIMITER}${DELIMITER}${"A".repeat(100_000)}`;

    const maliciousEncoded =
      LZString.compressToEncodedURIComponent(maliciousPayload);

    const decoded = decodeDeck(maliciousEncoded);

    // Name should be truncated to 50 characters, preventing DoS
    expect(decoded?.name?.length).toBeLessThanOrEqual(50);
    expect(decoded?.name).toBe("A".repeat(50));
  });

  it("should strip delimiter characters from the deck name", () => {
    const original = mockDeck("d5", "Name\x1FWith~Delimiters", "sc1", []);
    const encoded = encodeDeck(original);
    const decoded = decodeDeck(encoded);

    expect(decoded?.name).toBe("NameWithDelimiters");
  });

  it("should sanitize HTML/XSS payloads from deck names", () => {
    const original = mockDeck(
      "xss-deck",
      "<script>alert(1)</script>BadName",
      "sc1",
      []
    );
    const encoded = encodeDeck(original);
    const decoded = decodeDeck(encoded);

    // Tags should be completely stripped
    expect(decoded?.name).toBe("alert(1)BadName");
  });

  it("should truncate deck names that are exactly 50 or more characters", () => {
    const exactly50 = mockDeck("d6", "A".repeat(50), "sc1", []);
    const over50 = mockDeck("d7", "B".repeat(60), "sc1", []);

    expect(decodeDeck(encodeDeck(exactly50))?.name).toBe("A".repeat(50));
    expect(decodeDeck(encodeDeck(over50))?.name).toBe("B".repeat(50));
  });

  it("should return null when decoding empty or garbage input", () => {
    expect(decodeDeck("")).toBeNull();
    expect(decodeDeck("garbage!@#$")).toBeNull();
  });

  it("should return null if the decompressed payload has fewer than 6 parts", () => {
    const DELIMITER = "\x1F";
    // Construct a payload with 5 parts instead of 6 or 7
    const truncatedPayload = `sc1${DELIMITER}u1${DELIMITER}u2${DELIMITER}u3${DELIMITER}u4`;
    const encoded = LZString.compressToEncodedURIComponent(truncatedPayload);

    expect(decodeDeck(encoded)).toBeNull();
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

  it("should not crash if team decks have undefined slots", () => {
    const corruptDeck1 = {
      spellcaster: { spellcaster_id: "sc1" },
      slots: undefined as any,
      name: "D1",
    } as Deck;
    const corruptDeck2 = {
      spellcaster: { spellcaster_id: "sc2" },
      slots: undefined as any,
      name: "D2",
    } as Deck;
    const corruptDeck3 = {
      spellcaster: { spellcaster_id: "sc3" },
      slots: undefined as any,
      name: "D3",
    } as Deck;

    const encoded = encodeTeam(
      [corruptDeck1, corruptDeck2, corruptDeck3],
      "Corrupt Team"
    );
    const decoded = decodeTeam(encoded);

    expect(decoded.name).toBe("Corrupt Team");
    expect(decoded.decks[0]?.slotIds).toEqual([null, null, null, null, null]);
  });

  it("should enforce a maximum name length on decodeTeam (DoS mitigation)", () => {
    const DELIMITER = "\x1F";
    const maliciousName = "T".repeat(100_000);
    const maliciousDeckName = "D".repeat(100_000);

    // Construct fake flattened payload
    // format: name ~ [deck1 7 items] ~ [deck2 7 items] ~ [deck3 7 items]
    const emptyDeckParts = ["sc", "", "", "", "", "", maliciousDeckName].join(
      DELIMITER
    );
    const payload = [
      maliciousName,
      emptyDeckParts,
      emptyDeckParts,
      emptyDeckParts,
    ].join(DELIMITER);

    const maliciousEncoded =
      "v2~" + LZString.compressToEncodedURIComponent(payload);

    const decoded = decodeTeam(maliciousEncoded);

    expect(decoded.name.length).toBeLessThanOrEqual(50);
    expect(decoded.name).toBe("T".repeat(50));

    expect(decoded.decks[0]?.name?.length).toBeLessThanOrEqual(50);
    expect(decoded.decks[0]?.name).toBe("D".repeat(50));
  });

  it("should handle empty or missing team hashes gracefully", () => {
    const defaultStructure = { name: "", decks: [null, null, null] };
    expect(decodeTeam("")).toEqual(defaultStructure);
    // @ts-expect-error Testing invalid input gracefully handled
    expect(decodeTeam(null)).toEqual(defaultStructure);
  });

  it("should strip team delimiter (tilde) characters from the team name during encode", () => {
    const d1 = mockDeck("d1", "D1", "sc1", []);
    const encoded = encodeTeam([d1, d1, d1], "Team~Name~Here");
    const decoded = decodeTeam(encoded);

    expect(decoded.name).not.toContain("~");
    expect(decoded.name).toBe("TeamNameHere");
  });

  it("should enforce a strict limit of 3 decks on V1 legacy decode to prevent DoS", () => {
    // A malicious V1 payload could contain thousands of tildes
    const maliciousPayload = "~".repeat(1000);
    const decoded = decodeTeam(maliciousPayload);

    // Should not crash and should cap the decks array at exactly 3 items
    expect(decoded.decks).toHaveLength(3);
  });

  it("should handle corrupted V2 payloads gracefully", () => {
    const defaultStructure = { name: "", decks: [null, null, null] };
    expect(decodeTeam("v2~garbageDataThatCannotBeDecompressed")).toEqual(
      defaultStructure
    );
  });

  it("should clean up URL space characters replacing pluses in V2 hashes", () => {
    // Some older Next.js or email clients replace '+' with ' ' in URLs.
    const validTeam = encodeTeam(
      [
        mockDeck("d1", "D1", "sc1", []),
        mockDeck("d2", "D2", "sc2", []),
        mockDeck("d3", "D3", "sc3", []),
      ],
      "TeamSpace"
    );
    const corruptedSpaceHash = validTeam.replace(/\+/g, " ");

    const decoded = decodeTeam(corruptedSpaceHash);
    expect(decoded.name).toBe("TeamSpace");
    expect(decoded.decks[0]?.name).toBe("D1");
  });
});
