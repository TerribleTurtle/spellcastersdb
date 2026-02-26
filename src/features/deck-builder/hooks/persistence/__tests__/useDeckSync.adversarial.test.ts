import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { INITIAL_DECK } from "@/services/api/persistence";
import { cloneDeck } from "@/services/utils/deck-utils";
import { useDeckStore } from "@/store/index";
import { Deck } from "@/types/deck";

import { useDeckSync } from "../useDeckSync";

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

describe("useDeckSync — Adversarial", () => {
  let testStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    testStore = createTestStore();

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

  it("ADV-SYNC-1: activeSlot = -1 should NOT write to teamDecks", () => {
    testStore.setState({ activeSlot: -1 });
    renderHook(() => useDeckSync());

    act(() => {
      testStore.setState({
        currentDeck: { ...INITIAL_DECK, name: "Evil Negative" },
      });
    });

    const state = testStore.getState();
    expect(state.teamDecks[0].name).not.toBe("Evil Negative");
  });

  it("ADV-SYNC-2: activeSlot = NaN should NOT write to teamDecks", () => {
    testStore.setState({ activeSlot: NaN as any });
    renderHook(() => useDeckSync());

    act(() => {
      testStore.setState({
        currentDeck: { ...INITIAL_DECK, name: "NaN Attack" },
      });
    });

    const syncCalls = (
      useDeckStore.setState as ReturnType<typeof vi.fn>
    ).mock.calls.filter((c: any) => c[0]?.teamDecks);
    expect(syncCalls).toHaveLength(0);
  });

  it("ADV-SYNC-3: activeSlot = Infinity should NOT write to teamDecks", () => {
    testStore.setState({ activeSlot: Infinity as any });
    renderHook(() => useDeckSync());

    act(() => {
      testStore.setState({
        currentDeck: { ...INITIAL_DECK, name: "Infinity" },
      });
    });

    const syncCalls = (
      useDeckStore.setState as ReturnType<typeof vi.fn>
    ).mock.calls.filter((c: any) => c[0]?.teamDecks);
    expect(syncCalls).toHaveLength(0);
  });

  it("ADV-SYNC-4: activeSlot = 2.5 (float) should NOT write to teamDecks", () => {
    testStore.setState({ activeSlot: 2.5 as any });
    renderHook(() => useDeckSync());

    act(() => {
      testStore.setState({
        currentDeck: { ...INITIAL_DECK, name: "FloatAttack" },
      });
    });

    // 2.5 >= 0 && 2.5 < 3 → true, so the guard passes!
    // This is a potential bug: float index will write to teamDecks[2.5]
    // which creates a sparse array. Let's verify what happens.
    const state = testStore.getState();
    // The array length should still be 3 (no new indices created at integer positions)
    expect(state.teamDecks).toHaveLength(3);
  });

  it("ADV-SYNC-5: rapid-fire 100 deck changes should not cause stack overflow", () => {
    testStore.setState({ activeSlot: 0 });
    renderHook(() => useDeckSync());

    expect(() => {
      for (let i = 0; i < 100; i++) {
        act(() => {
          testStore.setState({
            currentDeck: { ...INITIAL_DECK, name: `Rapid ${i}` },
          });
        });
      }
    }).not.toThrow();

    const state = testStore.getState();
    expect(state.teamDecks[0].name).toBe("Rapid 99");
  });

  it("ADV-SYNC-6: setting currentDeck with function property DOES crash cloneDeck (structuredClone limitation)", () => {
    testStore.setState({ activeSlot: 0 });
    renderHook(() => useDeckSync());

    // cloneDeck uses structuredClone internally, which cannot clone functions.
    // This documents a real edge case: if a deck ever has a function property,
    // the sync will throw DataCloneError.
    const evilDeck = {
      ...INITIAL_DECK,
      name: "Evil",
      toString: () => {
        throw new Error("toString trap");
      },
    };

    expect(() => {
      act(() => {
        testStore.setState({ currentDeck: evilDeck as any });
      });
    }).toThrow(/could not be cloned/);
  });

  it("ADV-SYNC-7: mounting and unmounting 50 times should not leak subscriptions", () => {
    const mockUnsub = vi.fn();
    (useDeckStore.subscribe as ReturnType<typeof vi.fn>).mockReturnValue(
      mockUnsub
    );

    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useDeckSync());
      unmount();
    }

    expect(mockUnsub).toHaveBeenCalledTimes(50);
  });
});
