import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useCalculatorStore } from "@/store/calculator-store";

describe("Calculator Zustand Store (v3)", () => {
  beforeEach(() => {
    // Reset store to initial state
    useCalculatorStore.setState({
      selectedIds: [],
      ownedIds: [],
      hideOwned: false,
      currentKnowledge: 250,
      winRate: 0.5,
      gamesPerDay: 3,
      matchDuration: 20,
    });
  });

  it("initializes with default state", () => {
    const state = useCalculatorStore.getState();
    expect(state.selectedIds).toEqual([]);
    expect(state.ownedIds).toEqual([]);
    expect(state.hideOwned).toBe(false);
    expect(state.currentKnowledge).toBe(250);
    expect(state.winRate).toBe(0.5);
    expect(state.gamesPerDay).toBe(3);
    expect(state.matchDuration).toBe(20);
  });

  describe("Selection Management", () => {
    it("toggles entity selection on/off", () => {
      const { toggleEntity } = useCalculatorStore.getState();

      act(() => toggleEntity("unit_a"));
      expect(useCalculatorStore.getState().selectedIds).toContain("unit_a");

      act(() => toggleEntity("unit_a"));
      expect(useCalculatorStore.getState().selectedIds).not.toContain("unit_a");
    });

    it("selectAll merges without duplicates and ignores owned entities", () => {
      const { toggleOwned, selectAll } = useCalculatorStore.getState();

      // Mark unit_c as owned
      act(() => toggleOwned("unit_c"));

      // Try to select a mix
      act(() => selectAll(["unit_a", "unit_b", "unit_c"]));

      const state = useCalculatorStore.getState();
      expect(state.selectedIds).toHaveLength(2);
      expect(state.selectedIds).toContain("unit_a");
      expect(state.selectedIds).toContain("unit_b");
      expect(state.selectedIds).not.toContain("unit_c"); // Owned should not be selected
    });

    it("clearAll empties selectedIds but keeps ownedIds", () => {
      const { selectAll, toggleOwned, clearAll } =
        useCalculatorStore.getState();

      act(() => {
        toggleOwned("unit_x");
        selectAll(["unit_a", "unit_b"]);
      });

      act(() => clearAll());

      const state = useCalculatorStore.getState();
      expect(state.selectedIds).toEqual([]);
      expect(state.ownedIds).toEqual(["unit_x"]);
    });
  });

  describe("Ownership Management", () => {
    it("toggles entity ownership on/off", () => {
      const { toggleOwned } = useCalculatorStore.getState();

      act(() => toggleOwned("unit_a"));
      expect(useCalculatorStore.getState().ownedIds).toContain("unit_a");

      act(() => toggleOwned("unit_a"));
      expect(useCalculatorStore.getState().ownedIds).not.toContain("unit_a");
    });

    it("toggling entity to owned removes it from selectedIds", () => {
      const { toggleEntity, toggleOwned } = useCalculatorStore.getState();

      act(() => toggleEntity("unit_a"));
      expect(useCalculatorStore.getState().selectedIds).toContain("unit_a");

      // Mark as owned
      act(() => toggleOwned("unit_a"));

      const state = useCalculatorStore.getState();
      expect(state.ownedIds).toContain("unit_a");
      expect(state.selectedIds).not.toContain("unit_a"); // Should be removed!
    });

    it("clearOwned empties ownedIds", () => {
      const { toggleOwned, clearOwned } = useCalculatorStore.getState();

      act(() => toggleOwned("unit_a"));
      act(() => clearOwned());

      expect(useCalculatorStore.getState().ownedIds).toEqual([]);
    });

    it("setHideOwned toggles visibility flag", () => {
      const { setHideOwned } = useCalculatorStore.getState();

      act(() => setHideOwned(true));
      expect(useCalculatorStore.getState().hideOwned).toBe(true);
    });

    it("initializeDefaults safely adds 0-cost base entities without duplicating or keeping them in selected", () => {
      const { toggleOwned, toggleEntity, initializeDefaults } =
        useCalculatorStore.getState();

      // Pre-condition: User already owned unit_x, and had selected base_unit (which shouldn't happen natively but could if they clicked fast)
      act(() => toggleOwned("unit_x"));
      act(() => toggleEntity("base_unit"));

      // Inject defaults
      act(() => initializeDefaults(["base_unit", "base_spell"]));

      const state = useCalculatorStore.getState();

      // Should include previous owns + new defaults
      expect(state.ownedIds).toHaveLength(3);
      expect(state.ownedIds).toContain("unit_x");
      expect(state.ownedIds).toContain("base_unit");
      expect(state.ownedIds).toContain("base_spell");

      // base_unit must be stripped from selectedIds
      expect(state.selectedIds).not.toContain("base_unit");
    });
  });

  describe("Settings & Knowledge Input", () => {
    it("setCurrentKnowledge updates bank", () => {
      const { setCurrentKnowledge } = useCalculatorStore.getState();
      act(() => setCurrentKnowledge(1250));
      expect(useCalculatorStore.getState().currentKnowledge).toBe(1250);
    });

    it("setWinRate updates ratio", () => {
      const { setWinRate } = useCalculatorStore.getState();
      act(() => setWinRate(0.65));
      expect(useCalculatorStore.getState().winRate).toBe(0.65);
    });

    it("setGamesPerDay updates forecast input", () => {
      const { setGamesPerDay } = useCalculatorStore.getState();
      act(() => setGamesPerDay(10));
      expect(useCalculatorStore.getState().gamesPerDay).toBe(10);
    });

    it("setMatchDuration updates match duration and clamps to min 1", () => {
      const { setMatchDuration } = useCalculatorStore.getState();

      act(() => setMatchDuration(45));
      expect(useCalculatorStore.getState().matchDuration).toBe(45);

      // Should clamp to 1 minimum
      act(() => setMatchDuration(0));
      expect(useCalculatorStore.getState().matchDuration).toBe(1);
    });
  });
});
