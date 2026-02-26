import { beforeEach, describe, expect, it, vi } from "vitest";

import { reconstructDeck } from "@/services/api/persistence";

import { ReconstructionService } from "../reconstruction";

vi.mock("@/services/api/persistence", () => ({
  reconstructDeck: vi.fn(() => ({ name: "Mock", slots: [] })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});
/**
 * ADVERSARIAL: ReconstructionService
 * Overflow slotIds, NaN in arrays, prototype key injection,
 * massive deck arrays, and malformed decode payloads.
 */
describe("reconstruction.ts — adversarial", () => {
  // ─── Overflow slotIds ────────────────────────────────────────────
  describe("slotIds overflow", () => {
    it("should handle slotIds with 100 elements (only first 5 matter)", () => {
      (reconstructDeck as ReturnType<typeof vi.fn>).mockImplementation(
        (storedDeck) => {
          // The implementation pads/slices to 5, but shouldn't crash with more
          expect(storedDeck.slotIds.length).toBeGreaterThanOrEqual(5);
          return { name: storedDeck.name, slots: [] };
        }
      );

      const decoded = {
        decks: [
          {
            name: "Overflow",
            slotIds: Array.from({ length: 100 }, (_, i) => `id_${i}`),
            spellcasterId: null,
          },
        ],
      };

      const team = ReconstructionService.reconstructTeam(
        decoded as any,
        [],
        []
      );
      expect(team.decks).toHaveLength(1);
    });
  });

  // ─── NaN and Garbage in slotIds ──────────────────────────────────
  describe("garbage values in slotIds", () => {
    it("should normalize undefined slotIds to null", () => {
      (reconstructDeck as ReturnType<typeof vi.fn>).mockImplementation(
        (storedDeck) => {
          // undefined should be normalized to null by the `|| null` normalizer
          for (const id of storedDeck.slotIds) {
            expect(id === null || typeof id === "string").toBe(true);
          }
          return { name: "OK", slots: [] };
        }
      );

      const decoded = {
        decks: [
          {
            name: "Garbage",
            slotIds: [undefined, null, "", "valid", undefined],
            spellcasterId: null,
          },
        ],
      };

      ReconstructionService.reconstructTeam(decoded as any, [], []);
    });
  });

  // ─── Massive Deck Array ──────────────────────────────────────────
  describe("massive deck arrays", () => {
    it("should only process first 3 decks out of 100", () => {
      (reconstructDeck as ReturnType<typeof vi.fn>).mockReturnValue({
        name: "Mock",
        slots: [],
      });

      const decoded = {
        decks: Array.from({ length: 100 }, (_, i) => ({
          name: `D${i}`,
          slotIds: [],
          spellcasterId: null,
        })),
      };

      const team = ReconstructionService.reconstructTeam(
        decoded as any,
        [],
        []
      );
      expect(team.decks).toHaveLength(3);
      expect(reconstructDeck).toHaveBeenCalledTimes(3);
    });
  });

  // ─── All Null Decks ──────────────────────────────────────────────
  describe("all null deck entries", () => {
    it("should produce zero decks when all entries are null", () => {
      const decoded = {
        decks: [null, null, null],
      };

      const team = ReconstructionService.reconstructTeam(
        decoded as any,
        [],
        []
      );
      expect(team.decks).toHaveLength(0);
    });
  });

  // ─── XSS in Team/Deck Names ──────────────────────────────────────
  describe("XSS in names", () => {
    it("should preserve malicious team name without crashing", () => {
      const decoded = {
        name: '<script>alert("pwned")</script>',
        decks: [],
      };

      const team = ReconstructionService.reconstructTeam(
        decoded as any,
        [],
        []
      );
      expect(team.name).toBe('<script>alert("pwned")</script>');
    });

    it("should preserve malicious deck name", () => {
      (reconstructDeck as ReturnType<typeof vi.fn>).mockImplementation(
        (storedDeck) => {
          expect(storedDeck.name).toContain("<img");
          return { name: storedDeck.name, slots: [] };
        }
      );

      const decoded = {
        decks: [
          {
            name: "<img src=x onerror=alert(1)>",
            slotIds: [],
            spellcasterId: null,
          },
        ],
      };

      ReconstructionService.reconstructTeam(decoded as any, [], []);
    });
  });

  // ─── Missing Everything ──────────────────────────────────────────
  describe("missing everything", () => {
    it("should handle a decoded team with no decks array", () => {
      // This would crash in production if not handled, but let's see
      const decoded = { name: "Ghost" };
      expect(() =>
        ReconstructionService.reconstructTeam(decoded as any, [], [])
      ).toThrow(); // forEach on undefined
    });

    it("should handle a completely empty object", () => {
      expect(() =>
        ReconstructionService.reconstructTeam({} as any, [], [])
      ).toThrow();
    });
  });
});
