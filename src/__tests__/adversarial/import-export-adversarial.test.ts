// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { TeamFactory } from "@/services/domain/team/TeamFactory";
import { downloadTeamJson } from "@/services/infrastructure/export-service";
import { cloneDeck } from "@/services/utils/deck-utils";
import { useDeckStore } from "@/store/index";
import { Deck, Team } from "@/types/deck";

describe("Phase 2 — Import/Export Service Adversarial Tests", () => {
  beforeEach(() => {
    // Reset store
    useDeckStore.setState({
      currentDeck: cloneDeck(INITIAL_DECK),
      savedDecks: [],
      pendingImport: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("downloadTeamJson Adversarial", () => {
    let dummyAnchor: HTMLAnchorElement;
    beforeEach(() => {
      global.URL.createObjectURL = vi.fn().mockReturnValue("blob:test");
      global.URL.revokeObjectURL = vi.fn();

      dummyAnchor = {
        href: "",
        download: "",
        click: vi.fn(),
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") return dummyAnchor;
        return document.createElement(tag);
      });
      vi.spyOn(document.body, "appendChild").mockImplementation(
        () => dummyAnchor
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(
        () => dummyAnchor
      );
    });

    it("ADV-IE-1: downloadTeamJson with XSS filenames", () => {
      // Expect sanitization to lower-case and replace spaces with hyphens, but what about script tags?
      const xssName = "<script>alert(1)</script> File";
      downloadTeamJson([] as any, xssName);

      // Stricter sanitization strips out `<` and `>`
      expect(dummyAnchor.download).toBe("scriptalert1script-file.json");
    });

    it("ADV-IE-2: downloadTeamJson with null/undefined teamName", () => {
      downloadTeamJson([] as any, null as any);
      expect(dummyAnchor.download).toBe("untitled-team.json");

      downloadTeamJson([] as any, undefined as any);
      expect(dummyAnchor.download).toBe("untitled-team.json");
    });

    it("ADV-IE-3: downloadTeamJson with circular structures", () => {
      const deckA: any = { name: "Circ A" };
      const deckB: any = { name: "Circ B" };
      deckA.ref = deckB;
      deckB.ref = deckA; // Circular reference

      expect(() => {
        downloadTeamJson([deckA] as any, "Test");
      }).toThrowError(TypeError); // JSON.stringify crash
    });
  });

  describe("TeamFactory Adversarial", () => {
    it("ADV-IE-4: prepareImportedTeam with 0 decks", () => {
      const result = TeamFactory.prepareImportedTeam([], [], "Test");
      expect(result.teamDecks).toHaveLength(0); // If 0, UI might break down the line requiring exactly 3 decks.
    });

    it("ADV-IE-5: prepareImportedTeam with mismatched newIds length", () => {
      const decks = [
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
      ] as Deck[];
      // Missing exactly 1 ID
      const result = TeamFactory.prepareImportedTeam(decks, ["id-1"], "Test");

      expect(result.teamDecks).toHaveLength(2);
      expect(result.teamDecks[0].id).toBe("id-1");
      expect(result.teamDecks[1].id).toBeDefined(); // Fallback generates a new uuid
    });

    it("ADV-IE-6: prepareImportedTeam with undefined baseName", () => {
      const result = TeamFactory.prepareImportedTeam(
        [cloneDeck(INITIAL_DECK)],
        ["new"],
        undefined as any
      );
      expect(result.teamName).toBe("Untitled Team (Copy)");
    });

    it("ADV-IE-7: constructTeam with activeSlot out of bounds", () => {
      const OUT_OF_BOUNDS_SLOT = 99;
      const emptyDecks = TeamFactory.createInitialTeamDecks();
      // activeSlot: 99 is invalid. TeamFactory has activeSlot < TEAM_LIMIT check.
      const team = TeamFactory.constructTeam(
        "id-test",
        "Name",
        emptyDecks,
        OUT_OF_BOUNDS_SLOT,
        cloneDeck(INITIAL_DECK)
      );
      // Should ignore the out-of-bounds index completely.
      expect((team.decks as any[])[OUT_OF_BOUNDS_SLOT]).toBeUndefined();
      expect(team.decks.length).toBe(3);
    });

    it("ADV-IE-8: duplicateTeam with empty existingNames and no team name", () => {
      const team = { id: "1", name: "", decks: [] } as unknown as Team;
      const result = TeamFactory.duplicateTeam(team, "2", []);
      // Fallback is "Untitled Team" + ` (Copy)`
      expect(result.name).toBe("Untitled Team");
    });
  });

  describe("resolvePendingImport Adversarial (createUISlice)", () => {
    it("ADV-IE-9: resolvePendingImport with garbage strategy string", () => {
      const { resolvePendingImport } = useDeckStore.getState();
      useDeckStore.setState({ pendingImport: cloneDeck(INITIAL_DECK) as any });

      // Passing random string
      resolvePendingImport("YOLO" as any);

      const state = useDeckStore.getState();
      // Because "YOLO" isn't "OVERWRITE" or "SAVE_AND_OVERWRITE", it shouldn't setDeck or saveDeck.
      // But it sets pendingImport to null regardless.
      expect(state.pendingImport).toBeNull();
    });

    it("ADV-IE-10: resolvePendingImport when pendingImport is null", () => {
      const { resolvePendingImport } = useDeckStore.getState();

      resolvePendingImport("OVERWRITE");

      const state = useDeckStore.getState();
      expect(state.pendingImport).toBeNull(); // No-op, no crash
    });

    it("ADV-IE-11: resolvePendingImport SAVE_AND_OVERWRITE when currentDeck has no name", () => {
      const { resolvePendingImport } = useDeckStore.getState();

      const current = cloneDeck(INITIAL_DECK);
      current.name = "";
      useDeckStore.setState({
        currentDeck: current,
        pendingImport: { ...cloneDeck(INITIAL_DECK), name: "Import" } as any,
      });

      resolvePendingImport("SAVE_AND_OVERWRITE");

      const state = useDeckStore.getState();
      // Should have fallen back to "Untitled Deck" and saved
      expect(state.savedDecks.length).toBe(1);
      expect(state.savedDecks[0].name).toBe("Untitled Deck");
      expect(state.currentDeck.name).toBe("Import");
      expect(state.pendingImport).toBeNull();
    });
  });
});
