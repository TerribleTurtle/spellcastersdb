import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DragRoutingService } from "@/services/dnd/drag-routing";
import { findAutoFillSlot } from "@/services/utils/deck-utils";

import { useDeckBuilder } from "../useDeckBuilder";
import { useDragDrop } from "../useDragDrop";

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("../useDeckBuilder", () => ({
  useDeckBuilder: vi.fn(),
}));

const showToastMock = vi.fn();
vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

vi.mock("@/services/dnd/drag-routing", () => ({
  DragRoutingService: {
    determineAction: vi.fn(() => ({ type: "NO_OP" })),
  },
}));

vi.mock("@/services/utils/deck-utils", () => ({
  findAutoFillSlot: vi.fn(() => -1),
}));

// ─── Helpers & Scoped Mocks ─────────────────────────────────────────────────

const setActiveDragItemMock = vi.fn();
const closeInspectorMock = vi.fn();
const setSlotMock = vi.fn();
const setSpellcasterMock = vi.fn();
const removeSpellcasterMock = vi.fn();
const moveSlotMock = vi.fn();
const clearSlotMock = vi.fn();
const setTeamSlotMock = vi.fn();
const setTeamSpellcasterMock = vi.fn();
const removeTeamSpellcasterMock = vi.fn();
const swapTeamSlotsMock = vi.fn();
const clearTeamSlotMock = vi.fn();
const moveCardBetweenDecksMock = vi.fn();
const moveSpellcasterBetweenDecksMock = vi.fn();

const BASE_TEAM_DECKS = [
  {
    id: "deck-a",
    name: "Deck A",
    spellcaster: null,
    slots: [
      { index: 0, unit: null, allowedTypes: ["UNIT"] },
      { index: 1, unit: null, allowedTypes: ["UNIT"] },
      { index: 2, unit: null, allowedTypes: ["UNIT"] },
      { index: 3, unit: null, allowedTypes: ["UNIT"] },
      { index: 4, unit: null, allowedTypes: ["TITAN"] },
    ],
  },
  {
    id: "deck-b",
    name: "Deck B",
    spellcaster: null,
    slots: [
      { index: 0, unit: null, allowedTypes: ["UNIT"] },
      { index: 1, unit: null, allowedTypes: ["UNIT"] },
      { index: 2, unit: null, allowedTypes: ["UNIT"] },
      { index: 3, unit: null, allowedTypes: ["UNIT"] },
      { index: 4, unit: null, allowedTypes: ["TITAN"] },
    ],
  },
];

const MOCK_UNIT = { entity_id: "u1", name: "Goblin", category: "Creature" };
const MOCK_SPELLCASTER = {
  entity_id: "sc1",
  spellcaster_id: "sc1",
  name: "Pyra",
  category: "Spellcaster",
};

export function mockDeckBuilder(
  overrides: Record<string, any> = {},
  modeOverride: "SOLO" | "TEAM" = "SOLO"
) {
  (useDeckBuilder as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    setSlot: setSlotMock,
    setSpellcaster: setSpellcasterMock,
    removeSpellcaster: removeSpellcasterMock,
    moveSlot: moveSlotMock,
    clearSlot: clearSlotMock,
    currentDeck: {
      id: "solo-deck",
      slots: [
        { index: 0, unit: null },
        { index: 1, unit: null },
        { index: 2, unit: null },
        { index: 3, unit: null },
        { index: 4, unit: null },
      ],
      spellcaster: null,
    },
    setTeamSlot: setTeamSlotMock,
    setTeamSpellcaster: setTeamSpellcasterMock,
    removeTeamSpellcaster: removeTeamSpellcasterMock,
    swapTeamSlots: swapTeamSlotsMock,
    clearTeamSlot: clearTeamSlotMock,
    moveCardBetweenDecks: moveCardBetweenDecksMock,
    moveSpellcasterBetweenDecks: moveSpellcasterBetweenDecksMock,
    teamDecks: modeOverride === "TEAM" ? BASE_TEAM_DECKS : null,
    mode: modeOverride,
    activeDragItem: null,
    setActiveDragItem: setActiveDragItemMock,
    closeInspector: closeInspectorMock,
    ...overrides,
  });
}

