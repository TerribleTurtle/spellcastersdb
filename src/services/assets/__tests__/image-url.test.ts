import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAbilityImageUrl,
  getCardImageUrl,
} from "@/services/assets/asset-helpers";

// Hoist mock state so it can be accessed inside vi.mock factory
const mocks = vi.hoisted(() => ({
  useLocalAssets: false,
  preferredFormat: "png",
  forceRemote: false,
}));

vi.mock("@/lib/config", () => ({
  CONFIG: {
    API: {
      BASE_URL:
        "https://terribleturtle.github.io/spellcasters-community-api/api/v2",
    },
    FEATURES: {
      get USE_LOCAL_ASSETS() {
        return mocks.useLocalAssets;
      },
      get PREFERRED_ASSET_FORMAT() {
        return mocks.preferredFormat;
      },
    },
  },
}));

const HOST_ROOT = "https://terribleturtle.github.io/spellcasters-community-api";

describe("getCardImageUrl", () => {
  beforeEach(() => {
    // Reset defaults
    mocks.useLocalAssets = false;
    mocks.preferredFormat = "png";
  });

  it("should return remote URL for a unit by default", () => {
    const unit = {
      entity_id: "unit_123",
      category: "Creature",
      name: "Test Unit",
    };
    const url = getCardImageUrl(unit);
    expect(url).toBe(
      "https://terribleturtle.github.io/spellcasters-community-api/assets/units/unit_123.png"
    );
  });

  it("should return remote URL for a spell", () => {
    const spell = {
      entity_id: "spell_456",
      category: "Spell",
      name: "Test Spell",
    };
    const url = getCardImageUrl(spell);
    expect(url).toBe(
      "https://terribleturtle.github.io/spellcasters-community-api/assets/spells/spell_456.png"
    );
  });

  it("should return remote URL for a spellcaster", () => {
    const spellcaster = {
      spellcaster_id: "hero_789",
      category: "Spellcaster",
      name: "Test Spellcaster",
    };
    const url = getCardImageUrl(spellcaster);
    expect(url).toBe(
      "https://terribleturtle.github.io/spellcasters-community-api/assets/heroes/hero_789.png"
    );
  });

  it("should return remote URL for a consumable", () => {
    const item = {
      consumable_id: "item_000",
      category: "Consumable",
      name: "Test Item",
    };
    const url = getCardImageUrl(item);
    expect(url).toBe(
      "https://terribleturtle.github.io/spellcasters-community-api/assets/consumables/item_000.png"
    );
  });

  it("should prefer webp if forced via options", () => {
    const unit = {
      entity_id: "unit_123",
      category: "Creature",
      name: "Test Unit",
    };
    const url = getCardImageUrl(unit, { forceFormat: "webp" });
    expect(url).toBe(
      "https://terribleturtle.github.io/spellcasters-community-api/assets/units/unit_123.webp"
    );
  });

  it("should return local URL if USE_LOCAL_ASSETS is true", () => {
    mocks.useLocalAssets = true;
    const unit = {
      entity_id: "unit_123",
      category: "Creature",
      name: "Test Unit",
    };
    const url = getCardImageUrl(unit);
    expect(url).toBe("/api/local-assets/units/unit_123.png");
  });

  it("should ignore local assets setting if forceRemote is true", () => {
    mocks.useLocalAssets = true;
    const unit = {
      entity_id: "unit_123",
      category: "Creature",
      name: "Test Unit",
    };
    const url = getCardImageUrl(unit, { forceRemote: true });
    expect(url).toBe(
      "https://terribleturtle.github.io/spellcasters-community-api/assets/units/unit_123.png"
    );
  });

  it("should return placeholder if no ID is present", () => {
    const badEntity = { name: "Broken" };
    // @ts-expect-error - testing invalid entity
    const url = getCardImageUrl(badEntity);
    expect(url).toContain("placeholder_card.png");
  });

  it("should prefer image_urls.card when present (remote)", () => {
    const hero = {
      spellcaster_id: "fire_elementalist",
      category: "Spellcaster",
      image_urls: { card: "/assets/heroes/fire_elementalist.webp" },
    };
    const url = getCardImageUrl(hero);
    expect(url).toBe(`${HOST_ROOT}/assets/heroes/fire_elementalist.webp`);
  });

  it("should ignore image_urls.card when USE_LOCAL_ASSETS is true", () => {
    mocks.useLocalAssets = true;
    const hero = {
      spellcaster_id: "fire_elementalist",
      category: "Spellcaster",
      image_urls: { card: "/assets/heroes/fire_elementalist.webp" },
    };
    const url = getCardImageUrl(hero);
    expect(url).toBe("/api/local-assets/heroes/fire_elementalist.png");
  });

  it("should use image_urls.card with forceRemote even if USE_LOCAL_ASSETS is true", () => {
    mocks.useLocalAssets = true;
    const hero = {
      spellcaster_id: "fire_elementalist",
      category: "Spellcaster",
      image_urls: { card: "/assets/heroes/fire_elementalist.webp" },
    };
    const url = getCardImageUrl(hero, { forceRemote: true });
    expect(url).toBe(`${HOST_ROOT}/assets/heroes/fire_elementalist.webp`);
  });

  it("should fallback to ID-based URL when image_urls has no card", () => {
    const hero = {
      spellcaster_id: "fire_elementalist",
      category: "Spellcaster",
      image_urls: {},
    };
    const url = getCardImageUrl(hero);
    expect(url).toBe(`${HOST_ROOT}/assets/heroes/fire_elementalist.png`);
  });
});

describe("getAbilityImageUrl", () => {
  it("should resolve attack image URL", () => {
    const hero = {
      image_urls: {
        attack: "/assets/heroes/abilities/fire_elementalist_attack.webp",
      },
    };
    const url = getAbilityImageUrl(hero, "attack");
    expect(url).toBe(
      `${HOST_ROOT}/assets/heroes/abilities/fire_elementalist_attack.webp`
    );
  });

  it("should resolve defense image URL", () => {
    const hero = {
      image_urls: {
        defense: "/assets/heroes/abilities/fire_elementalist_defense.webp",
      },
    };
    const url = getAbilityImageUrl(hero, "defense");
    expect(url).toBe(
      `${HOST_ROOT}/assets/heroes/abilities/fire_elementalist_defense.webp`
    );
  });

  it("should resolve passive image URL", () => {
    const hero = {
      image_urls: {
        passive: "/assets/heroes/abilities/fire_elementalist_passive.webp",
      },
    };
    const url = getAbilityImageUrl(hero, "passive");
    expect(url).toBe(
      `${HOST_ROOT}/assets/heroes/abilities/fire_elementalist_passive.webp`
    );
  });

  it("should resolve ultimate image URL", () => {
    const hero = {
      image_urls: {
        ultimate: "/assets/heroes/abilities/fire_elementalist_ultimate.webp",
      },
    };
    const url = getAbilityImageUrl(hero, "ultimate");
    expect(url).toBe(
      `${HOST_ROOT}/assets/heroes/abilities/fire_elementalist_ultimate.webp`
    );
  });

  it("should return null when image_urls is undefined", () => {
    const hero = {};
    const url = getAbilityImageUrl(hero, "attack");
    expect(url).toBeNull();
  });

  it("should return null when the specific ability type is missing", () => {
    const hero = {
      image_urls: {
        card: "/assets/heroes/fire_elementalist.webp",
      },
    };
    const url = getAbilityImageUrl(hero, "attack");
    expect(url).toBeNull();
  });
});
