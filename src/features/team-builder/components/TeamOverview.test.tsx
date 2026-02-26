// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TeamOverview } from "./TeamOverview";

// Mock TeamDeckRow to avoid complex component rendering
vi.mock("./TeamDeckRow", () => ({
  TeamDeckRow: vi.fn(({ deck, onEdit, isReadOnly, index }) => (
    <div data-testid={`mock-deck-row-${index}`}>
      <div>{deck.name}</div>
      <button onClick={onEdit}>Edit Deck {index}</button>
      {isReadOnly && <div>Read Only</div>}
    </div>
  )),
}));

// Mock TeamActionButtons
vi.mock("./TeamActionButtons", () => ({
  TeamActionButtons: vi.fn(({ onBack, onEditDeck }) => (
    <div data-testid="mock-action-buttons">
      <button onClick={onBack}>Mock Back</button>
      <button onClick={() => onEditDeck(0)}>Mock Action Edit</button>
    </div>
  )),
}));

const mockOpenInspector = vi.fn();
const mockCloseInspector = vi.fn();

vi.mock("@/store/index", () => ({
  useDeckStore: vi.fn((selector) => {
    // This simple mock covers the case where components do:
    // const openInspector = useDeckStore((state) => state.openInspector);
    return selector({
      openInspector: mockOpenInspector,
      closeInspector: mockCloseInspector,
    });
  }),
}));

describe("TeamOverview", () => {
  const mockDecks = [
    { name: "Deck A", spellcasterId: null, slotIds: [] } as any,
    { name: "Deck B", spellcasterId: null, slotIds: [] } as any,
    { name: "Deck C", spellcasterId: null, slotIds: [] } as any,
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the team name (or fallback) and share button", () => {
    render(
      <TeamOverview
        decks={mockDecks}
        onEditDeck={vi.fn()}
        teamName="Avengers"
      />
    );

    expect(screen.getByText("Avengers")).toBeInTheDocument();
    expect(screen.getByTitle("Share Team")).toBeInTheDocument();
  });

  it("should render exactly 3 mock deck rows", () => {
    render(<TeamOverview decks={mockDecks} onEditDeck={vi.fn()} />);

    expect(screen.getByTestId("mock-deck-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("mock-deck-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("mock-deck-row-2")).toBeInTheDocument();
    expect(screen.getByText("Deck A")).toBeInTheDocument();
    expect(screen.getByText("Deck C")).toBeInTheDocument();
  });

  it("should pass down interaction callbacks (onEditDeck, onBack)", () => {
    const onEditDeck = vi.fn();
    const onBack = vi.fn();

    render(
      <TeamOverview decks={mockDecks} onEditDeck={onEditDeck} onBack={onBack} />
    );

    fireEvent.click(screen.getByText("Edit Deck 1"));
    expect(onEditDeck).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText("Mock Back"));
    expect(onBack).toHaveBeenCalled();
  });
});
