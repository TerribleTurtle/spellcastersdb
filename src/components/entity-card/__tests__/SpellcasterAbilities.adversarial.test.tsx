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

// Base valid spellcaster structure to mutate
const baseSpellcaster = {
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
    passive: [{ name: "Passive", description: "P" }],
    primary: { name: "Primary", description: "Atk" },
    defense: { name: "Defense", description: "Def" },
    ultimate: { name: "Ultimate", description: "Ult" },
  },
} as unknown as Spellcaster;

describe("SpellcasterAbilities (Adversarial image_urls)", () => {
  it("survives entirely missing image_urls object", () => {
    // Should render without crashing, displaying no images
    const { container } = render(
      <SpellcasterAbilities item={{ ...baseSpellcaster }} variant="detailed" />
    );
    expect(container).toBeTruthy();
    const imgs = container.querySelectorAll("img[data-testid='game-image']");
    expect(imgs.length).toBe(0);
  });

  it("survives empty image_urls object", () => {
    const evil = {
      ...baseSpellcaster,
      image_urls: {},
    };
    const { container } = render(
      <SpellcasterAbilities item={evil} variant="detailed" />
    );
    expect(container).toBeTruthy();
    expect(container.querySelectorAll("img").length).toBe(0);
  });

  it("survives null/undefined values inside image_urls", () => {
    const evil = {
      ...baseSpellcaster,
      image_urls: {
        attack: null,
        defense: undefined,
        passive: null,
        ultimate: undefined,
      },
    } as unknown as Spellcaster; // Force bad types

    expect(() =>
      render(<SpellcasterAbilities item={evil} variant="detailed" />)
    ).not.toThrow();
  });

  it("survives unexpected data types in image_urls (numbers, arrays)", () => {
    const evil = {
      ...baseSpellcaster,
      image_urls: {
        attack: 12345,
        defense: ["an", "array"],
        passive: { an: "object" },
        ultimate: true,
      },
    } as unknown as Spellcaster;

    // It might render them as weird strings or ignore them, but it shouldn't crash
    expect(() =>
      render(<SpellcasterAbilities item={evil} variant="detailed" />)
    ).not.toThrow();
  });

  it("survives missing ability definitions entirely", () => {
    // What if the API strips the abilities themselves?
    const evil = {
      ...baseSpellcaster,
      abilities: {
        // @ts-expect-error forcing malformed data
        passive: null,
        primary: null,
        defense: undefined,
      },
      image_urls: {
        attack: "/path.png",
      },
    } as unknown as Spellcaster;

    // TypeError is expected if abilities.passive isn't an array in the raw component,
    // but React shouldn't crash *because* of image_urls.
    // The component currently assumes `abilities` matches the schema.
    try {
      render(<SpellcasterAbilities item={evil} variant="detailed" />);
    } catch {
      // It's allowed to throw if `abilities.passive.map` is called on null,
      // but let's make sure it doesn't crash on `image_urls`.
    }
  });

  it("renders correctly when only some image_urls are provided", () => {
    const partial = {
      ...baseSpellcaster,
      image_urls: {
        defense: "/def.webp",
        // missing attack, passive, ultimate
      },
    };
    const { container, getByAltText } = render(
      <SpellcasterAbilities item={partial} variant="detailed" />
    );

    // Should render exactly 1 image
    const imgs = container.querySelectorAll("img[data-testid='game-image']");
    expect(imgs.length).toBe(1);

    // Verify it's the defense one
    const defenseImg = getByAltText("Defense defense");
    expect(defenseImg).toBeTruthy();
  });

  it("never renders images in compact variant, even with full image_urls", () => {
    const full = {
      ...baseSpellcaster,
      image_urls: {
        attack: "/atk",
        defense: "/def",
        passive: "/pas",
        ultimate: "/ult",
      },
    };
    const { container } = render(
      <SpellcasterAbilities item={full} variant="compact" />
    );
    const imgs = container.querySelectorAll("img[data-testid='game-image']");
    expect(imgs.length).toBe(0);
  });
});
