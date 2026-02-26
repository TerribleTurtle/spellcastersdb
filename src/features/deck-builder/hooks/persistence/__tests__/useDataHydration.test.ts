import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { reconstructDeck, serializeDeck } from "@/services/api/persistence";
import { monitoring } from "@/services/monitoring";
import { useDeckStore } from "@/store/index";
import { Deck, Team } from "@/types/deck";

import { useDataHydration } from "../useDataHydration";

// --- Mocks ---

vi.mock("@/services/api/persistence", () => ({
  serializeDeck: vi.fn(),
  reconstructDeck: vi.fn(),
  INITIAL_DECK: {
    spellcaster: null,
    slots: [
      { index: 0, unit: null, allowedTypes: ["Unit"] },
      { index: 1, unit: null, allowedTypes: ["Unit"] },
      { index: 2, unit: null, allowedTypes: ["Unit"] },
      { index: 3, unit: null, allowedTypes: ["Unit"] },
      { index: 4, unit: null, allowedTypes: ["Titan"] },
    ],
    name: "",
  },
}));

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

vi.mock("@/store/index", () => ({
  useDeckStore: {
    getState: vi.fn(),
    setState: vi.fn(),
  },
}));

// --- Test Fixtures ---

const createMockDeck = (name: string, id?: string): Deck =>
  ({
    id: id || `deck-${name}`,
    name,
    spellcaster: null,
    slots: [
      { index: 0, unit: null, allowedTypes: ["Unit"] },
      { index: 1, unit: null, allowedTypes: ["Unit"] },
      { index: 2, unit: null, allowedTypes: ["Unit"] },
      { index: 3, unit: null, allowedTypes: ["Unit"] },
      { index: 4, unit: null, allowedTypes: ["Titan"] },
    ],
  }) as unknown as Deck;

const mockUnits = [{ entity_id: "u1", name: "Unit 1" }] as any[];
const mockSpellcasters = [{ spellcaster_id: "sc1", name: "Caster 1" }] as any[];

describe("useDataHydration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: serializeDeck returns IDs, reconstructDeck returns a "fresh" deck
    (serializeDeck as ReturnType<typeof vi.fn>).mockImplementation(
      (deck: Deck) => ({
        id: deck.id,
        name: deck.name,
        spellcasterId: null,
        slotIds: [null, null, null, null, null],
      })
    );
    (reconstructDeck as ReturnType<typeof vi.fn>).mockImplementation(
      (stored: any) => createMockDeck(stored.name + " (fresh)", stored.id)
    );

    // Default store state
    const savedDeck = createMockDeck("Saved 1");
    const currentDeck = createMockDeck("Current");
    const teamDeck = createMockDeck("Team Deck");
    const savedTeam: Team = {
      id: "team-1",
      name: "My Team",
      decks: [
        createMockDeck("T1"),
        createMockDeck("T2"),
        createMockDeck("T3"),
      ] as [Deck, Deck, Deck],
    };

    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      savedDecks: [savedDeck],
      currentDeck,
      teamDecks: [teamDeck, teamDeck, teamDeck],
      savedTeams: [savedTeam],
    });
  });

  it("should skip hydration when units array is empty", () => {
    renderHook(() =>
      useDataHydration({ units: [], spellcasters: mockSpellcasters })
    );

    expect(serializeDeck).not.toHaveBeenCalled();
    expect(useDeckStore.setState).not.toHaveBeenCalled();
  });

  it("should skip hydration when spellcasters array is empty", () => {
    renderHook(() => useDataHydration({ units: mockUnits, spellcasters: [] }));

    expect(serializeDeck).not.toHaveBeenCalled();
    expect(useDeckStore.setState).not.toHaveBeenCalled();
  });

  it("should hydrate savedDecks, currentDeck, teamDecks, and savedTeams", () => {
    renderHook(() =>
      useDataHydration({ units: mockUnits, spellcasters: mockSpellcasters })
    );

    expect(serializeDeck).toHaveBeenCalled();
    expect(reconstructDeck).toHaveBeenCalled();
    expect(useDeckStore.setState).toHaveBeenCalledWith(
      expect.objectContaining({
        savedDecks: expect.any(Array),
        currentDeck: expect.any(Object),
        teamDecks: expect.any(Array),
        savedTeams: expect.any(Array),
      })
    );
  });

  it("should fall back to stale deck when reconstructDeck throws", () => {
    (reconstructDeck as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("Reconstruction failed");
    });

    renderHook(() =>
      useDataHydration({ units: mockUnits, spellcasters: mockSpellcasters })
    );

    // Should still call setState (falling back to stale data)
    expect(useDeckStore.setState).toHaveBeenCalled();
    // Should have logged the error
    expect(monitoring.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ operation: "deckHydration" })
    );
  });

  it("should only run once despite re-renders (hasHydrated ref guard)", () => {
    const { rerender } = renderHook(() =>
      useDataHydration({ units: mockUnits, spellcasters: mockSpellcasters })
    );

    const firstCallCount = (useDeckStore.setState as ReturnType<typeof vi.fn>)
      .mock.calls.length;

    // Re-render the hook
    rerender();
    rerender();

    // setState should not have been called again
    expect(
      (useDeckStore.setState as ReturnType<typeof vi.fn>).mock.calls.length
    ).toBe(firstCallCount);
  });
});
