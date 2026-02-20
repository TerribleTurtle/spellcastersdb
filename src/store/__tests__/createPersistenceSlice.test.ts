import { beforeEach, describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { cloneDeck } from "@/services/utils/deck-utils";
import { Unit } from "@/types/api";
import { Deck } from "@/types/deck";
import { EntityCategory } from "@/types/enums";

import { useDeckStore } from "../index";

const MockUnit: Unit = {
  entity_id: "u1",
  name: "Test Unit",
  category: EntityCategory.Creature,
  rank: "I",
  description: "desc",
  magic_school: "Wild",
  tags: [],
  health: 10,
  damage: 10,
  movement_speed: 10,
  range: 1,
};

describe("createPersistenceSlice", () => {
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
    });
  });

  describe("saveDeck", () => {
    it("should save current deck", () => {
      const { saveDeck, setDeckName } = useDeckStore.getState();
      setDeckName("My Deck");

      saveDeck();

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(1);
      expect(state.savedDecks[0].name).toBe("My Deck");
      expect(state.savedDecks[0].id).toBeDefined();
      // Current deck should now have ID equal to saved ID
      expect(state.currentDeck.id).toBe(state.savedDecks[0].id);
    });

    it("should update existing deck if already saved", () => {
      const { saveDeck, setDeckName } = useDeckStore.getState();
      setDeckName("V1");
      saveDeck();
      const stateAfterFirstSave = useDeckStore.getState();
      const id = stateAfterFirstSave.currentDeck.id;

      setDeckName("V2");
      saveDeck();

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(1);
      expect(state.savedDecks[0].id).toBe(id);
      expect(state.savedDecks[0].name).toBe("V2");
    });
  });

  describe("duplicateDeck", () => {
    it("should duplicate a saved deck", () => {
      const { saveDeck, duplicateDeck, setDeckName } = useDeckStore.getState();
      setDeckName("Original");
      saveDeck();
      const originalId = useDeckStore.getState().currentDeck.id!;

      duplicateDeck(originalId);

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(2);

      const copy = state.savedDecks.find((d) => d.id !== originalId);
      expect(copy).toBeDefined();
      expect(copy?.name).toContain("(Copy)");
      // Should load the copy as current
      expect(state.currentDeck.id).toBe(copy?.id);
    });
  });

  describe("importDecks", () => {
    it("should import decks with new IDs", () => {
      const { importDecks } = useDeckStore.getState();
      const toImport: Deck[] = [
        { ...cloneDeck(INITIAL_DECK), name: "Import 1", id: "old1" },
        { ...cloneDeck(INITIAL_DECK), name: "Import 2", id: "old2" },
      ];

      importDecks(toImport);

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(2);
      expect(state.savedDecks[0].id).not.toBe("old1"); // UUID regenerated
      expect(state.savedDecks[1].id).not.toBe("old2");
      expect(state.savedDecks[0].name).toBe("Import 1");
    });
  });

  describe("saveTeamAsCopy", () => {
    it("should save team as a new copy", () => {
      // We need to properly initialize a team first
      const { saveTeam, saveTeamAsCopy, setTeamName, setTeamSlot } =
        useDeckStore.getState();

      setTeamName("Original Team");
      // Add data to verify deep clone
      const deck0 = useDeckStore.getState().teamDecks[0];
      deck0.slots[0].unit = MockUnit;
      // We must trigger update to teamDecks in store if we mutate it directly? no, Zustand proxied?
      // Ideally use setTeamSlot.
      setTeamSlot(0, 0, MockUnit);

      saveTeam("test-team-id"); // Save Original
      const originalId = useDeckStore.getState().activeTeamId!;

      saveTeamAsCopy("Copy Team");

      const state = useDeckStore.getState();
      expect(state.savedTeams).toHaveLength(2);

      const copyId = state.activeTeamId;
      expect(copyId).not.toBe(originalId);
      expect(state.teamName).toBe("Copy Team");

      // Check deep data capability
      expect(state.teamDecks[0].slots[0].unit).toEqual(MockUnit);
    });
  });

  describe("loadDeck", () => {
    it("should load deck and set as current", () => {
      const { saveDeck, setDeckName, loadDeck, clearDeck } =
        useDeckStore.getState();
      setDeckName("To Load");
      saveDeck();
      const id = useDeckStore.getState().currentDeck.id!;

      clearDeck();
      expect(useDeckStore.getState().currentDeck.name).not.toBe("To Load");

      loadDeck(id);
      expect(useDeckStore.getState().currentDeck.name).toBe("To Load");
      expect(useDeckStore.getState().currentDeck.id).toBe(id);
    });
  });
});
