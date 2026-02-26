import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { INITIAL_DECK } from "@/services/api/persistence";
import { cloneDeck } from "@/services/utils/deck-utils";
// Import the mocked store so we can wire it to our test store
import { useDeckStore } from "@/store/index";
import { Deck } from "@/types/deck";

import { useDeckSync } from "../useDeckSync";

// Build a minimal real store that mirrors the production setup
// with subscribeWithSelector so subscribe(selector, listener) works.

interface MinimalState {
  currentDeck: Deck;
  activeSlot: number | null;
  teamDecks: [Deck, Deck, Deck];
}

const createTestStore = (overrides: Partial<MinimalState> = {}) => {
  const baseDeck = { ...INITIAL_DECK, name: "Base" };
  return create<MinimalState>()(
    subscribeWithSelector((set) => ({
      currentDeck: cloneDeck(baseDeck),
      activeSlot: null,
      teamDecks: [
        cloneDeck(baseDeck),
        cloneDeck(baseDeck),
        cloneDeck(baseDeck),
      ] as [Deck, Deck, Deck],
      ...overrides,
    }))
  );
};

// We need to mock the store import so useDeckSync uses our test store
vi.mock("@/store/index", () => ({
  useDeckStore: {
    subscribe: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn(),
  },
}));

vi.mock("@/services/config/constants", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return { ...actual, TEAM_LIMIT: 3 };
});

describe("useDeckSync", () => {
  let testStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    testStore = createTestStore();

    // Wire mock to test store
    (useDeckStore.subscribe as ReturnType<typeof vi.fn>).mockImplementation(
      (selectorOrListener: any, listener?: any) => {
        if (listener) {
          return testStore.subscribe(selectorOrListener, listener);
        }
        return testStore.subscribe(selectorOrListener);
      }
    );
    (useDeckStore.getState as ReturnType<typeof vi.fn>).mockImplementation(() =>
      testStore.getState()
    );
    (useDeckStore.setState as ReturnType<typeof vi.fn>).mockImplementation(
      (partial: any) => testStore.setState(partial)
    );
  });

  it("should subscribe to currentDeck changes on mount", () => {
    renderHook(() => useDeckSync());
    expect(useDeckStore.subscribe).toHaveBeenCalled();
  });

  it("should write cloned deck to teamDecks[activeSlot] when currentDeck changes and activeSlot is valid", () => {
    testStore.setState({ activeSlot: 1 });

    renderHook(() => useDeckSync());

    // Trigger a currentDeck change
    const updatedDeck = {
      ...INITIAL_DECK,
      name: "Updated Solo Deck",
      id: "new-id",
    };
    act(() => {
      testStore.setState({ currentDeck: updatedDeck });
    });

    const state = testStore.getState();
    expect(state.teamDecks[1].name).toBe("Updated Solo Deck");
    // Verify it's a clone, not the same reference
    expect(state.teamDecks[1]).not.toBe(updatedDeck);
  });

  it("should NOT touch teamDecks when activeSlot is null", () => {
    testStore.setState({ activeSlot: null });
    const originalTeamDecks = [...testStore.getState().teamDecks];

    renderHook(() => useDeckSync());

    act(() => {
      testStore.setState({
        currentDeck: { ...INITIAL_DECK, name: "Changed" },
      });
    });

    const state = testStore.getState();
    // Team decks should be unchanged
    expect(state.teamDecks[0].name).toBe(originalTeamDecks[0].name);
    expect(state.teamDecks[1].name).toBe(originalTeamDecks[1].name);
    expect(state.teamDecks[2].name).toBe(originalTeamDecks[2].name);
  });

  it("should NOT touch teamDecks when activeSlot is out of bounds", () => {
    testStore.setState({ activeSlot: 5 });
    const originalTeamDecks = testStore.getState().teamDecks.map((d) => d.name);

    renderHook(() => useDeckSync());

    act(() => {
      testStore.setState({
        currentDeck: { ...INITIAL_DECK, name: "OOB Test" },
      });
    });

    const state = testStore.getState();
    expect(state.teamDecks.map((d) => d.name)).toEqual(originalTeamDecks);
  });

  it("should not write when teamDecks[slot] is the same reference as currentDeck", () => {
    const sharedDeck = cloneDeck(INITIAL_DECK);
    testStore.setState({
      activeSlot: 0,
      currentDeck: sharedDeck,
      teamDecks: [sharedDeck, cloneDeck(INITIAL_DECK), cloneDeck(INITIAL_DECK)],
    });

    const setStateSpy = vi.spyOn(testStore, "setState");

    renderHook(() => useDeckSync());

    // Trigger subscription by setting same deck again
    act(() => {
      testStore.setState({ currentDeck: sharedDeck });
    });

    // setState should not have been called by the subscription (only our trigger)
    // The subscription checks `teamDecks[activeSlot] !== currentDeck`
    // Since they are the same reference, no write should occur
    const syncCalls = (
      useDeckStore.setState as ReturnType<typeof vi.fn>
    ).mock.calls.filter((c: any) => c[0]?.teamDecks);
    expect(syncCalls).toHaveLength(0);
  });

  it("should unsubscribe on unmount", () => {
    const mockUnsub = vi.fn();
    (useDeckStore.subscribe as ReturnType<typeof vi.fn>).mockReturnValue(
      mockUnsub
    );

    const { unmount } = renderHook(() => useDeckSync());
    unmount();

    expect(mockUnsub).toHaveBeenCalled();
  });
});
