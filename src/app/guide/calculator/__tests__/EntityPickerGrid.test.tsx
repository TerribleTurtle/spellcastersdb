import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UnifiedEntity } from "@/types/api";

import { EntityPickerGrid } from "../components/EntityPickerGrid";

const mockEntities: UnifiedEntity[] = [
  {
    entity_id: "u1",
    name: "Alpha",
    category: "Spellcaster",
    knowledge_cost: 100,
  } as UnifiedEntity,
  {
    entity_id: "u2",
    name: "Beta",
    category: "Creature",
    rank: "I",
    knowledge_cost: 200,
  } as UnifiedEntity,
  {
    entity_id: "u3",
    name: "Gamma",
    category: "Creature",
    rank: "I",
    knowledge_cost: 0,
  } as UnifiedEntity, // 0-cost
];

describe("EntityPickerGrid", () => {
  const defaultProps = {
    entities: mockEntities,
    selectedSet: new Set<string>(),
    ownedSet: new Set<string>(),
    hideOwned: false,
    onToggleEntity: vi.fn(),
    onSelectAll: vi.fn(),
    onClearAll: vi.fn(),
    onToggleOwned: vi.fn(),
    onHideOwnedChange: vi.fn(),
    totalEarned: 1000,
  };

  it("renders grouped category headers based on BROWSER_CATEGORY_ORDER", () => {
    render(<EntityPickerGrid {...defaultProps} />);

    // Spellcasters should be grouped
    expect(
      screen.getByRole("heading", { name: "Spellcasters" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Creatures" })
    ).toBeInTheDocument();
  });

  it("renders dual-action cards (checkbox for select, button for own)", () => {
    render(<EntityPickerGrid {...defaultProps} />);

    // Find the card for Alpha
    const alphaCard = screen.getByTestId("entity-card-u1");
    expect(alphaCard).toBeInTheDocument();

    // Select toggle
    const selectArea = within(alphaCard).getByRole("button", {
      name: /Select Alpha/i,
    });
    fireEvent.click(selectArea);
    expect(defaultProps.onToggleEntity).toHaveBeenCalledWith("u1");

    // Own toggle
    const ownToggle = within(alphaCard).getByRole("button", {
      name: /Mark Alpha as Owned/i,
    });
    fireEvent.click(ownToggle);
    expect(defaultProps.onToggleOwned).toHaveBeenCalledWith("u1");
  });

  it("displays owned entities visually differently when hideOwned is false", () => {
    render(<EntityPickerGrid {...defaultProps} ownedSet={new Set(["u1"])} />);

    const alphaCard = screen.getByTestId("entity-card-u1");
    // ARIA indicates it's owned
    expect(
      within(alphaCard).getByRole("button", { name: /Mark Alpha as Unowned/i })
    ).toBeInTheDocument();

    // The select toggle should be disabled or hidden entirely for owned items
    const selectArea = within(alphaCard).queryByRole("button", {
      name: /Select Alpha/i,
    });
    if (selectArea) {
      expect(selectArea).toBeDisabled();
    }
  });

  it("completely removes owned entities from DOM when hideOwned is true", () => {
    render(
      <EntityPickerGrid
        {...defaultProps}
        ownedSet={new Set(["u1"])}
        hideOwned={true}
      />
    );

    // Alpha is owned and hideOwned=true, so it shouldn't exist
    expect(screen.queryByTestId("entity-card-u1")).not.toBeInTheDocument();
    // Spellcasters group should also be missing if it's empty
    expect(
      screen.queryByRole("heading", { name: "Spellcasters" })
    ).not.toBeInTheDocument();

    // Beta/Gamma (Creatures) should still be there
    expect(screen.getByTestId("entity-card-u2")).toBeInTheDocument();
  });

  it("renders 'Hide Owned' switch in the toolbar and calls onHideOwnedChange", () => {
    render(<EntityPickerGrid {...defaultProps} />);

    const hideToggle = screen.getByRole("switch", { name: /Hide Owned/i });
    expect(hideToggle).toBeInTheDocument();
    expect(hideToggle).not.toBeChecked();

    fireEvent.click(hideToggle);
    expect(defaultProps.onHideOwnedChange).toHaveBeenCalledWith(true);
  });

  it("handles 0-cost default entities by locking their own toggle", () => {
    // Pass Gamma (u3) as owned, as it would be injected on load
    render(<EntityPickerGrid {...defaultProps} ownedSet={new Set(["u3"])} />);

    const gammaCard = screen.getByTestId("entity-card-u3");

    // The own button should be disabled for 0-cost items
    const ownToggle = within(gammaCard).getByRole("button", {
      name: /Mark Gamma as Unowned/i,
    });
    expect(ownToggle).toBeDisabled();
    expect(ownToggle).toHaveAttribute("title", "Owned by Default");
  });

  it("displays explicit 'Track', 'Tracked', 'Own', and 'Owned' text labels", () => {
    // Alpha is tracked, Beta is unowned/untracked, Gamma is owned default
    render(
      <EntityPickerGrid
        {...defaultProps}
        selectedSet={new Set(["u1"])}
        ownedSet={new Set(["u3"])}
      />
    );

    // Alpha (Tracked)
    const alphaCard = screen.getByTestId("entity-card-u1");
    expect(within(alphaCard).getByText("Tracked")).toBeInTheDocument();
    expect(within(alphaCard).getByText("Own")).toBeInTheDocument();

    // Beta (Untracked)
    const betaCard = screen.getByTestId("entity-card-u2");
    expect(within(betaCard).getByText("Track")).toBeInTheDocument();
    expect(within(betaCard).getByText("Own")).toBeInTheDocument();

    // Gamma (Owned)
    const gammaCard = screen.getByTestId("entity-card-u3");
    expect(within(gammaCard).queryByText("Track")).not.toBeInTheDocument(); // Track label vanishes when owned
    expect(within(gammaCard).getByText("Owned")).toBeInTheDocument();
  });

  it("renders 'Clear Tracked' button in toolbar and calls onClearAll", () => {
    render(<EntityPickerGrid {...defaultProps} />);

    const clearButton = screen.getByRole("button", { name: "Clear Tracked" });
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(defaultProps.onClearAll).toHaveBeenCalled();
  });
});
