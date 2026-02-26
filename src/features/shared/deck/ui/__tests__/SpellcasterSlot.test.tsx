import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Spellcaster } from "@/types/api";

import { SpellcasterSlot } from "../SpellcasterSlot";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const { gameImageRenderSpy } = vi.hoisted(() => ({
  gameImageRenderSpy: vi.fn(),
}));

// Mock Next Image / GameImage
vi.mock("@/components/ui/GameImage", () => ({
  GameImage: () => {
    gameImageRenderSpy();
    return <div data-testid="game-image" />;
  },
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

// Mock SVG icons
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Wand2: () => <div data-testid="wand-icon" />,
  Swords: () => <div data-testid="swords-icon" />,
  HelpCircle: () => <div data-testid="help-icon" />,
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
    clearSpellcaster: vi.fn(),
    clearTeamSpellcaster: vi.fn(),
    teamDecks: [],
  }),
}));

const mockEmptySpellcaster = null;

const mockFilledSpellcaster = {
  id: "caster-1",
  name: "Astral Monk",
  class: "Conqueror",
  imageLocation: "test-caster.jpg",
};

describe("SpellcasterSlot UI Layout", () => {
  it("renders empty slot with consistent typography sizing and no truncation", () => {
    render(
      <SpellcasterSlot spellcaster={mockEmptySpellcaster} deckId="deck-1" />
    );

    // Check that the label has the new text-[10px] sm:text-xs classes and NO truncate
    const label = screen.getByText("Spellcaster");
    expect(label.className).toContain("text-[10px]");
    expect(label.className).toContain("sm:text-xs");
    expect(label.className).not.toContain("truncate");
  });

  it("renders filled slot with identical neutral name banner styling as DeckSlot", () => {
    render(
      <SpellcasterSlot
        spellcaster={mockFilledSpellcaster as unknown as Spellcaster}
        deckId="deck-1"
      />
    );

    // Check the root element
    const rootEl = screen.getByTestId("spellcaster-slot");
    expect(rootEl.className).toContain("overflow-visible"); // Ensure Remove button won't clip
    expect(rootEl.className).not.toContain("overflow-hidden");

    // Check inner container has overflow-hidden for the image
    const innerContainer = rootEl.querySelector(
      ".overflow-hidden.bg-surface-raised"
    );
    expect(innerContainer).toBeTruthy();

    // Check the name banner has consistent typography and neutral background (no purple)
    const nameLabel = screen.getByText("Astral Monk");
    const banner = nameLabel.parentElement;

    // Assert the exact neutral styles we added matching DeckSlot
    expect(banner?.className).toContain("bg-surface-main/95");
    expect(banner?.className).toContain("min-h-[24px]");
    expect(banner?.className).not.toContain("bg-brand-primary");

    expect(nameLabel.className).toContain("text-[10px]");
    expect(nameLabel.className).toContain("text-text-secondary");
    expect(nameLabel.className).not.toContain("drop-shadow-md");
  });

  it("renders with aspect-3/4 on the root element", () => {
    render(
      <SpellcasterSlot spellcaster={mockEmptySpellcaster} deckId="deck-1" />
    );
    const rootEl = screen.getByTestId("spellcaster-slot");
    expect(rootEl.className).toContain("aspect-3/4");
    expect(rootEl.className).toContain("w-full");
  });

  it("renders remove button positioned absolutely without clipping", () => {
    render(
      <SpellcasterSlot
        spellcaster={mockFilledSpellcaster as unknown as Spellcaster}
        deckId="deck-1"
      />
    );

    const removeBtn = screen.getByTestId("remove-spellcaster");
    // Button is absolute positioned top-right
    expect(removeBtn.className).toContain("absolute");
    expect(removeBtn.className).toContain("-top-1.5");
    expect(removeBtn.className).toContain("-right-1.5");
  });
});

describe("SpellcasterSlot Performance", () => {
  it("memoizes rendering and does not re-render when inline functions change", () => {
    gameImageRenderSpy.mockClear();

    const initialProps = {
      spellcaster: mockFilledSpellcaster as unknown as Spellcaster,
      deckId: "perf-deck",
      onSelect: () => {}, // Initial inline arrow function
    };

    const { rerender } = render(<SpellcasterSlot {...initialProps} />);
    expect(gameImageRenderSpy).toHaveBeenCalledTimes(1);

    // Re-render with a new inline function
    rerender(
      <SpellcasterSlot
        {...initialProps}
        onSelect={() => {
          console.log("new func");
        }}
      />
    );

    // If it's memoized correctly, GameImage won't render again
    expect(gameImageRenderSpy).toHaveBeenCalledTimes(1);
  });
});