export function makeDragEndEvent(
  overrides: Partial<DragEndEvent> = {}
): DragEndEvent {
  return {
    active: {
      id: "active-1",
      data: { current: {} },
      rect: { current: { initial: null, translated: null } },
    },
    over: {
      id: "over-1",
      data: { current: {} },
      rect: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 },
      disabled: false,
    },
    collisions: [],
    delta: { x: 0, y: 0 },
    activatorEvent: new Event("pointerdown"),
    ...overrides,
  } as unknown as DragEndEvent;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("useDragDrop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeckBuilder();
  });

  // ── Phase 1: Foundation Tests ───────────────────────────────────────────

  describe("handleDragStart", () => {
    it("should set active drag item and close inspector", () => {
      const { result } = renderHook(() => useDragDrop());

      const mockEvent = {
        active: {
          data: {
            current: { item: { entity_id: "test-id", name: "Test Card" } },
          },
        },
      } as unknown as DragStartEvent;

      act(() => result.current.handleDragStart(mockEvent));

      expect(setActiveDragItemMock).toHaveBeenCalledWith({
        entity_id: "test-id",
        name: "Test Card",
      });
      expect(closeInspectorMock).toHaveBeenCalled();
    });

    it("should not set drag item when data.current is undefined", () => {
      const { result } = renderHook(() => useDragDrop());

      const mockEvent = {
        active: { data: { current: undefined } },
      } as unknown as DragStartEvent;

      act(() => result.current.handleDragStart(mockEvent));

      expect(setActiveDragItemMock).not.toHaveBeenCalled();
      expect(closeInspectorMock).toHaveBeenCalled();
    });

    it("should not set drag item when item property is missing", () => {
      const { result } = renderHook(() => useDragDrop());

      const mockEvent = {
        active: { data: { current: { type: "BROWSER_CARD" } } },
      } as unknown as DragStartEvent;

      act(() => result.current.handleDragStart(mockEvent));

      expect(setActiveDragItemMock).not.toHaveBeenCalled();
    });
  });

  describe("handleDragCancel", () => {
    it("should clear drag state and show info toast", () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragCancel());

      expect(setActiveDragItemMock).toHaveBeenCalledWith(null);
      expect(showToastMock).toHaveBeenCalledWith("Drag cancelled", "info");
    });
  });

  describe("handleDragEnd - NO_OP", () => {
    it("should clear drag item and return early for NO_OP", () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(setActiveDragItemMock).toHaveBeenCalledWith(null);
      expect(setSlotMock).not.toHaveBeenCalled();
      expect(moveSlotMock).not.toHaveBeenCalled();
    });
  });

  // ── Phase 2: Solo Mode Verification ─────────────────────────────────────

  describe("handleDragEnd - SET_SLOT (Solo)", () => {
    it("should call setSlot with correct index and item", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SLOT",
        index: 2,
        item: MOCK_UNIT as any,
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(setSlotMock).toHaveBeenCalledWith(2, MOCK_UNIT);
    });

    it("should auto-fill when index is -1 and slot found", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SLOT",
        index: -1,
        item: MOCK_UNIT as any,
      });
      vi.mocked(findAutoFillSlot).mockReturnValue(1);
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(findAutoFillSlot).toHaveBeenCalled();
      expect(setSlotMock).toHaveBeenCalledWith(1, MOCK_UNIT);
    });

    it("should show error toast when auto-fill finds no empty slot", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SLOT",
        index: -1,
        item: MOCK_UNIT as any,
      });
      vi.mocked(findAutoFillSlot).mockReturnValue(-1);
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(showToastMock).toHaveBeenCalledWith("Deck is full", "error");
      expect(setSlotMock).not.toHaveBeenCalled();
    });
  });

  describe("handleDragEnd - MOVE_SLOT (Solo)", () => {
    it("should call moveSlot with source and target indices", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 0,
        targetIndex: 2,
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(moveSlotMock).toHaveBeenCalledWith(0, 2);
    });

    it("should not call moveSlot when targetIndex is -1", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 0,
        targetIndex: -1,
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(moveSlotMock).not.toHaveBeenCalled();
    });
  });

  describe("handleDragEnd - CLEAR_SLOT (Solo)", () => {
    it("should call clearSlot with correct index", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "CLEAR_SLOT",
        index: 3,
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(clearSlotMock).toHaveBeenCalledWith(3);
    });
  });

  describe("handleDragEnd - SET_SPELLCASTER (Solo)", () => {
    it("should call setSpellcaster with item", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SPELLCASTER",
        item: MOCK_SPELLCASTER as any,
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(setSpellcasterMock).toHaveBeenCalledWith(MOCK_SPELLCASTER);
    });
  });

  describe("handleDragEnd - REMOVE_SPELLCASTER (Solo)", () => {
    it("should call removeSpellcaster", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "REMOVE_SPELLCASTER",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(removeSpellcasterMock).toHaveBeenCalled();
    });
  });

  // ── Phase 3: Team Mode & Cross-Deck Operations ──────────────────────────

  describe("handleDragEnd - SET_SLOT (Team)", () => {
    beforeEach(() => {
      mockDeckBuilder({}, "TEAM");
    });

    it("should call setTeamSlot with deck index and slot index", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SLOT",
        index: 0,
        item: MOCK_UNIT as any,
        deckId: "deck-a",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(setTeamSlotMock).toHaveBeenCalledWith(0, 0, MOCK_UNIT);
    });

    it("should auto-fill team slot when index is -1", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SLOT",
        index: -1,
        item: MOCK_UNIT as any,
        deckId: "deck-b",
      });
      vi.mocked(findAutoFillSlot).mockReturnValue(3);
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(setTeamSlotMock).toHaveBeenCalledWith(1, 3, MOCK_UNIT);
    });

    it("should show error when team deck is full on auto-fill", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SLOT",
        index: -1,
        item: MOCK_UNIT as any,
        deckId: "deck-a",
      });
      vi.mocked(findAutoFillSlot).mockReturnValue(-1);
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(showToastMock).toHaveBeenCalledWith("Deck is full", "error");
      expect(setTeamSlotMock).not.toHaveBeenCalled();
    });

    it("should show error when deckId is invalid", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SLOT",
        index: 0,
        item: MOCK_UNIT as any,
        deckId: "nonexistent-deck",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(showToastMock).toHaveBeenCalledWith(
        "Invalid Drop Target",
        "error"
      );
      expect(setTeamSlotMock).not.toHaveBeenCalled();
    });
  });

  describe("handleDragEnd - MOVE_SLOT (Team)", () => {
    beforeEach(() => {
      mockDeckBuilder({ activeDragItem: MOCK_UNIT }, "TEAM");
    });

    it("should swap within same deck", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 0,
        targetIndex: 2,
        deckId: "deck-a",
        sourceDeckId: "deck-a",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(swapTeamSlotsMock).toHaveBeenCalledWith(0, 0, 2);
    });

    it("should move card between different decks", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 1,
        targetIndex: 3,
        deckId: "deck-b",
        sourceDeckId: "deck-a",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(moveCardBetweenDecksMock).toHaveBeenCalledWith(0, 1, 1, 3);
    });

    it("should show error toast when cross-deck move returns error", () => {
      moveCardBetweenDecksMock.mockReturnValue("Type mismatch");
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 0,
        targetIndex: 0,
        deckId: "deck-b",
        sourceDeckId: "deck-a",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(showToastMock).toHaveBeenCalledWith("Type mismatch", "error");
    });

    it("should auto-fill target slot when targetIndex is -1", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 0,
        targetIndex: -1,
        deckId: "deck-a",
      });
      vi.mocked(findAutoFillSlot).mockReturnValue(2);
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(swapTeamSlotsMock).toHaveBeenCalledWith(0, 0, 2);
    });

    it("should show error when auto-fill finds no slot", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 0,
        targetIndex: -1,
        deckId: "deck-a",
      });
      vi.mocked(findAutoFillSlot).mockReturnValue(-1);
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(showToastMock).toHaveBeenCalledWith("Deck is full", "error");
      expect(swapTeamSlotsMock).not.toHaveBeenCalled();
    });
  });

  describe("handleDragEnd - CLEAR_SLOT (Team)", () => {
    beforeEach(() => {
      mockDeckBuilder({}, "TEAM");
    });

    it("should call clearTeamSlot with deck index and slot index", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "CLEAR_SLOT",
        index: 1,
        deckId: "deck-b",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(clearTeamSlotMock).toHaveBeenCalledWith(1, 1);
    });

    it("should show error when deckId is invalid", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "CLEAR_SLOT",
        index: 0,
        deckId: "bad-id",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(showToastMock).toHaveBeenCalledWith(
        "Invalid Drop Target",
        "error"
      );
    });
  });

  describe("handleDragEnd - SET_SPELLCASTER (Team)", () => {
    beforeEach(() => {
      mockDeckBuilder({}, "TEAM");
    });

    it("should call setTeamSpellcaster with deck index and item", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SPELLCASTER",
        item: MOCK_SPELLCASTER as any,
        deckId: "deck-b",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(setTeamSpellcasterMock).toHaveBeenCalledWith(1, MOCK_SPELLCASTER);
    });

    it("should move spellcaster between decks when sourceDeckId differs", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SPELLCASTER",
        item: MOCK_SPELLCASTER as any,
        deckId: "deck-b",
        sourceDeckId: "deck-a",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(moveSpellcasterBetweenDecksMock).toHaveBeenCalledWith(0, 1);
      expect(setTeamSpellcasterMock).not.toHaveBeenCalled();
    });

    it("should call setTeamSpellcaster when sourceDeckId matches target", () => {
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SPELLCASTER",
        item: MOCK_SPELLCASTER as any,
        deckId: "deck-a",
        sourceDeckId: "deck-a",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(setTeamSpellcasterMock).toHaveBeenCalledWith(0, MOCK_SPELLCASTER);
      expect(moveSpellcasterBetweenDecksMock).not.toHaveBeenCalled();
    });
  });

  // ── Phase 4: Edge Cases & Auto-Fill Fallbacks ───────────────────────────

  describe("handleDragEnd - MOVE_SLOT Team (activeDragItem null fallback)", () => {
    it("should use manual slot search when activeDragItem is null", () => {
      // activeDragItem is null, so the hook falls back to finding first empty unit slot (index < 4)
      mockDeckBuilder({ activeDragItem: null }, "TEAM");
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 0,
        targetIndex: -1,
        deckId: "deck-a",
      });
      // findAutoFillSlot should NOT be called (only called when activeDragItem is present)
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      // Fallback finds first empty slot at index 0 (all slots are empty)
      expect(swapTeamSlotsMock).toHaveBeenCalledWith(0, 0, 0);
    });
  });

  describe("handleDragEnd - REMOVE_SPELLCASTER Team (missing deckId fallback)", () => {
    it("should fall through to solo removeSpellcaster when no deckId provided in Team mode", () => {
      mockDeckBuilder({}, "TEAM");
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "REMOVE_SPELLCASTER",
        // No deckId — isTeamMode resolves to false, hits solo fallback
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(removeSpellcasterMock).toHaveBeenCalled();
      expect(removeTeamSpellcasterMock).not.toHaveBeenCalled();
    });
  });

  describe("handleDragEnd - REMOVE_SPELLCASTER Team (valid deckId)", () => {
    it("should call removeTeamSpellcaster with correct deck index", () => {
      mockDeckBuilder({}, "TEAM");
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "REMOVE_SPELLCASTER",
        deckId: "deck-b",
      });
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      expect(removeTeamSpellcasterMock).toHaveBeenCalledWith(1);
    });
  });

  // ── Phase 5: Adversarial Testing (Evil & Mean Scenarios) ────────────────

  describe("Adversarial Edge Cases", () => {
    // Attack 1: The Null Dereference Bomb
    it("should survive mode=TEAM with null teamDecks without crashing (Null Dereference Bomb)", () => {
      // Setup the bomb: Mode is TEAM, but teamDecks is missing (e.g. store race condition)
      mockDeckBuilder({ teamDecks: null }, "TEAM");
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 1,
        targetIndex: -1,
        deckId: "deck-a", // This will try to resolve in getDeckIndex
      });

      const { result } = renderHook(() => useDragDrop());

      // Proves the guard catching `targetDeckIndex === -1` intercepts the request
      // *before* it can reach the fatal `teamDecks![targetDeckIndex]` assertion.
      expect(() => {
        act(() => result.current.handleDragEnd(makeDragEndEvent()));
      }).not.toThrow();

      // Guard should have fired
      expect(showToastMock).toHaveBeenCalledWith(
        "Invalid Drop Target",
        "error"
      );
    });

    // Attack 2: The Self-Swap Loop
    it("should harmlessly pass same-index swaps to the store (Self-Swap Loop)", () => {
      mockDeckBuilder({ activeDragItem: MOCK_UNIT }, "TEAM");
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 2,
        targetIndex: 2, // Dropped on itself
        deckId: "deck-a",
        sourceDeckId: "deck-a",
      });

      const { result } = renderHook(() => useDragDrop());
      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      // Store is expected to handle it (likely a no-op internally, but the hook must route it correctly)
      expect(swapTeamSlotsMock).toHaveBeenCalledWith(0, 2, 2);
    });

    // Attack 3: The Out-of-Bounds Phantom
    it("should blindly pass out-of-bounds indices to the store (Out-of-Bounds Phantom)", () => {
      mockDeckBuilder({}, "SOLO");
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SLOT",
        index: 99, // Magic illegal index
        item: MOCK_UNIT as any,
      });

      const { result } = renderHook(() => useDragDrop());
      expect(() => {
        act(() => result.current.handleDragEnd(makeDragEndEvent()));
      }).not.toThrow();

      expect(setSlotMock).toHaveBeenCalledWith(99, MOCK_UNIT);
      expect(showToastMock).not.toHaveBeenCalled(); // No false-positive errors
    });

    // Attack 4: The Spellcaster Smuggle
    it("should reject smuggled spellcasters in unit slots with Deck Full toast (Spellcaster Smuggle)", () => {
      mockDeckBuilder({}, "SOLO");
      // Force the router to send a Spellcaster into SET_SLOT (should ideally be SET_SPELLCASTER)
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SLOT",
        index: -1, // Force auto-fill calculation
        item: MOCK_SPELLCASTER as any, // Smuggled payload
      });
      // deck-utils inherently returns -1 for spellcasters during auto-fill
      vi.mocked(findAutoFillSlot).mockReturnValue(-1);

      const { result } = renderHook(() => useDragDrop());
      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      // Hook caught the -1 and rejected it. No corruption.
      expect(showToastMock).toHaveBeenCalledWith("Deck is full", "error");
      expect(setSlotMock).not.toHaveBeenCalled();
    });

    // Attack 5: The Negative Index Wormhole
    it("should process negative source indices without crashing (Negative Index Wormhole)", () => {
      mockDeckBuilder({}, "SOLO");
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: -1, // Illegal source
        targetIndex: 0,
      });

      const { result } = renderHook(() => useDragDrop());
      expect(() => {
        act(() => result.current.handleDragEnd(makeDragEndEvent()));
      }).not.toThrow();

      expect(moveSlotMock).toHaveBeenCalledWith(-1, 0);
    });

    // Attack 6: The Cross-Deck Source Poisoning
    it("should fallback to swapTeamSlots if source and target resolve to the same deck (Source Poisoning)", () => {
      mockDeckBuilder({ activeDragItem: MOCK_UNIT }, "TEAM");
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 1,
        targetIndex: 4,
        deckId: "deck-b", // Target is Deck B
        sourceDeckId: "deck-b", // Source is ALSO Deck B
      });

      const { result } = renderHook(() => useDragDrop());
      act(() => result.current.handleDragEnd(makeDragEndEvent()));

      // Despite sourceDeckId being provided (which usually implies cross-deck),
      // the indices match, so it MUST route to same-deck swap.
      expect(moveCardBetweenDecksMock).not.toHaveBeenCalled();
      expect(swapTeamSlotsMock).toHaveBeenCalledWith(1, 1, 4);
    });

    // Attack 7: The Double-Tap State Race
    it("should handle double-fires safely resolving stale state fallbacks (Double-Tap State Race)", () => {
      mockDeckBuilder({ activeDragItem: null }, "TEAM"); // Simulating the second render where state is already cleared
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "MOVE_SLOT",
        sourceIndex: 0,
        targetIndex: -1,
        deckId: "deck-a",
      });

      const { result } = renderHook(() => useDragDrop());

      expect(() => {
        act(() => {
          // Fire event 1
          result.current.handleDragEnd(
            makeDragEndEvent({ active: { id: "1" } as any })
          );
          // Fire event 2 synchronously (simulating React event queue race condition)
          result.current.handleDragEnd(
            makeDragEndEvent({ active: { id: "2" } as any })
          );
        });
      }).not.toThrow();

      // Should hit fallback `find` manually twice
      expect(setActiveDragItemMock).toHaveBeenCalledTimes(2);
      expect(swapTeamSlotsMock).toHaveBeenCalledTimes(2);
      expect(swapTeamSlotsMock).toHaveBeenNthCalledWith(1, 0, 0, 0);
      expect(swapTeamSlotsMock).toHaveBeenNthCalledWith(2, 0, 0, 0);
    });

    // Attack 8: The Void Walk
    it("should process actions blindly even if raw over data is completely null (Void Walk)", () => {
      mockDeckBuilder({}, "SOLO");
      // The attacker forces SET_SLOT despite the event dropping in the void
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "SET_SLOT",
        index: 2,
        item: MOCK_UNIT as any,
      });

      const voidEvent = makeDragEndEvent({ over: null }); // Dropped in void
      const { result } = renderHook(() => useDragDrop());

      act(() => result.current.handleDragEnd(voidEvent));

      // Hook relies 100% on the router, ignores the fact that `over` is null.
      expect(setSlotMock).toHaveBeenCalledWith(2, MOCK_UNIT);
    });

    // Attack 9: Rogue Routing (The HACK_THE_MAINFRAME attack)
    it("should ignore unregistered action types safely (Rogue Routing)", () => {
      mockDeckBuilder({}, "SOLO");
      vi.mocked(DragRoutingService.determineAction).mockReturnValue({
        type: "HACK_THE_MAINFRAME",
      } as any); // Illegal payload

      const { result } = renderHook(() => useDragDrop());

      expect(() => {
        act(() => result.current.handleDragEnd(makeDragEndEvent()));
      }).not.toThrow();

      // No actions invoked
      expect(setSlotMock).not.toHaveBeenCalled();
      expect(moveSlotMock).not.toHaveBeenCalled();
      expect(setTeamSlotMock).not.toHaveBeenCalled();
    });
  });

  // ── Return Shape ────────────────────────────────────────────────────────

  describe("returned interface", () => {
    it("should expose sensors, activeDragItem, and all handlers", () => {
      const { result } = renderHook(() => useDragDrop());

      expect(result.current.sensors).toBeDefined();
      expect(result.current.activeDragItem).toBeNull();
      expect(typeof result.current.handleDragStart).toBe("function");
      expect(typeof result.current.handleDragEnd).toBe("function");
      expect(typeof result.current.handleDragCancel).toBe("function");
    });
  });
});
