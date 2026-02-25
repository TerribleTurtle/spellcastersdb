/**
 * Phase 4: Hook Integration Tests (Option A — Pure Store-Level)
 *
 * Tests the core logic exercised by React hooks (useDeckSync, useDataHydration)
 * against the real Zustand store, without requiring a React rendering environment.
 */
import { beforeEach, describe, expect, it } from "vitest";

import {
  INITIAL_DECK,
  reconstructDeck,
  serializeDeck,
} from "@/services/api/persistence";
import { cloneDeck } from "@/services/utils/deck-utils";
import { Spellcaster, Unit } from "@/types/api";
import { Deck, Team } from "@/types/deck";
import { EntityCategory } from "@/types/enums";

import { useDeckStore } from "../index";

// --------------- Test Fixtures ---------------

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

const MockUnit2: Unit = {
  ...MockUnit,
  entity_id: "u2",
  name: "Second Unit",
};

const MockSpellcaster: Spellcaster = {
  entity_id: "sc1",
  spellcaster_id: "sc1",
  name: "Test SC",
  category: EntityCategory.Spellcaster,
  class: "Enchanter",
  health: 100,
  abilities: {
    primary: { name: "P", description: "" },
    defense: { name: "D", description: "" },
    ultimate: { name: "U", description: "" },
    passive: [],
  },
  tags: [],
};

// --------------- Tests ---------------

