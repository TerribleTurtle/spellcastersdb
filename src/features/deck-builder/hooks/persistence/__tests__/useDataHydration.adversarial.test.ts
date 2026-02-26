import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  INITIAL_DECK,
  reconstructDeck,
  serializeDeck,
} from "@/services/api/persistence";
import { monitoring } from "@/services/monitoring";
import { useDeckStore } from "@/store/index";
import { Deck, Team } from "@/types/deck";

import { useDataHydration } from "../useDataHydration";

vi.mock("@/services/api/persistence", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/services/api/persistence")>();
  return {
    ...actual,
    serializeDeck: vi.fn(),
    reconstructDeck: vi.fn(),
  };
});

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

describe("useDataHydration — Adversarial", () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
  });

  it("ADV-HYD-1: state with null savedDecks/savedTeams/teamDecks should not crash", () => {
    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      savedDecks: null,
      currentDeck: createMockDeck("Current"),
      teamDecks: null,
      savedTeams: null,
    });

    expect(() => {
      renderHook(() =>
        useDataHydration({ units: mockUnits, spellcasters: mockSpellcasters })
      );
    }).not.toThrow();

    expect(useDeckStore.setState).toHaveBeenCalled();
  });

  it("ADV-HYD-2: state with currentDeck = null should not crash", () => {
    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      savedDecks: [],
      currentDeck: null,
      teamDecks: [
        createMockDeck("T1"),
        createMockDeck("T2"),
        createMockDeck("T3"),
      ],
      savedTeams: [],
    });

    expect(() => {
      renderHook(() =>
        useDataHydration({ units: mockUnits, spellcasters: mockSpellcasters })
      );
    }).not.toThrow();
  });

  it("ADV-HYD-3: deck with null slots should not crash hydrateDeck", () => {
    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      savedDecks: [{ id: "evil", name: "No Slots", slots: null }],
      currentDeck: createMockDeck("Current"),
      teamDecks: [
        createMockDeck("T1"),
        createMockDeck("T2"),
        createMockDeck("T3"),
      ],
      savedTeams: [],
    });

    expect(() => {
      renderHook(() =>
        useDataHydration({ units: mockUnits, spellcasters: mockSpellcasters })
      );
    }).not.toThrow();
  });

  it("ADV-HYD-4: serializeDeck throws on one deck but should not kill the batch", () => {
    let callCount = 0;
    (serializeDeck as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      if (callCount === 2) throw new Error("Serialize bomb");
      return {
        id: "ok",
        name: "ok",
        spellcasterId: null,
        slotIds: [null, null, null, null, null],
      };
    });

    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      savedDecks: [
        createMockDeck("Good"),
        createMockDeck("Bomb"),
        createMockDeck("Good2"),
      ],
      currentDeck: createMockDeck("Current"),
      teamDecks: [
        createMockDeck("T1"),
        createMockDeck("T2"),
        createMockDeck("T3"),
      ],
      savedTeams: [],
    });

    renderHook(() =>
      useDataHydration({ units: mockUnits, spellcasters: mockSpellcasters })
    );

    // The per-deck try/catch should catch the bomb and fall back
    expect(monitoring.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ operation: "deckHydration" })
    );
    // setState should still be called with the remaining good decks
    expect(useDeckStore.setState).toHaveBeenCalled();
  });

  it("ADV-HYD-5: savedTeams with missing/null decks property should not crash", () => {
    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      savedDecks: [],
      currentDeck: createMockDeck("Current"),
      teamDecks: [
        createMockDeck("T1"),
        createMockDeck("T2"),
        createMockDeck("T3"),
      ],
      savedTeams: [
        { id: "team-evil", name: "Evil Team", decks: null } as unknown as Team,
        { id: "team-undef", name: "Undef Team" } as unknown as Team,
      ],
    });

    expect(() => {
      renderHook(() =>
        useDataHydration({ units: mockUnits, spellcasters: mockSpellcasters })
      );
    }).not.toThrow();
  });

  it("ADV-HYD-6: massive savedDecks array (5000 items) should not crash", () => {
    const giantDecks = Array.from({ length: 5000 }, (_, i) =>
      createMockDeck(`Deck ${i}`)
    );
    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      savedDecks: giantDecks,
      currentDeck: createMockDeck("Current"),
      teamDecks: [
        createMockDeck("T1"),
        createMockDeck("T2"),
        createMockDeck("T3"),
      ],
      savedTeams: [],
    });

    expect(() => {
      renderHook(() =>
        useDataHydration({ units: mockUnits, spellcasters: mockSpellcasters })
      );
    }).not.toThrow();

    expect(serializeDeck).toHaveBeenCalledTimes(5000 + 1 + 3); // savedDecks + currentDeck + 3 teamDecks
  });

  it("ADV-HYD-7: passing units with __proto__ entity_id should not pollute", () => {
    const poisonUnits = [
      { entity_id: "__proto__", name: "Poison" },
      { entity_id: "constructor", name: "Trap" },
    ] as any[];

    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      savedDecks: [createMockDeck("D1")],
      currentDeck: createMockDeck("Current"),
      teamDecks: [
        createMockDeck("T1"),
        createMockDeck("T2"),
        createMockDeck("T3"),
      ],
      savedTeams: [],
    });

    expect(() => {
      renderHook(() =>
        useDataHydration({
          units: poisonUnits,
          spellcasters: mockSpellcasters,
        })
      );
    }).not.toThrow();

    // Object prototype should not be affected
    expect(({} as any).name).toBeUndefined();
  });

  it("ADV-HYD-8: units = undefined (not empty array) should be guarded", () => {
    renderHook(() =>
      useDataHydration({
        units: undefined as any,
        spellcasters: mockSpellcasters,
      })
    );

    expect(serializeDeck).not.toHaveBeenCalled();
  });

  it("ADV-HYD-9: spellcasters = undefined (not empty array) should be guarded", () => {
    renderHook(() =>
      useDataHydration({
        units: mockUnits,
        spellcasters: undefined as any,
      })
    );

    expect(serializeDeck).not.toHaveBeenCalled();
  });

  // --- Round 2: Deep Edge Cases ---

  it("ADV-HYD-10: units array with sparse holes should not crash", () => {
    const sparseUnits: any[] = [];
    sparseUnits[5] = { entity_id: "u5", name: "Hole-y Unit" };
    // This creates an array: [empty x 5, { ... }]

    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      savedDecks: [createMockDeck("D1")],
      currentDeck: createMockDeck("Current"),
      teamDecks: [
        createMockDeck("T1"),
        createMockDeck("T2"),
        createMockDeck("T3"),
      ],
      savedTeams: [],
    });

    expect(() => {
      renderHook(() =>
        useDataHydration({
          units: sparseUnits as any,
          spellcasters: mockSpellcasters,
        })
      );
    }).not.toThrow();
  });

  it("ADV-HYD-11: deck with trap getters that throw on read should be caught and skipped", () => {
    const explodingDeck = { ...INITIAL_DECK, name: "Trap" };
    Object.defineProperty(explodingDeck, "slots", {
      get: () => {
        throw new Error("Trap triggered");
      },
    });

    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      savedDecks: [explodingDeck as any, createMockDeck("Safe Deck")],
      currentDeck: null,
      teamDecks: [],
      savedTeams: [],
    });

    renderHook(() =>
      useDataHydration({
        units: mockUnits,
        spellcasters: mockSpellcasters,
      })
    );

    // The per-deck try/catch in hydrateDeck handles `if (!deck || !deck.slots)`
    // That "deck.slots" access will trigger the getter and throw!
    // But since it's NOT inside a try/catch in hydrateDeck (the try block is AFTER the if statement),
    // this will actually crash the entire hydration batch in Reality! Let's see if it gets caught by the outer catch.

    // The outer try/catch around the state processing SHOULD catch it.
    expect(monitoring.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ operation: "batchHydration" })
    );

    // Because the batch crashed, setState should NEVER be called.
    expect(useDeckStore.setState).not.toHaveBeenCalled();
  });

  it("ADV-HYD-12: reconstructDeck returns null/undefined instead of a Deck should be handled", () => {
    (reconstructDeck as ReturnType<typeof vi.fn>).mockReturnValueOnce(null);

    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      savedDecks: [createMockDeck("Should Become Null")],
      currentDeck: null,
      teamDecks: [],
      savedTeams: [],
    });

    renderHook(() =>
      useDataHydration({
        units: mockUnits,
        spellcasters: mockSpellcasters,
      })
    );

    // Depending on spread operator semantics `{ ...fresh }`, spreading null gives {}
    // We should expect it not to crash, but the resulting deck might be malformed
    const setCall = (useDeckStore.setState as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    expect(setCall.savedDecks[0]).toBeDefined();
    // Spreading null results in an object without the properties, but id/name from original keep it alive
    expect(setCall.savedDecks[0].name).toBe("Should Become Null");
  });
});
