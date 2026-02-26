import { describe, expect, it, vi } from "vitest";

import { reconstructDeck } from "@/services/api/persistence";

import { ReconstructionService } from "../reconstruction";

vi.mock("@/services/api/persistence", () => ({
  reconstructDeck: vi.fn(),
}));

describe("reconstruction.ts", () => {
  describe("reconstructTeam", () => {
    it("should return empty team if decks array is empty", () => {
      const decodedTeam = { decks: [], name: "My Team" };
      const team = ReconstructionService.reconstructTeam(
        decodedTeam as any,
        [],
        []
      );

      expect(team.decks).toHaveLength(0);
      expect(team.name).toBe("My Team");
    });

    it("should fallback to 'Imported Team' if name is missing", () => {
      const decodedTeam = { decks: [] };
      const team = ReconstructionService.reconstructTeam(
        decodedTeam as any,
        [],
        []
      );
      expect(team.name).toBe("Imported Team");
    });

    it("should process at most 3 decks", () => {
      (reconstructDeck as ReturnType<typeof vi.fn>).mockReturnValue({
        name: "Mock Deck",
        slots: [],
      });

      const decodedTeam = {
        decks: [
          { name: "D1", slotIds: [], spellcasterId: null },
          { name: "D2", slotIds: [], spellcasterId: null },
          { name: "D3", slotIds: [], spellcasterId: null },
          { name: "D4", slotIds: [], spellcasterId: null }, // Should be ignpored
        ],
      };

      const team = ReconstructionService.reconstructTeam(
        decodedTeam as any,
        [],
        []
      );
      expect(team.decks).toHaveLength(3);
      expect(reconstructDeck).toHaveBeenCalledTimes(3);
    });

    it("should skip null deck entries", () => {
      (reconstructDeck as ReturnType<typeof vi.fn>).mockReturnValue({
        slots: [],
      });

      const decodedTeam = {
        decks: [
          { name: "D1", slotIds: [], spellcasterId: null },
          null,
          { name: "D3", slotIds: [], spellcasterId: null },
        ],
      };

      const team = ReconstructionService.reconstructTeam(
        decodedTeam as any,
        [],
        []
      );

      // Should only process the 2 non-null decks
      expect(team.decks).toHaveLength(2);
    });

    it("should pad slotIds to 5 with nulls if fewer are provided", () => {
      (reconstructDeck as ReturnType<typeof vi.fn>).mockImplementation(
        (storedDeck) => {
          expect(storedDeck.slotIds).toHaveLength(5);
          expect(storedDeck.slotIds).toEqual(["u1", "u2", null, null, null]);
          return { name: storedDeck.name, slots: [] };
        }
      );

      const decodedTeam = {
        decks: [{ name: "D1", slotIds: ["u1", "u2"], spellcasterId: null }],
      };

      ReconstructionService.reconstructTeam(decodedTeam as any, [], []);
    });

    it("should normalize empty string IDs to null", () => {
      (reconstructDeck as ReturnType<typeof vi.fn>).mockImplementation(
        (storedDeck) => {
          expect(storedDeck.slotIds[0]).toBeNull();
          expect(storedDeck.spellcasterId).toBeNull();
          return { name: storedDeck.name, slots: [] };
        }
      );

      const decodedTeam = {
        decks: [{ name: "D1", slotIds: [""], spellcasterId: "" }],
      };

      ReconstructionService.reconstructTeam(decodedTeam as any, [], []);
    });

    it("should treat missing slotIds array as an array of 5 nulls", () => {
      (reconstructDeck as ReturnType<typeof vi.fn>).mockImplementation(
        (storedDeck) => {
          expect(storedDeck.slotIds).toHaveLength(5);
          expect(storedDeck.slotIds.every((id: any) => id === null)).toBe(true);
          return { name: storedDeck.name, slots: [] };
        }
      );

      const decodedTeam = {
        decks: [{ name: "D1", spellcasterId: null }], // No slotIds field
      };

      ReconstructionService.reconstructTeam(decodedTeam as any, [], []);
    });

    it("should fallback to 'Imported Deck' if deck name is missing", () => {
      (reconstructDeck as ReturnType<typeof vi.fn>).mockImplementation(
        (storedDeck) => {
          expect(storedDeck.name).toBe("Imported Deck");
          return { name: storedDeck.name, slots: [] };
        }
      );

      const decodedTeam = {
        decks: [
          { slotIds: ["u1", null, null, null, "t1"], spellcasterId: null },
        ],
      };

      // Ensure that missing `name` in deck yields 'Imported Deck'
      ReconstructionService.reconstructTeam(decodedTeam as any, [], []);
    });
  });
});
