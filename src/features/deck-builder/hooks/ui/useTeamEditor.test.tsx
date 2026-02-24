/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
// @ts-nocheck
// TODO(2027-Q1): Replace `as any` mock casts with properly typed test factories
// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTeamBuilder } from "@/features/team-builder/hooks/useTeamBuilder";
import { useAccordionState } from "@/hooks/useAccordionState";
import { useToast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";
import { isDeckEmpty } from "@/services/utils/deck-utils";
import { useDeckStore } from "@/store/index";
import { selectIsExistingTeam, selectIsTeamSaved } from "@/store/selectors";
import { Deck } from "@/types/deck";

import { useTeamEditor } from "./useTeamEditor";

vi.mock("uuid", () => ({
  v4: () => "mocked-uuid",
}));

vi.mock("@/features/team-builder/hooks/useTeamBuilder", () => ({
  useTeamBuilder: vi.fn(),
}));

vi.mock("@/hooks/useAccordionState", () => ({
  useAccordionState: vi.fn(),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/lib/clipboard", () => ({
  copyToClipboard: vi.fn(),
}));

vi.mock("@/services/utils/deck-utils", () => ({
  isDeckEmpty: vi.fn(),
}));

vi.mock("@/store/index", () => ({
  useDeckStore: vi.fn(),
}));

vi.mock("@/store/selectors", () => ({
  selectIsExistingTeam: vi.fn(),
  selectIsTeamSaved: vi.fn(),
}));

describe("useTeamEditor", () => {
  let mockSetTeamDecks: ReturnType<typeof vi.fn>;
  let mockSetTeamName: ReturnType<typeof vi.fn>;
  let mockOpenCommandCenter: ReturnType<typeof vi.fn>;
  let mockClearDeck: ReturnType<typeof vi.fn>;
  let mockSaveTeam: ReturnType<typeof vi.fn>;
  let mockSaveTeamAsCopy: ReturnType<typeof vi.fn>;
  let mockImportDeckToLibrary: ReturnType<typeof vi.fn>;
  let mockClearTeam: ReturnType<typeof vi.fn>;

  let mockSetActiveSlot: ReturnType<typeof vi.fn>;
  let mockSetExpandedState: ReturnType<typeof vi.fn>;
  let mockShowToast: ReturnType<typeof vi.fn>;

  const defaultDecks: Deck[] = [
    {
      id: "d1",
      name: "Deck 1",
      slots: [] as any,
      spellcaster: null,
    },
    {
      id: "d2",
      name: "Deck 2",
      slots: [] as any,
      spellcaster: null,
    },
    {
      id: "d3",
      name: "Deck 3",
      slots: [] as any,
      spellcaster: null,
    },
  ];

  beforeEach(() => {
    mockSetTeamDecks = vi.fn();
    mockSetTeamName = vi.fn();
    mockOpenCommandCenter = vi.fn();
    mockClearDeck = vi.fn();
    mockSaveTeam = vi.fn();
    mockSaveTeamAsCopy = vi.fn();
    mockImportDeckToLibrary = vi.fn();
    mockClearTeam = vi.fn();
    mockSetActiveSlot = vi.fn();
    mockSetExpandedState = vi.fn();
    mockShowToast = vi.fn();

    vi.stubGlobal("innerWidth", 1920); // Desktop view by default

    vi.mocked(useTeamBuilder).mockReturnValue({
      activeSlot: 0,
      setActiveSlot: mockSetActiveSlot,
      teamName: "My Team",
      teamDecks: defaultDecks,
    } as any);

    vi.mocked(useAccordionState).mockReturnValue({
      expandedState: [true, false, false],
      setExpandedState: mockSetExpandedState,
      toggleAccordion: vi.fn(),
      expandAll: vi.fn(),
      collapseAll: vi.fn(),
    } as any);

    vi.mocked(useToast).mockReturnValue({
      showToast: mockShowToast,
      toasts: [],
      dismissToast: vi.fn(),
    } as any);

    vi.mocked(useDeckStore).mockImplementation((selector: any) => {
      const state = {
        setTeamDecks: mockSetTeamDecks,
        setTeamName: mockSetTeamName,
        openCommandCenter: mockOpenCommandCenter,
        currentDeck: defaultDecks[0],
        clearDeck: mockClearDeck,
        saveTeam: mockSaveTeam,
        saveTeamAsCopy: mockSaveTeamAsCopy,
        activeTeamId: "team-id",
        importDeckToLibrary: mockImportDeckToLibrary,
        clearTeam: mockClearTeam,
      };
      return selector(state as any);
    });

    vi.mocked(selectIsTeamSaved).mockReturnValue(true);
    vi.mocked(selectIsExistingTeam).mockReturnValue(true);
    vi.mocked(isDeckEmpty).mockReturnValue(false); // Deck is not empty by default
    vi.mocked(copyToClipboard).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe("Initialization & Responsive State", () => {
    it("should initialize safely", () => {
      const { result } = renderHook(() => useTeamEditor());
      expect(result.current.teamName).toBe("My Team");
    });

    it("should auto-select slot 0 and setup accordion if activeSlot is null", () => {
      vi.mocked(useTeamBuilder).mockReturnValue({
        activeSlot: null,
        setActiveSlot: mockSetActiveSlot,
      } as any);

      renderHook(() => useTeamEditor());

      expect(mockSetActiveSlot).toHaveBeenCalledWith(0);
      expect(mockSetExpandedState).toHaveBeenCalledWith([true, false, false]);
    });
  });

  describe("handleRename", () => {
    it("should update teamDecks with new deck name", () => {
      const { result } = renderHook(() => useTeamEditor());

      act(() => {
        result.current.handleRename(1, "New Deck Two");
      });

      expect(mockSetTeamDecks).toHaveBeenCalled();
      const updatedDecks = mockSetTeamDecks.mock.calls[0][0];
      expect(updatedDecks[1].name).toBe("New Deck Two");
    });
  });

  describe("handleTeamSave", () => {
    it("should call saveTeam with active ID, teamName, and current active slot override", () => {
      const { result } = renderHook(() => useTeamEditor());

      act(() => {
        result.current.handleTeamSave();
      });

      expect(mockSaveTeam).toHaveBeenCalledWith(
        "team-id",
        "My Team",
        0,
        defaultDecks[0]
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        "Team saved successfully",
        "success"
      );
    });
  });

  describe("handleTeamClear", () => {
    it("should directly clear team if it is saved", () => {
      vi.mocked(selectIsTeamSaved).mockReturnValue(true);
      const { result } = renderHook(() => useTeamEditor());

      act(() => result.current.handleTeamClear());

      expect(mockClearTeam).toHaveBeenCalled();
      expect(result.current.showUnsavedTeamModal).toBe(false);
    });

    it("should show UnsavedTeamModal if team is NOT saved", () => {
      vi.mocked(selectIsTeamSaved).mockReturnValue(false);
      const { result } = renderHook(() => useTeamEditor());

      act(() => result.current.handleTeamClear());

      expect(mockClearTeam).not.toHaveBeenCalled();
      expect(result.current.showUnsavedTeamModal).toBe(true);
    });
  });

  describe("handleSlotClear", () => {
    it("should open warning modal if trying to clear a non-empty, unsaved team's slot", () => {
      vi.mocked(isDeckEmpty).mockReturnValue(false);
      vi.mocked(selectIsTeamSaved).mockReturnValue(false);
      const { result } = renderHook(() => useTeamEditor());

      expect(result.current.slotToClear).toBe(null);

      act(() => {
        result.current.handleSlotClear(1);
      });

      expect(result.current.slotToClear).toBe(1);
    });

    it("should immediately perform clear (override) if team is saved and slot is not empty", () => {
      vi.mocked(isDeckEmpty).mockReturnValue(false);
      vi.mocked(selectIsTeamSaved).mockReturnValue(true); // Saved!
      const { result } = renderHook(() => useTeamEditor());

      act(() => {
        result.current.handleSlotClear(1);
      });

      expect(result.current.slotToClear).toBe(null); // No modal
      expect(mockSetTeamDecks).toHaveBeenCalled(); // Reset deck 1 to Initial
    });

    it("should clear global store deck directly if the targeted slot IS the active slot (and empty)", () => {
      vi.mocked(isDeckEmpty).mockReturnValue(true);

      // activeSlot is 0, we clear index 0
      const { result } = renderHook(() => useTeamEditor());

      act(() => {
        result.current.handleSlotClear(0);
      });

      expect(mockClearDeck).toHaveBeenCalled();
      expect(mockSetTeamDecks).not.toHaveBeenCalled();
    });
  });

  describe("handleTeamShare", () => {
    it("should delegate to create-short-link service and show success toast", async () => {
      // Mock the dynamic import inside the function
      vi.mock("@/services/sharing/create-short-link", () => ({
        createShortLink: vi.fn().mockResolvedValue({
          url: "https://short.ly",
          isShortLink: true,
          rateLimited: false,
        }),
      }));

      const { result } = renderHook(() => useTeamEditor());

      await act(async () => {
        await result.current.handleTeamShare();
      });

      expect(copyToClipboard).toHaveBeenCalledWith("https://short.ly");
      expect(mockShowToast).toHaveBeenCalledWith(
        "Team Link Copied!",
        "success"
      );
    });
  });
});
