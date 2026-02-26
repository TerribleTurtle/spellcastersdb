import { describe, expect, it } from "vitest";
import { create } from "zustand";

import { INITIAL_DECK } from "@/services/api/persistence";
import { DeckBuilderState } from "@/store/types";
import { DeckFactory } from "@/tests/factories/deck-factory";

import { createSoloSlice } from "../createSoloSlice";

// Stub enough of the overall state so createSoloSlice can be stood up inside Zustand.
const useStore = create<DeckBuilderState>()(
  (...a) =>
    ({
      ...createSoloSlice(...a),
      // Stub other slices that TS might complain about if missing entirely, but cast as any
    }) as any
);

describe("createSoloSlice.ts", () => {
  it("should have correct initial state", () => {
    const state = useStore.getState();
    expect(state.currentDeck).toBeDefined();
    expect(state.currentDeck.name).toBe("New Deck");
    expect(state.currentDeck.slots).toHaveLength(5);
  });

  it("should replace entire deck on setDeck", () => {
    const newDeck = { ...INITIAL_DECK, name: "Replaced" };
    useStore.getState().setDeck(newDeck);

    expect(useStore.getState().currentDeck.name).toBe("Replaced");
  });

  it("should set and remove spellcaster", () => {
    const caster = DeckFactory.createSpellcaster({ name: "Test Caster" });

    // Set
    useStore.getState().setSpellcaster(caster);
    expect(useStore.getState().currentDeck.spellcaster?.name).toBe(
      "Test Caster"
    );

    // Remove
    useStore.getState().removeSpellcaster();
    expect(useStore.getState().currentDeck.spellcaster).toBeNull();
  });

  it("should set a slot correctly on success", () => {
    // Reset to clean slate
    useStore.getState().setDeck({ ...INITIAL_DECK, name: "Test Builder" });

    const unit = DeckFactory.createUnit({ name: "My Unit" });
    useStore.getState().setSlot(0, unit);

    expect(useStore.getState().currentDeck.slots[0].unit?.name).toBe("My Unit");
  });

  it("should not mutate state on invalid setSlot (e.g. unit into Titan slot)", () => {
    useStore.getState().setDeck({ ...INITIAL_DECK });
    const unit = DeckFactory.createUnit();

    // Slot 4 is Titan
    useStore.getState().setSlot(4, unit);
    expect(useStore.getState().currentDeck.slots[4].unit).toBeNull();
  });

  it("should clear a slot", () => {
    useStore.getState().setDeck({ ...INITIAL_DECK });
    const unit = DeckFactory.createUnit();
    useStore.getState().setSlot(0, unit);

    expect(useStore.getState().currentDeck.slots[0].unit).toBeDefined();
    useStore.getState().clearSlot(0);
    expect(useStore.getState().currentDeck.slots[0].unit).toBeNull();
  });

  it("should swap slots successfully", () => {
    useStore.getState().setDeck({ ...INITIAL_DECK });
    const u1 = DeckFactory.createUnit({ name: "U1", entity_id: "u1" });
    const u2 = DeckFactory.createUnit({ name: "U2", entity_id: "u2" });

    useStore.getState().setSlot(0, u1);
    useStore.getState().setSlot(1, u2);

    useStore.getState().swapSlots(0, 1);

    expect(useStore.getState().currentDeck.slots[0].unit?.name).toBe("U2");
    expect(useStore.getState().currentDeck.slots[1].unit?.name).toBe("U1");
  });

  describe("quickAdd action", () => {
    it("should return an error for non-placeable categories like Consumable", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      const cons = { ...DeckFactory.createUnit(), category: "Consumable" };

      const res = useStore.getState().quickAdd(cons as any);
      expect(typeof res).toBe("string");
    });

    it("should quickAdd a unit to the first available unit slot", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      const unit = DeckFactory.createUnit({ name: "Quickly Added" });

      const res = useStore.getState().quickAdd(unit);

      expect(res).toBeNull(); // null means success
      expect(useStore.getState().currentDeck.slots[0].unit?.name).toBe(
        "Quickly Added"
      );
    });

    it("should return an error if the deck is full", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });

      // Fill all 4 unit slots
      useStore.getState().quickAdd(DeckFactory.createUnit());
      useStore.getState().quickAdd(DeckFactory.createUnit());
      useStore.getState().quickAdd(DeckFactory.createUnit());
      useStore.getState().quickAdd(DeckFactory.createUnit());

      // Try to add a 5th
      const res = useStore.getState().quickAdd(DeckFactory.createUnit());
      expect(typeof res).toBe("string");
    });
  });

  it("should clear the deck completely", () => {
    useStore
      .getState()
      .setDeck({ ...INITIAL_DECK, id: "deck_id", name: "Custom" });
    useStore.getState().clearDeck();

    const state = useStore.getState().currentDeck;
    expect(state.id).toBeUndefined();
    expect(state.name).toBe("New Deck");
  });

  it("should rename the deck", () => {
    useStore.getState().setDeckName("Renamed Again");
    expect(useStore.getState().currentDeck.name).toBe("Renamed Again");
  });
});
