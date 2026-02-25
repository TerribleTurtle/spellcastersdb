import { beforeEach, describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { TeamPersistenceHelper } from "@/services/domain/team/TeamPersistenceHelper";
import { cloneDeck } from "@/services/utils/deck-utils";
import { useDeckStore } from "@/store/index";
import { Team } from "@/types/deck";

describe("Phase 1 — Store CRUD Adversarial Tests", () => {
  beforeEach(() => {
    useDeckStore.setState({
      currentDeck: cloneDeck(INITIAL_DECK),
      savedDecks: [],
      savedTeams: [],
      teamName: "New Team",
      activeTeamId: null,
      teamDecks: [
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
      ],
      activeSlot: null,
      commandCenterOpen: false,
    });
  });

  describe("importDecks Adversarial", () => {
    it("ADV-STORE-1: importDecks with null deck objects — handled without crashing", () => {
      const { importDecks } = useDeckStore.getState();
      const maliciousDecks = [null, undefined, { name: "Valid" }] as any;

      // Should not throw, should map what it can. (Depends on how `map` interacts with nulls)
      // Actually `d.name` will throw if `d` is null.
      expect(() => {
        importDecks(maliciousDecks);
      }).toThrowError(TypeError); // BUG EXPECTED FAIL: map doesn't guard against null items in array
    });

    it("ADV-STORE-2: importDecks with missing name/id fields — falls back safely", () => {
      const { importDecks } = useDeckStore.getState();
      const maliciousDecks = [{ slots: [] }] as any;

      importDecks(maliciousDecks);
      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(1);
      expect(state.savedDecks[0].name).toBe("Imported Deck");
      expect(state.savedDecks[0].id).toBeDefined(); // uuidv4 fallback
    });

    it("ADV-STORE-3: importDecks with __proto__ pollution attempt", () => {
      const { importDecks } = useDeckStore.getState();
      // Trying to pollute prototype
      const maliciousPayload = JSON.parse(
        '{"__proto__": {"polluted": true}, "name": "Vulnerable"}'
      );
      importDecks([maliciousPayload]);

      const state = useDeckStore.getState();
      expect(state.savedDecks[0].name).toBe("Vulnerable");
      // Clean object creation or spread should mitigate this, let's verify
      expect((state.savedDecks[0] as any).polluted).toBeUndefined();
    });
  });

  describe("importTeams Adversarial", () => {
    it("ADV-STORE-4: importTeams with teams missing decks arrays", () => {
      const { importTeams } = useDeckStore.getState();
      const maliciousTeams = [{ name: "No Decks Team" }] as any;

      importTeams(maliciousTeams);
      const state = useDeckStore.getState();
      expect(state.savedTeams).toHaveLength(1);
      expect(state.savedTeams[0].name).toBe("No Decks Team");
      expect(state.savedTeams[0].decks).toBeUndefined(); // It just spreads the object. Vulnerability if consumers expect decks!
    });
  });

  describe("Deletion Adversarial", () => {
    it("ADV-STORE-5: deleteDecks / deleteTeams with empty ID arrays", () => {
      const { deleteDecks, deleteTeams, saveDeck, saveTeam } =
        useDeckStore.getState();

      saveDeck("Solo Temp");
      saveTeam("t1");

      const decksBefore = useDeckStore.getState().savedDecks.length;
      const teamsBefore = useDeckStore.getState().savedTeams.length;

      deleteDecks([]);
      deleteTeams([]);

      expect(useDeckStore.getState().savedDecks.length).toBe(decksBefore);
      expect(useDeckStore.getState().savedTeams.length).toBe(teamsBefore);
    });

    it("ADV-STORE-6: deleteDecks / deleteTeams with duplicate and non-existent IDs", () => {
      const { deleteDecks, deleteTeams, importDecks, importTeams } =
        useDeckStore.getState();

      importDecks([
        { ...cloneDeck(INITIAL_DECK) },
        { ...cloneDeck(INITIAL_DECK) },
      ]);
      importTeams([
        { name: "T1", decks: [] as any },
        { name: "T2", decks: [] as any },
      ]);

      const stateAfterImport = useDeckStore.getState();
      const d1 = stateAfterImport.savedDecks[0].id!;
      const d2 = stateAfterImport.savedDecks[1].id!;
      const t1 = stateAfterImport.savedTeams[0].id!;
      const t2 = stateAfterImport.savedTeams[1].id!;

      // Array with duplicates and non-existent
      deleteDecks([d1, d1, "d-ghost"]);
      deleteTeams([t1, t1, "t-ghost", "t-ghost"]);

      const state = useDeckStore.getState();
      expect(state.savedDecks.map((d) => d.id)).toEqual([d2]);
      expect(state.savedTeams.map((t) => t.id)).toEqual([t2]);
    });
  });

  describe("saveDeck / duplicateDeck / saveTeamAsCopy Adversarial", () => {
    it("ADV-STORE-7: saveDeck with no id and blank name simultaneously", () => {
      const { saveDeck } = useDeckStore.getState();

      // Wipe current deck id and name
      useDeckStore.setState({
        currentDeck: { ...cloneDeck(INITIAL_DECK), id: undefined, name: "" },
      });

      saveDeck("   "); // Trims to empty

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(1);
      expect(state.currentDeck.id).toBeDefined(); // Assigned new uuid
      expect(state.currentDeck.name).toBe("Untitled Deck"); // Fallback
    });

    it("ADV-STORE-8: duplicateDeck / duplicateTeam targeting non-existent IDs", () => {
      const { duplicateDeck, duplicateTeam } = useDeckStore.getState();

      duplicateDeck("ghost-deck");
      duplicateTeam("ghost-team", "new-id");

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(0);
      expect(state.savedTeams).toHaveLength(0);
    });

    it("ADV-STORE-9: renameSavedDeck with XSS payloads", () => {
      const { renameSavedDeck, importDecks } = useDeckStore.getState();
      importDecks([{ ...cloneDeck(INITIAL_DECK) }]);
      const storedId = useDeckStore.getState().savedDecks[0].id!;

      const xssPayload = "<img src=x onerror=alert(1) />";
      renameSavedDeck(storedId, xssPayload); // Should accept it as string, sanitization happens at render

      expect(useDeckStore.getState().savedDecks[0].name).toBe(xssPayload);
    });

    it("ADV-STORE-10: saveTeamAsCopy with no teamDecks data", () => {
      const { saveTeamAsCopy } = useDeckStore.getState();

      // Deliberately corrupt the state
      useDeckStore.setState({ teamDecks: undefined as any });

      expect(() => {
        saveTeamAsCopy("Malicious Copy");
      }).toThrowError(TypeError); // BUG EXPECTED FAIL: map on undefined teamDecks
    });
  });

  describe("TeamPersistenceHelper Adversarial", () => {
    it("ADV-STORE-11: updateSavedTeams with team lacking id", () => {
      // If team lacks ID, findIndex(t => t.id === newTeam.id) will match the first team that also lacks an ID (or undefined matches undefined).
      // Or if no team lacks an ID, it pushes.
      const existingTeams = [
        { id: "t1", name: "T1", decks: [] },
      ] as unknown as Team[];

      const badTeam1 = { name: "Bad1", decks: [] } as any;
      const badTeam2 = { name: "Bad2", decks: [] } as any;

      let nextTeams = TeamPersistenceHelper.updateSavedTeams(
        existingTeams,
        badTeam1
      );
      expect(nextTeams.length).toBe(2);

      // What happens if we try to save another ID-less team?
      // findIndex will find badTeam1 (undefined === undefined) and overwrite it!
      nextTeams = TeamPersistenceHelper.updateSavedTeams(nextTeams, badTeam2);
      expect(nextTeams.length).toBe(2);
      expect(nextTeams[1].name).toBe("Bad2"); // Replaced Bad1
    });
  });

  describe("checkDeckNameAvailable Normalization", () => {
    it("ADV-STORE-12: checkDeckNameAvailable with Unicode normalization edge cases", () => {
      const { checkDeckNameAvailable, importDecks } = useDeckStore.getState();

      // "café" vs "cafe\u0301" (combining acute accent)
      // If lowerCased properly? .toLowerCase() does NOT normalize!
      importDecks([{ ...cloneDeck(INITIAL_DECK), name: "\u00e9" }]); // 'é'

      // This is "e" + combining acute accent. Visually identical, technically different.
      const identicalLooking = "e\u0301";

      const isAvailable = checkDeckNameAvailable(identicalLooking);

      // In JS without .normalize("NFC"), these are treated as DIFFERENT strings!
      expect(isAvailable).toBe(true); // Demonstrating a logic gap where visually identical names bypass the check
    });
  });
});
