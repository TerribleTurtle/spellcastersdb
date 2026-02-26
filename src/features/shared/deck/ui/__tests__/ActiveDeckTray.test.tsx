import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ActiveDeckTray } from "../ActiveDeckTray";

const { childRenderSpy } = vi.hoisted(() => ({
  childRenderSpy: vi.fn(),
}));

// Mock child components to prevent full tree rendering
vi.mock("../DeckSlot", () => ({
  DeckSlot: () => {
    childRenderSpy();
    return <div data-testid="deck-slot" />;
  },
}));
vi.mock("../SpellcasterSlot", () => ({
  SpellcasterSlot: () => {
    childRenderSpy();
    return <div data-testid="spellcaster-slot" />;
  },
}));

// Mock dnd-kit
vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({
    setNodeRef: vi.fn(),
  }),
}));

const mockEmptySlots = Array(5)
  .fill(null)
  .map((_, i) => ({
    index: i,
    unit: null,
    allowedTypes: [],
  }));

describe("ActiveDeckTray Performance", () => {
  it("memoizes rendering and does not re-render on referentially new but identical arrays/functions", () => {
    childRenderSpy.mockClear();

    const initialProps = {
      slots: mockEmptySlots as any,
      spellcaster: null,
      deckId: "perf-deck",
      onSelect: () => {},
    };

    const { rerender } = render(<ActiveDeckTray {...initialProps} />);

    // Initial render should render 5 slots and 1 spellcaster = 6 times.
    const initialRenders = childRenderSpy.mock.calls.length;
    expect(initialRenders).toBeGreaterThan(0);

    // Rerender with structurally identical but referentially different props
    const newSlots = [...mockEmptySlots] as any;
    rerender(
      <ActiveDeckTray {...initialProps} slots={newSlots} onSelect={() => {}} />
    );

    // If memoized properly, it shouldn't re-render children
    expect(childRenderSpy.mock.calls.length).toBe(initialRenders);
  });
});
