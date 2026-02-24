/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
// @ts-nocheck
// TODO(2027-Q1): Replace `as unknown` mock casts with properly typed test factories
// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDeckBuilder } from "@/features/deck-builder/hooks/domain/useDeckBuilder";
import { useToast } from "@/hooks/useToast";
import { useDeckStore } from "@/store/index";

import { useDeckEditorNavigation } from "./useDeckEditorNavigation";
import { SelectableItem, useDeckEditorUI } from "./useDeckEditorUI";
import { useDeckSelection } from "./useDeckSelection";

// Mock dependencies
vi.mock("@/features/deck-builder/hooks/domain/useDeckBuilder", () => ({
  useDeckBuilder: vi.fn(),
}));
vi.mock("@/hooks/useToast", () => ({
  useToast: vi.fn(),
}));
vi.mock("@/store/index", () => ({
  useDeckStore: vi.fn(),
}));
vi.mock("./useDeckEditorNavigation", () => ({
  useDeckEditorNavigation: vi.fn(),
}));
vi.mock("./useDeckSelection", () => ({
  useDeckSelection: vi.fn(),
}));

describe("useDeckEditorUI", () => {
  let mockQuickAdd: ReturnType<typeof vi.fn>;
  let mockSetSlot: ReturnType<typeof vi.fn>;
  let mockSetTeamSlot: ReturnType<typeof vi.fn>;
  let mockShowToast: ReturnType<typeof vi.fn>;
  let mockSetPendingSwapCard: ReturnType<typeof vi.fn>;
  let mockBaseHandleSelectItem: ReturnType<typeof vi.fn>;
  let mockSetActiveMobileTab: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup generic mock implementations
    mockQuickAdd = vi.fn().mockReturnValue(null); // Success by default
    mockSetSlot = vi.fn();
    mockSetTeamSlot = vi.fn();
    mockShowToast = vi.fn();
    mockSetPendingSwapCard = vi.fn();
    mockBaseHandleSelectItem = vi.fn();
    mockSetActiveMobileTab = vi.fn();

    vi.mocked(useDeckBuilder).mockReturnValue({
      mode: "SOLO",
      quickAdd: mockQuickAdd,
      setSlot: mockSetSlot,
      setTeamSlot: mockSetTeamSlot,
      activeSlot: 0,
    } as unknown);

    vi.mocked(useToast).mockReturnValue({
      toasts: [{ id: "1", message: "Last msg", type: "success" }],
      showToast: mockShowToast,
      dismissToast: vi.fn(),
    });

    vi.mocked(useDeckStore).mockImplementation(
      (selector: any  ) => {
        // Very naive mock of zustand store selector
        // In the hook: state => state.pendingSwapCard AND state => state.setPendingSwapCard
        const state = {
          pendingSwapCard: null,
          setPendingSwapCard: mockSetPendingSwapCard,
        };
        return selector(state);
      }
    );

    vi.mocked(useDeckEditorNavigation).mockReturnValue({
      activeMobileTab: "BROWSER",
      setActiveMobileTab: mockSetActiveMobileTab,
      viewSummary: false,
      backToBrowser: vi.fn(),
      openSummary: vi.fn(),
      closeSummary: vi.fn(),
    });

    vi.mocked(useDeckSelection).mockReturnValue({
      selectedItem: null,
      handleSelectItem: mockBaseHandleSelectItem,
      closeInspector: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("handleQuickAdd", () => {
    it("should return true on successful add (no error message)", () => {
      const { result } = renderHook(() => useDeckEditorUI([], []));

      let success;
      act(() => {
        success = result.current.handleQuickAdd({ entity_id: "u1" } as unknown);
      });

      expect(success).toBe(true);
      expect(mockSetPendingSwapCard).not.toHaveBeenCalled();
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it("should trigger swap workflow if deck is full", () => {
      mockQuickAdd.mockReturnValue("Deck is Full. Try something else.");
      const { result } = renderHook(() => useDeckEditorUI([], []));

      let success;
      const item = { entity_id: "u1" } as unknown;
      act(() => {
        success = result.current.handleQuickAdd(item);
      });

      expect(success).toBe(false);
      expect(mockSetPendingSwapCard).toHaveBeenCalledWith(item);
      expect(mockShowToast).toHaveBeenCalledWith(
        "Deck Full. Select a slot to replace.",
        "info"
      );
    });

    it("should show generic error toast for other failures (e.g. Already)", () => {
      mockQuickAdd.mockReturnValue("Cannot add because it is Already in deck.");
      const { result } = renderHook(() => useDeckEditorUI([], []));

      let success;
      act(() => {
        success = result.current.handleQuickAdd({ entity_id: "u1" } as unknown);
      });

      expect(success).toBe(false);
      expect(mockSetPendingSwapCard).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        "Cannot add because it is Already in deck.",
        "destructive"
      );
    });
  });

  describe("handleSelectItem", () => {
    it("should open inspector (base handler) for standard selection", () => {
      const { result } = renderHook(() => useDeckEditorUI([], []));

      const item = { entity_id: "u1" } as unknown;
      act(() => {
        result.current.handleSelectItem(item);
      });

      expect(mockBaseHandleSelectItem).toHaveBeenCalledWith(item);
      expect(mockSetSlot).not.toHaveBeenCalled();
    });

    describe("Swap Workflow Execution", () => {
      const pendingCard = { name: "Swap Card", entity_id: "s1" } as unknown;

      beforeEach(() => {
        vi.mocked(useDeckStore).mockImplementation(
          (selector: any  ) => {
            const state = {
              pendingSwapCard: pendingCard,
              setPendingSwapCard: mockSetPendingSwapCard,
            };
            return selector(state);
          }
        );
      });

      it("should execute SOLO swap and show toast", () => {
        const { result } = renderHook(() => useDeckEditorUI([], []));

        act(() => {
          // Select slot index 1 to swap
          result.current.handleSelectItem(
            { name: "Target Card" } as unknown,
            undefined,
            1
          );
        });

        expect(mockSetSlot).toHaveBeenCalledWith(1, pendingCard);
        expect(mockSetPendingSwapCard).toHaveBeenCalledWith(null);
        expect(mockShowToast).toHaveBeenCalledWith(
          "Swapped Swap Card with Target Card",
          "success"
        );
      });

      it("should execute TEAM swap and show toast", () => {
        vi.mocked(useDeckBuilder).mockReturnValue({
          mode: "TEAM",
          setTeamSlot: mockSetTeamSlot,
          activeSlot: 2, // Team slot 2
          quickAdd: mockQuickAdd,
          setSlot: mockSetSlot,
        } as unknown);

        const { result } = renderHook(() => useDeckEditorUI([], []));

        act(() => {
          // Select slot index 1 to swap
          result.current.handleSelectItem(undefined, undefined, 1); // target item undefined => "Empty Slot"
        });

        expect(mockSetTeamSlot).toHaveBeenCalledWith(2, 1, pendingCard);
        expect(mockSetPendingSwapCard).toHaveBeenCalledWith(null);
        expect(mockShowToast).toHaveBeenCalledWith(
          "Swapped Swap Card with Empty Slot",
          "success"
        );
      });
    });
  });

  describe("Computed fields", () => {
    it("should return lastQuickAdd message from toasts array", () => {
      const { result } = renderHook(() => useDeckEditorUI([], []));
      expect(result.current.lastQuickAdd).toBe("Last msg");
    });

    it("should merge and format browserItems correctly", () => {
      const spellcasters = [{ entity_id: "sc1" }] as unknown as Spellcaster[];
      const units = [{ entity_id: "u1" }] as SelectableItem[];

      const { result } = renderHook(() => useDeckEditorUI(units, spellcasters));

      expect(result.current.browserItems).toHaveLength(2);
      expect(result.current.browserItems[0].category).toBe("Spellcaster");
      expect(result.current.browserItems[0].entity_id).toBe("sc1");
      expect(result.current.browserItems[1].entity_id).toBe("u1");
    });
  });
});
