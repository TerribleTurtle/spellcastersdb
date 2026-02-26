import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { Spell, Unit } from "@/types/api";

// Mock all heavy child components to isolate EntityShowcase rendering
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid={src.includes("knowledge") ? "knowledge-icon" : "game-image"}
    />
  ),
}));

vi.mock("@/components/ui/GameImage", () => ({
  GameImage: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-testid="game-image" />
  ),
}));

vi.mock("@/components/ui/rank-badge", () => ({
  SmartRankBadge: () => <span data-testid="rank-badge" />,
}));

vi.mock("@/components/entity-card/EntityStats", () => ({
  EntityStats: () => <div data-testid="entity-stats" />,
}));

vi.mock("@/components/entity-card/EntityMechanics", () => ({
  EntityMechanics: () => <div data-testid="entity-mechanics" />,
}));

vi.mock("@/components/entity-card/SpellcasterAbilities", () => ({
  SpellcasterAbilities: () => <div data-testid="spellcaster-abilities" />,
}));

vi.mock("@/components/common/TextWithLinks", () => ({
  TextWithLinks: ({ text }: { text: string }) => <span>{text}</span>,
}));

vi.mock("@/components/inspector/PatchHistorySection", () => ({
  PatchHistorySection: () => <div data-testid="patch-history-section" />,
}));

vi.mock("@/components/inspector/RelatedEntities", () => ({
  RelatedEntities: () => <div data-testid="related-entities" />,
}));

vi.mock("@/lib/routes", () => ({
  routes: {
    database: (tag?: string) => (tag ? `/database?tag=${tag}` : "/database"),
    school: (id: string) => `/schools/${id}`,
    unitDetail: (id: string) => `/incantations/units/${id}`,
    spellDetail: (id: string) => `/incantations/spells/${id}`,
  },
}));

const baseUnit: Unit = {
  entity_id: "u_rhino",
  name: "Rhino Rider",
  category: "Creature",
  magic_school: "War",
  description: "A charging rhino unit",
  tags: ["cavalry"],
  health: 500,
  knowledge_cost: 500,
} as unknown as Unit;

const freeUnit: Unit = {
  entity_id: "u_free",
  name: "Free Unit",
  category: "Creature",
  magic_school: "Wild",
  description: "A free unit",
  tags: [],
  health: 100,
  knowledge_cost: 0,
} as unknown as Unit;

const unitNoCost: Unit = {
  entity_id: "u_no_cost",
  name: "Legacy Unit",
  category: "Creature",
  magic_school: "Wild",
  description: "A legacy unit without knowledge_cost",
  tags: [],
  health: 100,
} as unknown as Unit;

const paidSpell: Spell = {
  entity_id: "s_ice",
  name: "Ice Ray",
  category: "Spell",
  magic_school: "Elemental",
  description: "A cold beam",
  tags: ["frost"],
  knowledge_cost: 200,
} as unknown as Spell;

describe("EntityShowcase: Knowledge Cost pill", () => {
  it("renders knowledge_cost pill when cost > 0 on a Unit", () => {
    render(<EntityShowcase item={baseUnit} />);
    // The knowledge icon image should be rendered
    const icons = screen.getAllByTestId("knowledge-icon");
    expect(icons.length).toBeGreaterThanOrEqual(1);
    // The cost value should appear in text content
    expect(screen.getByText("500", { exact: false })).toBeTruthy();
  });

  it("does NOT render knowledge_cost pill when cost is 0", () => {
    render(<EntityShowcase item={freeUnit} />);
    const icons = screen.queryAllByTestId("knowledge-icon");
    expect(icons.length).toBe(0);
  });

  it("does NOT render knowledge_cost pill when field is absent", () => {
    render(<EntityShowcase item={unitNoCost} />);
    const icons = screen.queryAllByTestId("knowledge-icon");
    expect(icons.length).toBe(0);
  });

  it("renders knowledge_cost pill for Spells with cost > 0", () => {
    render(<EntityShowcase item={paidSpell} />);
    const icons = screen.getAllByTestId("knowledge-icon");
    expect(icons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("200", { exact: false })).toBeTruthy();
  });

  it("renders the knowledge icon with the correct src", () => {
    render(<EntityShowcase item={baseUnit} />);
    const icons = screen.getAllByTestId("knowledge-icon");
    const knowledgeImg = icons[0];
    expect(knowledgeImg.getAttribute("src")).toBe(
      "https://terribleturtle.github.io/spellcasters-community-api/assets/currencies/knowledge.webp"
    );
  });
});
