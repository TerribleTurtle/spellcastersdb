import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSoloBuilder } from "../useSoloBuilder";

// --- Mock Zustand Store ---
// We mock the hook returned by Zustand instead of the module so we can control what it outputs.
const mockState = {
  currentDeck: { name: "", slots: [] },
  savedDecks: [],
  swapSlots: vi.fn(),
  setDeck: vi.fn(),
  setSavedDecks: vi.fn(),
  saveDeck: vi.fn(),
};

vi.mock("@/store/index", () => ({
  useDeckStore: vi.fn((selector) => {
    // The selector is `useShallow((state) => ({ ... }))`
    // We pass our mock state to it to return the subset our hook needs.
    return selector(mockState);
  }),
}));

vi.mock("@/store/selectors", () => ({
  selectHasChanges: vi.fn(() => false),
  selectIsEmpty: vi.fn(() => true),
}));

describe("useSoloBuilder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.currentDeck = { name: "", slots: [] };
    mockState.savedDecks = [];
  });

  it("returns expected store fields and methods", () => {
    const { result } = renderHook(() => useSoloBuilder());

    expect(result.current).toHaveProperty("currentDeck");
    expect(result.current).toHaveProperty("savedDecks");
    expect(result.current).toHaveProperty("moveSlot");
    expect(result.current).toHaveProperty("setDeckState");
    expect(result.current).toHaveProperty("saveNow");
    expect(result.current).toHaveProperty("reorderDecks");
  });

  it("exposes selectIsEmpty via isEmpty flag", async () => {
    const selectors = await import("@/store/selectors");
    vi.mocked(selectors.selectIsEmpty).mockReturnValue(true);

    const { result } = renderHook(() => useSoloBuilder());
    expect(result.current.isEmpty).toBe(true);

    vi.mocked(selectors.selectIsEmpty).mockReturnValue(false);
    const { result: r2 } = renderHook(() => useSoloBuilder());
    expect(r2.current.isEmpty).toBe(false);
  });

  it("exposes selectHasChanges via hasChanges flag", async () => {
    const selectors = await import("@/store/selectors");
    vi.mocked(selectors.selectHasChanges).mockReturnValue(false);

    const { result } = renderHook(() => useSoloBuilder());
    expect(result.current.hasChanges).toBe(false);

    vi.mocked(selectors.selectHasChanges).mockReturnValue(true);
    const { result: r2 } = renderHook(() => useSoloBuilder());
    expect(r2.current.hasChanges).toBe(true);
  });

  it("moveSlot delegates to swapSlots", () => {
    const { result } = renderHook(() => useSoloBuilder());

    act(() => {
      result.current.moveSlot(0, 1);
    });

    expect(mockState.swapSlots).toHaveBeenCalledWith(0, 1);
  });

  it("saveNow delegates to saveDeck with current deck name", () => {
    mockState.currentDeck.name = "Test Deck 123";
    const { result } = renderHook(() => useSoloBuilder());

    act(() => {
      result.current.saveNow();
    });

    expect(mockState.saveDeck).toHaveBeenCalledWith("Test Deck 123");
  });

  it("saveNow delegates to saveDeck with empty string if no name", () => {
    mockState.currentDeck.name = undefined as unknown as string;
    const { result } = renderHook(() => useSoloBuilder());

    act(() => {
      result.current.saveNow();
    });

    expect(mockState.saveDeck).toHaveBeenCalledWith("");
  });
});
