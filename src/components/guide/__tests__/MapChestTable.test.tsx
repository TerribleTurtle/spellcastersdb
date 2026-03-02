import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { MapChest } from "@/types/map-chests";

import { MapChestTable } from "../MapChestTable";

vi.mock("next/link", () => ({
  default: function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  },
}));

const MOCK_CHESTS: MapChest[] = [
  {
    location: "Inner Side",
    rarity: "Common",
    tier: "T1",
    reward_entity_id: "harpy",
    reward_type: "Unit",
  },
  {
    location: "1st Tower Left",
    rarity: "Epic",
    tier: "T2",
    reward_entity_id: "fire_ball",
    reward_type: "Spell",
  },
  {
    location: "Mid Left",
    rarity: "Legendary",
    tier: "T4",
    reward_entity_id: "juggernaut",
    reward_type: "Unit",
  },
];

describe("MapChestTable", () => {
  it("renders tier group headers", () => {
    render(<MapChestTable chests={MOCK_CHESTS} />);
    expect(
      screen.getByRole("heading", { name: /Tier 1/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Tier 2/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Tier 4/i })
    ).toBeInTheDocument();
  });

  it("renders chest location and rarity", () => {
    render(<MapChestTable chests={MOCK_CHESTS} />);
    expect(screen.getAllByText("Inner Side")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Common")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Legendary")[0]).toBeInTheDocument();
  });

  it("links unit rewards to unit detail page", () => {
    render(<MapChestTable chests={MOCK_CHESTS} />);
    const harpyLink = screen.getAllByRole("link", { name: /Harpy/i })[0];
    expect(harpyLink).toHaveAttribute("href", "/incantations/units/harpy");
  });

  it("links spell rewards to spell detail page", () => {
    render(<MapChestTable chests={MOCK_CHESTS} />);
    const fireballLink = screen.getAllByRole("link", { name: /Fire Ball/i })[0];
    expect(fireballLink).toHaveAttribute(
      "href",
      "/incantations/spells/fire_ball"
    );
  });

  it("renders empty state when no chests", () => {
    render(<MapChestTable chests={[]} />);
    expect(screen.getByText(/no chest data/i)).toBeInTheDocument();
  });
});
