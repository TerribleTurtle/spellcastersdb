import { useSearchParams } from "next/navigation";

import { act, renderHook, waitFor } from "@testing-library/react";
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createNewDeck } from "@/services/api/deck-factory";
import { monitoring } from "@/services/monitoring";
import { decodeDeck } from "@/services/utils/encoding";
import { useDeckStore } from "@/store/index";
import { Spellcaster, Unit } from "@/types/api";
import { Deck, DeckSlot } from "@/types/deck";

import { useSoloImport } from "../useSoloImport";

// --- Mocks ---
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

vi.mock("@/services/api/deck-factory", () => ({
  createNewDeck: vi.fn(),
}));

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
  },
}));

// Mock the dynamic import module
vi.mock("@/services/utils/encoding", () => ({
  decodeDeck: vi.fn(),
}));

// --- Test Data ---
const mockUnits = [
  { entity_id: "u1", name: "Unit 1" },
  { entity_id: "u2", name: "Unit 2" },
] as Unit[];

const mockSpellcasters = [
  { spellcaster_id: "sc1", name: "Alpha Caster" },
  { spellcaster_id: "sc2", name: "Beta Caster" },
] as Spellcaster[];

const mockEmptyDeck: Deck = {
  id: "test-deck",
  name: "Test Deck",
  spellcaster: null,
  slots: [
    { index: 0, unit: null, allowedTypes: [] },
    { index: 1, unit: null, allowedTypes: [] },
    { index: 2, unit: null, allowedTypes: [] },
    { index: 3, unit: null, allowedTypes: [] },
    { index: 4, unit: null, allowedTypes: [] },
  ] as Deck["slots"],
};

