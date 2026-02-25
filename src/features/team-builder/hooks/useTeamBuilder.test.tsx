// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { useDeckStore } from "@/store/index";
import { selectHasChanges, selectIsEmpty } from "@/store/selectors";

import { useTeamBuilder } from "./useTeamBuilder";
import { useTeamImport } from "./useTeamImport";

// Mock uuid
vi.mock("uuid", () => ({
  v4: () => "mocked-uuid",
}));

// Mock Selectors
vi.mock("@/store/selectors", () => ({
  selectIsEmpty: vi.fn(),
  selectHasChanges: vi.fn(),
}));

// Mock useTeamImport
vi.mock("./useTeamImport", () => ({
  useTeamImport: vi.fn(() => ({
    handleSave: vi.fn(),
    performSave: vi.fn(),
    showSaveModal: false,
    setShowSaveModal: vi.fn(),
    handleImportCancel: vi.fn(),
    handleImportConfirm: vi.fn(),
    handleImportSaveAndOverwrite: vi.fn(),
    showConflictModal: false,
  })),
}));

describe("useTeamBuilder", () => {
  let setViewSummarySpy: any;
  let setViewingTeamSpy: any;
  let setActiveSlotSpy: any;
  let loadTeamFromDataSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state relevant to this hook
    useDeckStore.setState({
      teamDecks: [] as any,
      activeSlot: 0,
      teamName: "Test Team",
      activeTeamId: null,
      savedTeams: [],
      viewSummary: false,
      viewingTeamData: null,
      viewingTeamName: null,
      viewingTeamId: null,
      isReadOnly: false,
    });

    // Setup action spies
    const store = useDeckStore.getState();
    setViewSummarySpy = vi.spyOn(store, "setViewSummary");
    setViewingTeamSpy = vi.spyOn(store, "setViewingTeam");
    setActiveSlotSpy = vi.spyOn(store, "setActiveSlot");
    loadTeamFromDataSpy = vi.spyOn(store, "loadTeamFromData");

    (selectIsEmpty as Mock).mockReturnValue(true);
    (selectHasChanges as Mock).mockReturnValue(false);
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useTeamBuilder());

    expect(result.current.teamName).toBe("Test Team");
    expect(result.current.existingId).toBeNull();
    expect(result.current.isReadOnly).toBe(false);
    expect(result.current.showSummary).toBe(false);
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.showConflictModal).toBe(false);
  });

  describe("Computed Values", () => {
    it("should compute isReadOnly as true when viewingTeamData is present", () => {
      useDeckStore.setState({ viewingTeamData: [] as any });
      const { result } = renderHook(() => useTeamBuilder());
      expect(result.current.isReadOnly).toBe(true);
    });

    it("should compute isReadOnly as true when state.isReadOnly is true", () => {
      useDeckStore.setState({ isReadOnly: true });
      const { result } = renderHook(() => useTeamBuilder());
      expect(result.current.isReadOnly).toBe(true);
    });

    it("should compute showSummary as truthy when viewSummary is true and teamDecks exist", () => {
      useDeckStore.setState({ viewSummary: true, teamDecks: [{}] as any });
      const { result } = renderHook(() => useTeamBuilder());
      expect(result.current.showSummary).toBeTruthy();
    });

    it("should compute showSummary as falsy if teamDecks is null", () => {
      useDeckStore.setState({ viewSummary: true, teamDecks: null as any });
      const { result } = renderHook(() => useTeamBuilder());
      expect(result.current.showSummary).toBeFalsy();
    });
  });

  describe("UI Handlers", () => {
    it("should handleBack by hiding summary and clearing viewingTeam", () => {
      const { result } = renderHook(() => useTeamBuilder());

      act(() => {
        result.current.handleBack();
      });

      expect(setViewSummarySpy).toHaveBeenCalledWith(false);
      expect(setViewingTeamSpy).toHaveBeenCalledWith(null);
    });

    describe("handleEditDeck", () => {
      it("should just set slot and hide summary if no viewingTeamData", () => {
        const { result } = renderHook(() => useTeamBuilder());

        let res: boolean;
        act(() => {
          res = result.current.handleEditDeck(2);
        });

        expect(setActiveSlotSpy).toHaveBeenCalledWith(2);
        expect(setViewSummarySpy).toHaveBeenCalledWith(false);
        expect(res!).toBe(true);
        expect(loadTeamFromDataSpy).not.toHaveBeenCalled();
      });

      it("should load team and reset viewing if viewingTeamData is present and NO changes", () => {
        const mockDeckData = [{ id: "deck1" }];
        useDeckStore.setState({ viewingTeamData: mockDeckData as any });
        (selectHasChanges as Mock).mockReturnValue(false);

        const { result } = renderHook(() => useTeamBuilder());

        let res: boolean;
        act(() => {
          res = result.current.handleEditDeck(1);
        });

        // Generates new IDs for team decks using mapped uuid v4
        expect(loadTeamFromDataSpy).toHaveBeenCalledWith(mockDeckData, [
          "mocked-uuid",
        ]);
        expect(setViewingTeamSpy).toHaveBeenCalledWith(null);
        expect(setActiveSlotSpy).toHaveBeenCalledWith(1);
        expect(setViewSummarySpy).toHaveBeenCalledWith(false);
        expect(res!).toBe(true);
      });

      it("should halt (return false) if viewingTeamData is present and HAS changes without forceDiscard", () => {
        const mockDeckData = [{ id: "deck1" }];
        useDeckStore.setState({ viewingTeamData: mockDeckData as any });
        (selectHasChanges as Mock).mockReturnValue(true); // Changes exist!

        const { result } = renderHook(() => useTeamBuilder());

        let res: boolean;
        act(() => {
          res = result.current.handleEditDeck(1); // default forceDiscard false
        });

        expect(loadTeamFromDataSpy).not.toHaveBeenCalled();
        expect(res!).toBe(false);
      });

      it("should proceed if viewingTeamData is present and HAS changes BUT forceDiscard is true", () => {
        const mockDeckData = [{ id: "deck1" }];
        useDeckStore.setState({ viewingTeamData: mockDeckData as any });
        (selectHasChanges as Mock).mockReturnValue(true); // Changes exist!

        const { result } = renderHook(() => useTeamBuilder());

        let res: boolean;
        act(() => {
          res = result.current.handleEditDeck(1, true); // forceDiscard = true
        });

        expect(loadTeamFromDataSpy).toHaveBeenCalledWith(mockDeckData, [
          "mocked-uuid",
        ]);
        expect(setViewingTeamSpy).toHaveBeenCalledWith(null);
        expect(setActiveSlotSpy).toHaveBeenCalledWith(1);
        expect(setViewSummarySpy).toHaveBeenCalledWith(false);
        expect(res!).toBe(true);
      });
    });
  });

  describe("Delegation to useTeamImport", () => {
    it("should call useTeamImport with correct initial state", () => {
      renderHook(() => useTeamBuilder());

      expect(useTeamImport).toHaveBeenCalledWith(
        expect.objectContaining({
          viewingTeamData: null,
          isEmpty: true,
          hasChanges: false,
          savedTeams: expect.any(Array),
        })
      );
    });
  });
});
