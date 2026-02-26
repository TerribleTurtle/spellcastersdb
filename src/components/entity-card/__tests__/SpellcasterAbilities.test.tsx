import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SpellcasterAbilities } from "@/components/entity-card/SpellcasterAbilities";
import { Spellcaster } from "@/types/api";

// Mock the GameImage component so we don't worry about Next.js Image internals
vi.mock("@/components/ui/GameImage", () => ({
  GameImage: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-testid="game-image" />
  ),
}));

// Mock TextWithLinks since it's just a text renderer
vi.mock("@/components/common/TextWithLinks", () => ({
  TextWithLinks: ({ text }: { text: string }) => <span>{text}</span>,
}));

// Mock EntityMechanics
vi.mock("@/components/entity-card/EntityMechanics", () => ({
  EntityMechanics: () => <div data-testid="entity-mechanics" />,
}));

const validSpellcaster = {
  spellcaster_id: "test",
  name: "Test",
  category: "Spellcaster" as const,
  class: "Mage",
  elements: ["Fire"],
  region: "Any",
  tags: [],
  hp: 10,
  movement_speed: 1,
  abilities: {
    passive: [{ name: "Passive A", description: "P" }],
    primary: { name: "Primary Strike", description: "Atk" },
    defense: { name: "Defense Shield", description: "Def" },
    ultimate: { name: "Ultimate Nova", description: "Ult" },
  },
  image_urls: {
    attack: "/atk",
    defense: "/def",
    passive: "/pas",
    ultimate: "/ult",
  },
} as unknown as Spellcaster;

describe("SpellcasterAbilities (Standard)", () => {
  it("renders nothing if entity is not a spellcaster", () => {
    const { container } = render(
      // @ts-expect-error forcing malformed data
      <SpellcasterAbilities item={{ entity_id: "not-hero" }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders all four ability names in detailed variant", () => {
    const { getByText } = render(
      <SpellcasterAbilities item={validSpellcaster} variant="detailed" />
    );
    expect(getByText("Passive A")).toBeTruthy();
    expect(getByText("Primary Strike")).toBeTruthy();
    expect(getByText("Defense Shield")).toBeTruthy();
    expect(getByText("Ultimate Nova")).toBeTruthy();
  });

  it("renders exactly 4 ability images when all exist in detailed variant", () => {
    const { container } = render(
      <SpellcasterAbilities item={validSpellcaster} variant="detailed" />
    );
    const imgs = container.querySelectorAll("img[data-testid='game-image']");
    expect(imgs.length).toBe(4);
  });

  it("adds ability types as text badges (PRIMARY, DEFENSE, ULTIMATE)", () => {
    const { getByText } = render(
      <SpellcasterAbilities item={validSpellcaster} variant="detailed" />
    );
    expect(getByText("PRIMARY")).toBeTruthy();
    expect(getByText("DEFENSE")).toBeTruthy();
    expect(getByText("ULTIMATE")).toBeTruthy();
  });

  it("renders passive title group", () => {
    const { getByText } = render(
      <SpellcasterAbilities item={validSpellcaster} variant="detailed" />
    );
    // There's a generic "Passive" header before the specific passive skill
    expect(getByText("Passive")).toBeTruthy();
  });

  it("does not render passive header if there are no passives", () => {
    const noPassives = {
      ...validSpellcaster,
      abilities: {
        ...validSpellcaster.abilities,
        passive: [],
      },
    } as unknown as Spellcaster;

    const { queryByText } = render(
      <SpellcasterAbilities item={noPassives} variant="detailed" />
    );
    expect(queryByText("Passive", { selector: "h3" })).toBeNull();
  });
});