describe("useSoloImport", () => {
  let mockGet: ReturnType<typeof vi.fn>;
  let setViewingDeckMock: Mock;
  let setViewSummaryMock: Mock;
  let closeCommandCenterMock: Mock;
  let closeInspectorMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGet = vi.fn();
    (useSearchParams as Mock).mockReturnValue({ get: mockGet });

    setViewingDeckMock = vi.fn();
    setViewSummaryMock = vi.fn();
    closeCommandCenterMock = vi.fn();
    closeInspectorMock = vi.fn();

    // Mock the store explicitly
    useDeckStore.setState({
      setViewingDeck: setViewingDeckMock,
      setViewSummary: setViewSummaryMock,
      closeCommandCenter: closeCommandCenterMock,
      closeInspector: closeInspectorMock,
    } as any);

    (createNewDeck as Mock).mockReturnValue(
      JSON.parse(JSON.stringify(mockEmptyDeck))
    );
  });

  afterEach(() => {
    // Reset window.location
    vi.unstubAllGlobals();
  });

  // ── Guard Clauses & Safe Returns ──

  describe("Guard Clauses", () => {
    it("should return early if there is no 'd' param", async () => {
      mockGet.mockReturnValue(null);

      const { result } = renderHook(() =>
        useSoloImport({
          units: mockUnits,
          spellcasters: mockSpellcasters,
          mode: "SOLO",
        })
      );

      expect(result.current.isProcessing).toBe(false);
      expect(decodeDeck).not.toHaveBeenCalled();
      expect(setViewingDeckMock).not.toHaveBeenCalled();
    });

    it("should return early if the mode is not SOLO", async () => {
      mockGet.mockReturnValue("some-hash");

      const { result } = renderHook(() =>
        useSoloImport({
          units: mockUnits,
          spellcasters: mockSpellcasters,
          mode: "TEAM", // Incorrect mode
        })
      );

      // Even though 'd' is present, mode is wrong, so processing aborts silently
      expect(decodeDeck).not.toHaveBeenCalled();
      expect(setViewingDeckMock).not.toHaveBeenCalled();
    });

    it("should prevent infinite loops by deduplicating the same hash", async () => {
      mockGet.mockReturnValue("valid-hash");
      (decodeDeck as Mock).mockReturnValue({
        spellcasterId: "sc1",
        slotIds: [],
        name: "Test",
      });

      const { rerender } = renderHook((props) => useSoloImport(props), {
        initialProps: {
          units: mockUnits,
          spellcasters: mockSpellcasters,
          mode: "SOLO",
        },
      });

      // Wait for first pass to finish async execution
      await waitFor(() => {
        expect(decodeDeck).toHaveBeenCalledTimes(1);
      });

      // Rerender with the EXACT same props (hash hasn't changed in mocked URL)
      rerender({
        units: mockUnits,
        spellcasters: mockSpellcasters,
        mode: "SOLO",
      });

      // It should still only be called once because of lastProcessedHash.current
      expect(decodeDeck).toHaveBeenCalledTimes(1);
    });
  });

  // ── Happy Paths ──

  describe("Happy Paths", () => {
    it("should decode the hash, create a deck, and mutate the store correctly", async () => {
      mockGet.mockReturnValue("happy-hash");
      (decodeDeck as Mock).mockReturnValue({
        spellcasterId: "sc1",
        name: "My Custom Deck",
        slotIds: ["u1", null, "u2", null, null],
      });

      // We expect the factory to be called, then the empty slots populated
      const baseDeck = JSON.parse(JSON.stringify(mockEmptyDeck));
      (createNewDeck as Mock).mockReturnValue(baseDeck);

      renderHook(() =>
        useSoloImport({
          units: mockUnits,
          spellcasters: mockSpellcasters,
          mode: "SOLO",
        })
      );

      await waitFor(() => {
        expect(decodeDeck).toHaveBeenCalledWith("happy-hash");
        expect(createNewDeck).toHaveBeenCalledWith(
          "My Custom Deck",
          mockSpellcasters[0]
        );
        expect(setViewingDeckMock).toHaveBeenCalled();
        expect(setViewSummaryMock).toHaveBeenCalledWith(true);
        expect(closeCommandCenterMock).toHaveBeenCalled();
        expect(closeInspectorMock).toHaveBeenCalled();
      });

      // Verify slot mutations
      const passedDeck = setViewingDeckMock.mock.calls[0][0];
      expect(passedDeck.slots[0].unit).toEqual(mockUnits[0]); // u1
      expect(passedDeck.slots[1].unit).toBeNull();
      expect(passedDeck.slots[2].unit).toEqual(mockUnits[1]); // u2
    });

    it("should provide an 'Imported Deck' fallback name if none is in hash", async () => {
      mockGet.mockReturnValue("fallback-hash");
      // Missing 'name' and invalid 'spellcasterId'
      (decodeDeck as Mock).mockReturnValue({
        spellcasterId: "invalid-id",
        slotIds: [],
      });

      renderHook(() =>
        useSoloImport({
          units: mockUnits,
          spellcasters: mockSpellcasters,
          mode: "SOLO",
        })
      );

      await waitFor(() => {
        // Fallback checks
        expect(createNewDeck).toHaveBeenCalledWith("Imported Deck", undefined);
      });
    });

    it("should use spellcaster name for fallback if available but no explicit deck name", async () => {
      mockGet.mockReturnValue("fallback-sc-hash");
      (decodeDeck as Mock).mockReturnValue({
        spellcasterId: "sc2",
        slotIds: [],
      });

      renderHook(() =>
        useSoloImport({
          units: mockUnits,
          spellcasters: mockSpellcasters,
          mode: "SOLO",
        })
      );

      await waitFor(() => {
        expect(createNewDeck).toHaveBeenCalledWith(
          "Beta Caster Import",
          mockSpellcasters[1]
        );
      });
    });
  });

  // ── Adversarial Tests ──

  describe("Adversarial Scenarios", () => {
    it("should handle decodeDeck throwing an unexpected exception", async () => {
      mockGet.mockReturnValue("poison-hash");
      const mockError = new Error("lz-string crashed!");
      (decodeDeck as Mock).mockImplementation(() => {
        throw mockError;
      });

      const onErrorMock = vi.fn();

      renderHook(() =>
        useSoloImport({
          units: mockUnits,
          spellcasters: mockSpellcasters,
          mode: "SOLO",
          onError: onErrorMock,
        })
      );

      await waitFor(() => {
        expect(monitoring.captureException).toHaveBeenCalledWith(mockError, {
          operation: "soloImport",
        });
        expect(onErrorMock).toHaveBeenCalledWith(
          "Failed to load deck from URL"
        );
        // State should NOT be mutated
        expect(setViewingDeckMock).not.toHaveBeenCalled();
      });
    });

    it("should ignore malformed unit IDs gracefully", async () => {
      mockGet.mockReturnValue("weird-units");
      (decodeDeck as Mock).mockReturnValue({
        spellcasterId: "sc1",
        slotIds: ["does-not-exist", undefined, null, "u1"],
      });

      const baseDeck = JSON.parse(JSON.stringify(mockEmptyDeck));
      (createNewDeck as Mock).mockReturnValue(baseDeck);

      renderHook(() =>
        useSoloImport({
          units: mockUnits,
          spellcasters: mockSpellcasters,
          mode: "SOLO",
        })
      );

      await waitFor(() => {
        expect(setViewingDeckMock).toHaveBeenCalled();
      });

      const passedDeck = setViewingDeckMock.mock.calls[0][0];
      expect(passedDeck.slots[0].unit).toBeNull(); // Not found
      expect(passedDeck.slots[3].unit).toEqual(mockUnits[0]); // Found 'u1'
    });

    it("should ignore slots past index 4 (buffer overflow protection)", async () => {
      mockGet.mockReturnValue("overflow-slots");
      (decodeDeck as Mock).mockReturnValue({
        spellcasterId: "sc1",
        slotIds: ["u1", "u1", "u1", "u1", "u1", "u2", "u2"], // 7 slots
      });

      const baseDeck = JSON.parse(JSON.stringify(mockEmptyDeck));
      (createNewDeck as Mock).mockReturnValue(baseDeck);

      renderHook(() =>
        useSoloImport({
          units: mockUnits,
          spellcasters: mockSpellcasters,
          mode: "SOLO",
        })
      );

      await waitFor(() => {
        expect(setViewingDeckMock).toHaveBeenCalled();
      });

      const passedDeck = setViewingDeckMock.mock.calls[0][0];
      // Expect first 5 slots to be filled
      expect(passedDeck.slots.length).toBe(5);
      expect(passedDeck.slots[0].unit).toBeTruthy();
      expect(passedDeck.slots[4].unit).toBeTruthy();
      // u2 should not be processed
      expect(
        passedDeck.slots.some((s: DeckSlot) => s.unit?.entity_id === "u2")
      ).toBe(false);
    });
  });
});