describe("Hook Integration (Store-Level)", () => {
  beforeEach(() => {
    useDeckStore.setState({
      currentDeck: cloneDeck(INITIAL_DECK),
      savedDecks: [],
      savedTeams: [],
      teamName: "New Team",
      activeTeamId: null,
      activeSlot: null,
      teamDecks: [
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
      ],
    });
  });

  // =========================================================
  // useDeckSync logic: Zustand subscriber pattern
  // =========================================================
  describe("useDeckSync logic (subscriber sync)", () => {
    it("should sync currentDeck changes back to teamDecks[activeSlot]", () => {
      // Simulate what useDeckSync does:
      // 1. Set an active slot (editing team deck 1)
      // 2. Mutate currentDeck
      // 3. Verify teamDecks[1] is updated

      const { setActiveSlot, setTeamSlot } = useDeckStore.getState();

      // First populate slot 0 with a unit so we have something to edit
      setTeamSlot(0, 0, MockUnit);
      setActiveSlot(0); // This loads teamDecks[0] into currentDeck

      // Now simulate the subscriber logic: when currentDeck changes,
      // it should be written back to teamDecks[activeSlot]
      const state = useDeckStore.getState();
      const { activeSlot, teamDecks, currentDeck } = state;

      // Verify precondition: activeSlot is set
      expect(activeSlot).toBe(0);
      expect(currentDeck.slots[0].unit).toEqual(MockUnit);

      // Simulate currentDeck being modified (e.g. user adds a second unit)
      const modifiedDeck = cloneDeck(currentDeck);
      modifiedDeck.slots[1].unit = MockUnit2;
      useDeckStore.setState({ currentDeck: modifiedDeck });

      // Now simulate the subscriber callback (useDeckSync logic)
      const updatedState = useDeckStore.getState();
      if (
        updatedState.activeSlot !== null &&
        updatedState.activeSlot >= 0 &&
        updatedState.activeSlot < 3
      ) {
        const newTeamDecks = [...updatedState.teamDecks] as Team["decks"];
        newTeamDecks[updatedState.activeSlot] = cloneDeck(
          updatedState.currentDeck
        );
        useDeckStore.setState({ teamDecks: newTeamDecks });
      }

      // Assert: teamDecks[0] should now have the second unit
      const final = useDeckStore.getState();
      expect(final.teamDecks[0].slots[0].unit).toEqual(MockUnit);
      expect(final.teamDecks[0].slots[1].unit).toEqual(MockUnit2);
    });

    it("should NOT sync when activeSlot is null", () => {
      // activeSlot is null by default from beforeEach
      const state = useDeckStore.getState();
      expect(state.activeSlot).toBeNull();

      // Modify currentDeck
      const modifiedDeck = cloneDeck(state.currentDeck);
      modifiedDeck.slots[0].unit = MockUnit;
      useDeckStore.setState({ currentDeck: modifiedDeck });

      // Simulate subscriber logic (should be a no-op)
      const afterMutation = useDeckStore.getState();
      if (
        afterMutation.activeSlot !== null &&
        afterMutation.activeSlot >= 0 &&
        afterMutation.activeSlot < 3
      ) {
        // This block should NOT execute
        const newTeamDecks = [...afterMutation.teamDecks] as Team["decks"];
        newTeamDecks[afterMutation.activeSlot] = cloneDeck(
          afterMutation.currentDeck
        );
        useDeckStore.setState({ teamDecks: newTeamDecks });
      }

      // teamDecks should remain untouched (all empty)
      const final = useDeckStore.getState();
      expect(final.teamDecks[0].slots[0].unit).toBeNull();
      expect(final.teamDecks[1].slots[0].unit).toBeNull();
      expect(final.teamDecks[2].slots[0].unit).toBeNull();
    });
  });

  // =========================================================
  // useDataHydration logic: serialize → reconstruct pipeline
  // =========================================================
  describe("useDataHydration logic (hydration pipeline)", () => {
    it("should round-trip a deck through serialize → reconstruct and preserve identity", () => {
      // Build a deck with a unit and spellcaster
      const deck = cloneDeck(INITIAL_DECK);
      deck.id = "deck-1";
      deck.name = "My Deck";
      deck.slots[0].unit = MockUnit;
      deck.spellcaster = MockSpellcaster;

      // Serialize (what gets stored in localStorage)
      const stored = serializeDeck(deck);
      expect(stored.id).toBe("deck-1");
      expect(stored.name).toBe("My Deck");
      expect(stored.slotIds[0]).toBe("u1");
      expect(stored.spellcasterId).toBe("sc1");

      // Reconstruct (what useDataHydration does on mount)
      const fresh = reconstructDeck(
        stored,
        [MockUnit, MockUnit2],
        [MockSpellcaster]
      );

      expect(fresh.id).toBe("deck-1");
      expect(fresh.name).toBe("My Deck");
      expect(fresh.slots[0].unit).toEqual(MockUnit);
      expect(fresh.spellcaster).toEqual(MockSpellcaster);
    });

    it("should handle missing unit in fresh data gracefully (stale ID)", () => {
      const deck = cloneDeck(INITIAL_DECK);
      deck.slots[0].unit = MockUnit;

      const stored = serializeDeck(deck);

      // Reconstruct with an EMPTY unit array (simulates API returning no data)
      const fresh = reconstructDeck(stored, [], []);

      // The slot should be empty (unit not found in fresh data), not crash
      // INITIAL_SLOTS uses null for empty units, so the reconstructed slot is null
      expect(fresh.slots[0].unit).toBeNull();
    });

    it("should self-heal a missing ID during reconstruction", () => {
      const stored = {
        id: undefined as unknown as string, // Simulate corrupted storage
        name: "Broken Deck",
        spellcasterId: null,
        slotIds: [null, null, null, null, null] as [
          string | null,
          string | null,
          string | null,
          string | null,
          string | null,
        ],
      };

      const fresh = reconstructDeck(stored, [], []);

      // Should auto-generate a UUID
      expect(fresh.id).toBeDefined();
      expect(fresh.id!.length).toBeGreaterThan(0);
      expect(fresh.name).toBe("Broken Deck");
    });

    it("should hydrate all store sections (savedDecks, teamDecks, currentDeck)", () => {
      // Setup: Place units in various store sections
      const deckWithUnit = cloneDeck(INITIAL_DECK);
      deckWithUnit.id = "sd-1";
      deckWithUnit.name = "Saved 1";
      deckWithUnit.slots[0].unit = MockUnit;

      const teamDeck = cloneDeck(INITIAL_DECK);
      teamDeck.slots[1].unit = MockUnit2;

      useDeckStore.setState({
        savedDecks: [deckWithUnit],
        currentDeck: cloneDeck(deckWithUnit),
        teamDecks: [teamDeck, cloneDeck(INITIAL_DECK), cloneDeck(INITIAL_DECK)],
      });

      // Simulate what useDataHydration does
      const hydrateDeck = (deck: Deck): Deck => {
        if (!deck || !deck.slots) return deck;
        try {
          const stored = serializeDeck(deck);
          const fresh = reconstructDeck(
            stored,
            [MockUnit, MockUnit2],
            [MockSpellcaster]
          );
          return {
            ...fresh,
            id: deck.id || fresh.id,
            name: deck.name || fresh.name,
          };
        } catch {
          return deck; // Fallback
        }
      };

      const state = useDeckStore.getState();
      const freshSavedDecks = state.savedDecks.map(hydrateDeck);
      const freshCurrentDeck = hydrateDeck(state.currentDeck);
      const freshTeamDecks = state.teamDecks.map(hydrateDeck) as [
        Deck,
        Deck,
        Deck,
      ];

      useDeckStore.setState({
        savedDecks: freshSavedDecks,
        currentDeck: freshCurrentDeck,
        teamDecks: freshTeamDecks,
      });

      // Assert: All sections were hydrated with fresh data
      const final = useDeckStore.getState();
      expect(final.savedDecks[0].slots[0].unit).toEqual(MockUnit);
      expect(final.savedDecks[0].id).toBe("sd-1");
      expect(final.currentDeck.slots[0].unit).toEqual(MockUnit);
      expect(final.teamDecks[0].slots[1].unit).toEqual(MockUnit2);
    });
  });
});
