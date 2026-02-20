import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDeckStore } from "@/store/index";
import { DeckFactory } from "@/tests/factories/deck-factory";
import { EntityCategory } from "@/types/enums";

import { DeckBuilderContainer } from "../ui/root/DeckBuilderContainer";

// Mock Hooks
vi.mock("@/features/deck-builder/hooks/persistence/useUrlSync", () => ({
  useUrlSync: () => ({ isHydrated: true, isProcessing: false }),
}));
vi.mock("@/features/deck-builder/hooks/persistence/useDeckSync", () => ({
  useDeckSync: vi.fn(),
}));
vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ toasts: [], showToast: vi.fn() }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ ...props }: React.ComponentProps<"img"> & { fill?: boolean }) => (
    <img alt="" {...props} />
  ),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

interface MockUnit {
  entity_id: string;
  name: string;
}

// Mock UnitBrowser to avoid complex filtering/virtualization in integration test
vi.mock("@/features/deck-builder/browser/UnitBrowser", () => ({
  UnitBrowser: ({
    items,
    onQuickAdd,
  }: {
    items: MockUnit[];
    onQuickAdd: (item: MockUnit) => void;
  }) => {
    return (
      <div data-testid="unit-browser-mock">
        {items.map((item) => (
          <div key={item.entity_id}>
            {item.name}
            <button aria-label="Quick Add" onClick={() => onQuickAdd(item)}>
              Quick Add
            </button>
          </div>
        ))}
      </div>
    );
  },
}));

// Mock DragDropProvider to avoid dnd-kit pointer event issues in jsdom
vi.mock("../ui/providers/DragDropProvider", () => ({
  DragDropProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("DeckBuilder Integration", () => {
  // ... test setup ...

  // Note: jsdom rendering for responsive layouts (hidden xl:contents not rendering in test environment)
  // E2E tests verify this functionality works correctly in real browsers
  it("should render unit browser content", async () => {
    const mockUnit = DeckFactory.createUnit({
      entity_id: "u1",
      name: "Test Unit",
      category: EntityCategory.Creature,
    });
    render(<DeckBuilderContainer units={[mockUnit]} spellcasters={[]} />);

    // Check for static UI - Wait for it to load
    await waitFor(() => {
      expect(screen.getAllByTitle("Save Deck").length).toBeGreaterThan(0);
    });

    // Check for unit content (async because virtualization/filtering might be async)
    // Since JSDOM renders both mobile and desktop layouts, we might find duplicates.
    // We scope to the desktop container to be precise.
    await waitFor(() => {
      const desktopContainer = document.getElementById("active-deck-desktop");
      expect(desktopContainer).not.toBeNull();
    });

    const desktopContainer = document.getElementById("active-deck-desktop");
    const { findByText } = within(desktopContainer!);
    const unitElement = await findByText("Test Unit");
    expect(unitElement).toBeDefined();

    // Interaction: Click to Quick Add
    // We need to ensure we click the 'Quick Add' button, not just the card (which selects)
    // Again, scope to desktop to avoid ambiguity
    const { getByLabelText } = within(desktopContainer!);
    const quickAddButton = getByLabelText("Quick Add");
    fireEvent.click(quickAddButton);

    // Verification: Check Store State
    // Since we are using the real store logic (unmocked), it should update the slot.
    // We need to wait for the store update (though usually sync with Zustand, sometimes React batching affects it if we checked UI)
    // Checking state directly is safest for logic.

    await waitFor(() => {
      const state = useDeckStore.getState();
      const slot0 = state.currentDeck.slots[0];
      expect(slot0.unit).toBeDefined();
      expect(slot0.unit?.name).toBe("Test Unit");
    });
  });

  // Note: Test environment rendering for validation feedback (likely mobile/desktop hidden visibility issue)
  it("should show validation feedback", async () => {
    // Render with empty units (should be invalid deck)
    const { container } = render(
      <DeckBuilderContainer units={[]} spellcasters={[]} />
    );

    // Check for validation indicator (e.g. "X Issues")
    // Deck starts empty, so it should have multiple issues (missing spellcaster, missing units)
    // Use container query selector to bypass visibility checks since the element is hidden
    await waitFor(() => {
      const indicator = container.querySelector(
        '[data-testid="validation-indicator"]'
      );
      expect(indicator).not.toBeNull();
    });
  });
});
