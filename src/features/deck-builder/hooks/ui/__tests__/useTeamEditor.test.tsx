import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeckStore } from "@/store/index";
// Mock useTeamBuilder to return a specific activeSlot
import { SlotType } from "@/types/enums";

import { useTeamEditor } from "../useTeamEditor";

// Mock dependencies (none active)

// Mock useTeamBuilder to return a specific activeSlot

// Store activeSlot in a variable we can change
let mockActiveSlot = 2;

const createMockSlots = () =>
  Array(5)
    .fill(null)
    .map((_, i) => ({
      index: i,
      unit: null,
      allowedTypes: [SlotType.Unit],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;

vi.mock("@/features/team-builder/hooks/useTeamBuilder", () => ({
  useTeamBuilder: vi.fn(() => ({
    activeSlot: mockActiveSlot,
    setActiveSlot: vi.fn(),
    teamName: "Test Team",
    teamDecks: [
      { spellcaster: null, slots: createMockSlots() },
      { spellcaster: null, slots: createMockSlots() },
      { spellcaster: null, slots: createMockSlots() },
    ],
  })),
}));

describe("useTeamEditor Drawer Focus", () => {
  beforeEach(() => {
    mockActiveSlot = 2; // Reset
    useDeckStore.setState({
      activeSlot: 2,
    });
    vi.clearAllMocks();
  });

  it("should match accordion state to activeSlot on mount", () => {
    // 1. Arrange & Act
    const { result } = renderHook(() => useTeamEditor());

    // 3. Assert
    // Expect index 2 to be true (expanded)
    expect(result.current.accordion.expandedState[2]).toBe(true);
    // Expect others to be false
    expect(result.current.accordion.expandedState[0]).toBe(false);
    expect(result.current.accordion.expandedState[1]).toBe(false);
  });
});

describe("useTeamEditor Drawer Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveSlot = 0; // Start at 0 for these tests
    useDeckStore.setState({
      activeSlot: 0,
      teamDecks: [
        { spellcaster: null, slots: createMockSlots() },
        { spellcaster: null, slots: createMockSlots() },
        { spellcaster: null, slots: createMockSlots() },
      ],
    });
  });

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
    window.dispatchEvent(new Event("resize"));
  };

  it("should enforce accordion (single open) on Mobile (<1280px)", () => {
    setWindowWidth(800);

    const { result } = renderHook(() => useTeamEditor());

    // Initial state matching activeSlot=0
    expect(result.current.accordion.expandedState).toEqual([
      true,
      false,
      false,
    ]);

    // Open Index 1 -> Should close Index 0
    // We act on the current result
    // Note: useAccordionState toggle(index, isOpen)

    // We need to wrap state updates in act() if they aren't already (renderHook handles some, but updates might need it)
    // specific hook updates usually need act
    const { toggle } = result.current.accordion;

    act(() => {
      toggle(1, true);
    });

    expect(result.current.accordion.expandedState).toEqual([
      false,
      true,
      false,
    ]);
  });

  it("should allow multiple open drawers on Desktop (>=1280px)", () => {
    setWindowWidth(1400);

    const { result } = renderHook(() => useTeamEditor());

    // Initial state activeSlot=0
    expect(result.current.accordion.expandedState).toEqual([
      true,
      false,
      false,
    ]);

    // Open Index 1 -> Should KEEP Index 0 Open
    const { toggle } = result.current.accordion;

    act(() => {
      toggle(1, true);
    });

    expect(result.current.accordion.expandedState).toEqual([true, true, false]);
  });
});
