import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UnitCard } from "@/components/database/UnitCard";
import { MagicSchool, UnifiedEntity } from "@/types/api";
import { EntityCategory } from "@/types/enums";

// Mock EntityImage since it handles Next.js Image
vi.mock("@/components/ui/EntityImage", () => ({
  EntityImage: () => <div data-testid="entity-image" />,
}));

// Mock SmartRankBadge
vi.mock("@/components/ui/rank-badge", () => ({
  SmartRankBadge: () => <div data-testid="rank-badge" />,
}));

const mockUnit = {
  entity_id: "test-unit-1",
  name: "Test Unit",
  category: EntityCategory.Creature,
  magic_school: "Fire" as MagicSchool,
  rank: "II" as const,
  health: 100,
  damage: 50,
  description: "A test unit",
  tags: [],
} as UnifiedEntity;

describe("UnitCard", () => {
  it("renders unit name and stats in default string", () => {
    render(<UnitCard unit={mockUnit} />);

    expect(screen.getByText("Test Unit")).toBeTruthy();
    expect(screen.getByText("Fire")).toBeTruthy();
    expect(screen.getByText("Creature")).toBeTruthy();
    expect(screen.getByTestId("entity-image")).toBeTruthy();
    expect(screen.getByTestId("rank-badge")).toBeTruthy();
  });

  it("renders compact variant correctly", () => {
    render(<UnitCard unit={mockUnit} variant="compact" />);

    expect(screen.getByText("Test Unit")).toBeTruthy();
    expect(screen.getByText("HP")).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();
    expect(screen.getByText("DMG")).toBeTruthy();
    expect(screen.getByText("50")).toBeTruthy();
  });

  it("links to the correct detail page", () => {
    render(<UnitCard unit={mockUnit} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/incantations/units/test-unit-1");
  });
});
