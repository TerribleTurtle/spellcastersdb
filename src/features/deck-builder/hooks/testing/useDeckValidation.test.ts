import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDeckValidation } from "@/features/shared/hooks/useDeckValidation";
import { Spellcaster, Unit } from "@/types/api";
import { Deck, SlotType } from "@/types/deck";

// Mock Deck Helper
const createMockDeck = (override: Partial<Deck> = {}): Deck => ({
  id: "test",
  name: "Test Deck",
  spellcaster: null,
  slots: [
    { index: 0, unit: null, allowedTypes: [SlotType.Unit] },
    { index: 1, unit: null, allowedTypes: [SlotType.Unit] },
    { index: 2, unit: null, allowedTypes: [SlotType.Unit] },
    { index: 3, unit: null, allowedTypes: [SlotType.Unit] },
    { index: 4, unit: null, allowedTypes: [SlotType.Titan] },
  ],
  ...override,
});

describe("useDeckValidation", () => {
  it("should be invalid if no spellcaster selected", () => {
    const deck = createMockDeck({ spellcaster: null });
    const { result } = renderHook(() => useDeckValidation(deck));
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors).toContain("Select a Spellcaster");
  });

  it("should be invalid if unit slots are empty", () => {
    const deck = createMockDeck({
      spellcaster: {
        name: "Mage",
        spellcaster_id: "m1",
      } as unknown as Spellcaster,
    });
    const { result } = renderHook(() => useDeckValidation(deck));
    expect(result.current.isValid).toBe(false);
    // Might depend on implementation, but typically "deck must have units"
    expect(result.current.errors.length).toBeGreaterThan(0);
  });

  it("should advise adding Rank I/II creatures if missing", () => {
    // Create deck with high rank only
    const deck = createMockDeck({
      spellcaster: {
        name: "Mage",
        spellcaster_id: "m1",
      } as unknown as Spellcaster,
      slots: [
        {
          index: 0,
          unit: {
            name: "Dragon",
            rank: "Rank III",
            category: "Creature",
          } as unknown as Unit,
          allowedTypes: [SlotType.Unit],
        },
        { index: 1, unit: null, allowedTypes: [SlotType.Unit] },
        { index: 2, unit: null, allowedTypes: [SlotType.Unit] },
        { index: 3, unit: null, allowedTypes: [SlotType.Unit] },
        { index: 4, unit: null, allowedTypes: [SlotType.Titan] },
      ],
    });
    const { result } = renderHook(() => useDeckValidation(deck));
    expect(result.current.reminder).toContain(
      "Tip: Include at least one Rank I or II Creature"
    );
  });
});
