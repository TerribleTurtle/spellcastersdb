import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DeckSlot as DeckSlotType } from "@/types/deck";

import { DeckSlot } from "../DeckSlot";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Next Image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

const { rankBadgeRenderSpy } = vi.hoisted(() => ({
  rankBadgeRenderSpy: vi.fn(),
}));

// Mock Rank Badge and SVG icons
vi.mock("@/components/ui/rank-badge", () => ({
  RankBadge: () => {
    rankBadgeRenderSpy();
    return <div data-testid="rank-badge" />;
  },
}));
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
}));

// Mock dnd-kit
vi.mock("@dnd-kit/core", () => ({
  useDndContext: () => ({ active: null }),
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
  useDroppable: () => ({
    isOver: false,
    setNodeRef: vi.fn(),
  }),
}));

// Mock Zustand store
vi.mock("@/store/index", () => ({
  useDeckStore: () => ({
    mode: "SOLO",
    isReadOnly: false,
    clearSlot: vi.fn(),
    clearTeamSlot: vi.fn(),
    teamDecks: [],
  }),
}));

const mockEmptySlot = {
  index: 0,
  unit: null,
  allowedTypes: ["Unit"],
};

const mockFilledSlot = {
  index: 1,
  unit: {
    id: "unit-1",
    name: "Test Unit",
    category: "Creature",
    imageLocation: "test.jpg",
    rank: "I",
  },
  allowedTypes: ["Unit"],
};

describe("DeckSlot UI Layout", () => {
  it("renders empty slot with consistent typography sizing and no truncation", () => {
    render(
      <DeckSlot
        slot={mockEmptySlot as unknown as DeckSlotType}
        allSlots={
          [] as unknown as [
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
          ]
        }
        idSuffix="test"
        deckId="deck-1"
      />
    );

    // Check that the label has the new text-[10px] sm:text-xs classes and NO truncate
    const label = screen.getByText("Incant. 1");
    expect(label.className).toContain("text-[10px]");
    expect(label.className).toContain("sm:text-xs");
    expect(label.className).not.toContain("truncate");
  });

  it("renders filled slot with overflow-visible to prevent clipping", () => {
    render(
      <DeckSlot
        slot={mockFilledSlot as unknown as DeckSlotType}
        allSlots={
          [] as unknown as [
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
          ]
        }
        idSuffix="test"
        deckId="deck-1"
      />
    );

    // Check the root element
    const rootEl = screen.getByTestId("deck-slot-1");
    expect(rootEl.className).toContain("overflow-visible"); // Ensure Remove button won't clip
    expect(rootEl.className).not.toContain("overflow-hidden");

    // Check inner container has overflow-hidden for the image
    const innerContainer = rootEl.querySelector(
      ".overflow-hidden.bg-surface-raised"
    );
    expect(innerContainer).toBeTruthy();

    // Check the name banner has consistent typography and no drop shadow
    const nameLabel = screen.getByText("Test Unit");
    const banner = nameLabel.parentElement;
    expect(banner?.className).toContain("bg-surface-main/95");
    expect(nameLabel.className).toContain("text-[10px]");
    expect(nameLabel.className).toContain("text-text-secondary");
    expect(nameLabel.className).not.toContain("drop-shadow-md");
  });

  it("renders with aspect-3/4 on the root element", () => {
    render(
      <DeckSlot
        slot={mockEmptySlot as DeckSlotType}
        allSlots={
          [] as unknown as [
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
          ]
        }
        idSuffix="test"
        deckId="deck-1"
      />
    );
    const rootEl = screen.getByTestId("deck-slot-0");
    expect(rootEl.className).toContain("aspect-3/4");
    expect(rootEl.className).toContain("w-full");
  });

  it("renders remove button positioned absolutely without clipping", () => {
    render(
      <DeckSlot
        slot={mockFilledSlot as unknown as DeckSlotType}
        allSlots={
          [] as unknown as [
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
            DeckSlotType,
          ]
        }
        idSuffix="test"
        deckId="deck-1"
      />
    );

    const removeBtn = screen.getByTestId("remove-slot-1");
    // Button is absolute positioned top-right
    expect(removeBtn.className).toContain("absolute");
    expect(removeBtn.className).toContain("-top-1.5");
    expect(removeBtn.className).toContain("-right-1.5");
  });
});

describe("DeckSlot Performance", () => {
  it("memoizes rendering and does not re-render when allSlots array reference changes but content is the same", () => {
    rankBadgeRenderSpy.mockClear();

    const initialProps = {
      slot: mockFilledSlot as unknown as DeckSlotType,
      allSlots: [mockFilledSlot] as unknown as [
        DeckSlotType,
        DeckSlotType,
        DeckSlotType,
        DeckSlotType,
        DeckSlotType,
      ],
      idSuffix: "perf",
      deckId: "perf-deck",
      onSelect: () => {},
    };

    const { rerender } = render(<DeckSlot {...initialProps} />);

    // RankBadge rendered once
    expect(rankBadgeRenderSpy).toHaveBeenCalledTimes(1);

    // Re-render with a NEW array reference, but SAME slot object reference
    const newAllSlots = [...initialProps.allSlots] as unknown as [
      DeckSlotType,
      DeckSlotType,
      DeckSlotType,
      DeckSlotType,
      DeckSlotType,
    ];

    rerender(<DeckSlot {...initialProps} allSlots={newAllSlots} />);

    // If it's memoized correctly with a custom compare, RankBadge won't render again
    expect(rankBadgeRenderSpy).toHaveBeenCalledTimes(1);
  });
});
