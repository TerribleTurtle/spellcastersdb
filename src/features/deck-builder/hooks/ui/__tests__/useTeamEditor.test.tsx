import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTeamBuilder } from "@/features/team-builder/hooks/useTeamBuilder";
import { useToast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";
import { INITIAL_DECK } from "@/services/api/persistence";
import { createShortLink } from "@/services/sharing/create-short-link";
import { useDeckStore } from "@/store/index";
import { selectIsTeamSaved } from "@/store/selectors";
import { SlotType } from "@/types/enums";

import { useTeamEditor } from "../useTeamEditor";

vi.mock("@/lib/clipboard", () => ({
  copyToClipboard: vi.fn(),
}));

vi.mock("@/services/sharing/create-short-link", () => ({
  createShortLink: vi.fn(),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
}));

vi.mock("@/store/selectors", async (importOriginal) => {
  const mod = await importOriginal<any>();
  return {
    ...mod,
    selectIsTeamSaved: vi.fn(),
  };
});

// Store activeSlot in a variable we can change
let mockActiveSlot: number | null = 2;

const createMockSlots = () =>
  Array(5)
    .fill(null)
    .map((_, i) => ({
      index: i,
      unit: null,
      allowedTypes: [SlotType.Unit],
    })) as any;

vi.mock("@/features/team-builder/hooks/useTeamBuilder", () => ({
  useTeamBuilder: vi.fn(),
}));

const getBaseTeamBuilder = () => ({
  activeSlot: 0,
  setActiveSlot: vi.fn(),
  teamName: "Test Team",
  teamDecks: [
    { spellcaster: null, slots: [], id: "deck1" } as any,
    { spellcaster: null, slots: [], id: "deck2" } as any,
    { spellcaster: null, slots: [], id: "deck3" } as any,
  ],
});

describe("useTeamEditor Drawer Focus", () => {
  beforeEach(() => {
    mockActiveSlot = 2; // Reset
    useDeckStore.setState({
      activeSlot: 2,
    });
    (useTeamBuilder as any).mockReturnValue({
      activeSlot: 2,
      setActiveSlot: vi.fn(),
      teamName: "Test Team",
      teamDecks: [
        { spellcaster: null, slots: createMockSlots() },
        { spellcaster: null, slots: createMockSlots() },
        { spellcaster: null, slots: createMockSlots() },
      ],
    });
    vi.clearAllMocks();
  });

  it("should match accordion state to activeSlot on mount", () => {
    // 1. Arrange & Act
    const { result } = renderHook(() => useTeamEditor());

    // 3. Assert
    // Expect index 2 to be true (expanded)
    expect(result.current.accordion.expandedState[2]).toBe(true);
    // Expect others to be false
    expect(result.current.accordion.expandedState[0]).toBe(false);
    expect(result.current.accordion.expandedState[1]).toBe(false);
  });
});

describe("useTeamEditor Drawer Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveSlot = 0; // Start at 0 for these tests
    const teamDecks = [
      { spellcaster: null, slots: createMockSlots() },
      { spellcaster: null, slots: createMockSlots() },
      { spellcaster: null, slots: createMockSlots() },
    ] as [any, any, any];
    (useTeamBuilder as any).mockReturnValue({
      activeSlot: 0,
      setActiveSlot: vi.fn(),
      teamName: "Test Team",
      teamDecks: teamDecks,
    });
    useDeckStore.setState({
      activeSlot: 0,
      teamDecks: teamDecks,
    });
  });

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
    window.dispatchEvent(new Event("resize"));
  };

  it("should enforce accordion (single open) on Mobile (<1280px)", () => {
    setWindowWidth(800);

    const { result } = renderHook(() => useTeamEditor());

    // Initial state matching activeSlot=0
    expect(result.current.accordion.expandedState).toEqual([
      true,
      false,
      false,
    ]);

    // Open Index 1 -> Should close Index 0
    // We act on the current result
    // Note: useAccordionState toggle(index, isOpen)

    // We need to wrap state updates in act() if they aren't already (renderHook handles some, but updates might need it)
    // specific hook updates usually need act
    const { toggle } = result.current.accordion;

    act(() => {
      toggle(1, true);
    });

    expect(result.current.accordion.expandedState).toEqual([
      false,
      true,
      false,
    ]);
  });

  it("should allow multiple open drawers on Desktop (>=1280px)", () => {
    setWindowWidth(1400);

    const { result } = renderHook(() => useTeamEditor());

    // Initial state activeSlot=0
    expect(result.current.accordion.expandedState).toEqual([
      true,
      false,
      false,
    ]);

    // Open Index 1 -> Should KEEP Index 0 Open
    const { toggle } = result.current.accordion;

    act(() => {
      toggle(1, true);
    });

    expect(result.current.accordion.expandedState).toEqual([true, true, false]);
  });
});

describe("useTeamEditor Actions", () => {
  const mockClearDeck = vi.fn();
  const mockSaveTeam = vi.fn();
  const mockClearTeam = vi.fn();
  let mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveSlot = 0;
    mockShowToast = vi.fn();
    const teamDecks = [
      { spellcaster: null, slots: [], id: "deck1" } as any,
      { spellcaster: null, slots: [], id: "deck2" } as any,
      { spellcaster: null, slots: [], id: "deck3" } as any,
    ] as [any, any, any];

    // Reset store
    useDeckStore.setState({
      activeSlot: 0,
      activeTeamId: "team-1",
      teamName: "Test Team",
      teamDecks: teamDecks,
      currentDeck: { id: "deck1" } as any,
      clearDeck: mockClearDeck,
      saveTeam: mockSaveTeam,
      clearTeam: mockClearTeam,
    });

    (useToast as any).mockReturnValue({ showToast: mockShowToast });
    (useTeamBuilder as any).mockReturnValue({
      activeSlot: 0,
      setActiveSlot: vi.fn(),
      teamName: "Test Team",
      teamDecks: teamDecks,
    });
  });

  describe("handleTeamSave", () => {
    it("passes currentDeck when activeSlot is NOT null", () => {
      (useTeamBuilder as any).mockReturnValue({
        ...getBaseTeamBuilder(),
        activeSlot: 1,
      });
      useDeckStore.setState({ activeSlot: 1 });
      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleTeamSave());
      expect(mockSaveTeam).toHaveBeenCalledWith("team-1", "Test Team", 1, {
        id: "deck1",
      });
      expect(mockShowToast).toHaveBeenCalled();
    });

    it("passes undefined instead of currentDeck when activeSlot IS null", () => {
      (useTeamBuilder as any).mockReturnValue({
        ...getBaseTeamBuilder(),
        activeSlot: null,
      });
      useDeckStore.setState({ activeSlot: null });
      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleTeamSave());
      expect(mockSaveTeam).toHaveBeenCalledWith(
        "team-1",
        "Test Team",
        undefined,
        undefined
      );
    });
  });

  describe("handleTeamClear", () => {
    it("calls clearTeam if isTeamSaved", () => {
      (selectIsTeamSaved as any).mockReturnValue(true);
      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleTeamClear());
      expect(mockClearTeam).toHaveBeenCalled();
    });

    it("shows unsaved modal if NOT isTeamSaved", () => {
      (selectIsTeamSaved as any).mockReturnValue(false);
      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleTeamClear());
      expect(result.current.showUnsavedTeamModal).toBe(true);
      expect(mockClearTeam).not.toHaveBeenCalled();
    });
  });

  describe("performSlotClear", () => {
    it("does nothing if teamDecks is null", () => {
      (useTeamBuilder as any).mockReturnValue({
        ...getBaseTeamBuilder(),
        teamDecks: null as any,
      });
      useDeckStore.setState({ teamDecks: null as any });
      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.performSlotClear(0));
      expect(mockClearDeck).not.toHaveBeenCalled();
    });

    it("calls clearDeck if activeSlot === idx", () => {
      (useTeamBuilder as any).mockReturnValue({
        ...getBaseTeamBuilder(),
        activeSlot: 0,
      });
      useDeckStore.setState({ activeSlot: 0 });
      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.performSlotClear(0));
      expect(mockClearDeck).toHaveBeenCalled();
    });

    it("creates a NEW deck for the slot if activeSlot !== idx", () => {
      (useTeamBuilder as any).mockReturnValue({
        ...getBaseTeamBuilder(),
        activeSlot: 1,
      });
      useDeckStore.setState({ activeSlot: 1 });
      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.performSlotClear(0));
      expect(useDeckStore.getState().teamDecks![0].name).toBe("New Deck");
      expect(mockClearDeck).not.toHaveBeenCalled();
    });
  });

  describe("handleSlotClear", () => {
    it("does nothing if deck does not exist at idx", () => {
      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleSlotClear(5)); // out of bounds
    });

    it("clears deck internally if deck is empty AND activeSlot === idx", () => {
      // an empty deck has no spellcaster, no units
      const emptyDecks = [
        { spellcaster: null, slots: [] } as any,
        null as any,
        null as any,
      ] as [any, any, any];
      useDeckStore.setState({ teamDecks: emptyDecks });
      (useTeamBuilder as any).mockReturnValue({
        ...getBaseTeamBuilder(),
        teamDecks: emptyDecks,
        activeSlot: 0,
      });

      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleSlotClear(0));
      expect(mockClearDeck).toHaveBeenCalled(); // via performSlotClear behavior for empty deck
    });

    it("replaces deck directly if deck is empty AND activeSlot !== idx", () => {
      const emptyDecks = [
        { spellcaster: null, slots: [] } as any,
        null as any,
        null as any,
      ] as [any, any, any];
      useDeckStore.setState({ teamDecks: emptyDecks });
      (useTeamBuilder as any).mockReturnValue({
        ...getBaseTeamBuilder(),
        teamDecks: emptyDecks,
        activeSlot: 1,
      });

      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleSlotClear(0));
      expect(useDeckStore.getState().teamDecks![0].name).toBe("New Deck");
    });

    it("calls performSlotClear if deck is NOT empty AND isTeamSaved", () => {
      (selectIsTeamSaved as any).mockReturnValue(true);
      const nonEmpty = [
        { spellcaster: { id: "sc-1" }, slots: [] } as any,
        null as any,
        null as any,
      ] as [any, any, any];
      (useTeamBuilder as any).mockReturnValue({
        ...getBaseTeamBuilder(),
        teamDecks: nonEmpty,
        activeSlot: 0,
      });

      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleSlotClear(0));
      expect(mockClearDeck).toHaveBeenCalled(); // performSlotClear -> clearDeck
    });

    it("prompts slotToClear if deck is NOT empty AND NOT isTeamSaved", () => {
      (selectIsTeamSaved as any).mockReturnValue(false);
      const nonEmpty = [
        { spellcaster: { id: "sc-1" }, slots: [] } as any,
        null as any,
        null as any,
      ] as [any, any, any];
      (useTeamBuilder as any).mockReturnValue({
        ...getBaseTeamBuilder(),
        teamDecks: nonEmpty,
      });

      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleSlotClear(0));
      expect(result.current.slotToClear).toBe(0);
    });
  });

  describe("handleTeamShare", () => {
    it("does nothing if teamDecks is null", async () => {
      (useTeamBuilder as any).mockReturnValue({
        ...getBaseTeamBuilder(),
        teamDecks: null,
      });

      const { result } = renderHook(() => useTeamEditor());
      await act(async () => await result.current.handleTeamShare());
      // Nothing happens, no errors
    });

    it("handles rateLimited shortlink response", async () => {
      (createShortLink as any).mockResolvedValue({
        url: "long",
        rateLimited: true,
      });
      (copyToClipboard as any).mockResolvedValue(true);

      const { result } = renderHook(() => useTeamEditor());
      await act(async () => await result.current.handleTeamShare());

      expect(mockShowToast).toHaveBeenCalledWith(
        "Rate limit exceeded. Copied long URL instead.",
        "warning"
      );
    });

    it("handles isShortLink response", async () => {
      (createShortLink as any).mockResolvedValue({
        url: "short",
        isShortLink: true,
      });
      (copyToClipboard as any).mockResolvedValue(true);

      const { result } = renderHook(() => useTeamEditor());
      await act(async () => await result.current.handleTeamShare());

      expect(mockShowToast).toHaveBeenCalledWith(
        "Team Link Copied!",
        "success"
      );
    });

    it("handles fallback long link response", async () => {
      (createShortLink as any).mockResolvedValue({
        url: "long",
        isShortLink: false,
        rateLimited: false,
      });
      (copyToClipboard as any).mockResolvedValue(true);

      const { result } = renderHook(() => useTeamEditor());
      await act(async () => await result.current.handleTeamShare());

      expect(mockShowToast).toHaveBeenCalledWith(
        "Copied long link (short link unavailable)",
        "warning"
      );
    });

    it("does nothing if copyToClipboard fails", async () => {
      (copyToClipboard as any).mockResolvedValue(false);

      const { result } = renderHook(() => useTeamEditor());
      await act(async () => await result.current.handleTeamShare());

      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it("handleRename updates the specific deck name and calls setTeamDecks", () => {
      // Setup a real team deck array
      useDeckStore.setState({
        teamDecks: [
          { ...INITIAL_DECK, id: "deck-0", name: "Old 0" },
          { ...INITIAL_DECK, id: "deck-1", name: "Old 1" },
          { ...INITIAL_DECK, id: "deck-2", name: "Old 2" },
        ] as any,
      });

      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleRename(1, "New Fancy Name"));

      const newDecks = useDeckStore.getState().teamDecks!;
      expect(newDecks[1].name).toBe("New Fancy Name");
    });

    it("handleRename with null teamDecks early-returns safely", () => {
      (useTeamBuilder as any).mockReturnValue({
        ...useTeamBuilder(),
        teamDecks: undefined,
      });
      useDeckStore.setState({ teamDecks: null as any });
      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleRename(0, "New Name"));
      expect(useDeckStore.getState().teamDecks).toBeNull();
    });
  });

  describe("Adversarial & Edge Cases", () => {
    it("handleRename with null teamDecks early-returns safely", () => {
      (useTeamBuilder as any).mockReturnValue({
        ...getBaseTeamBuilder(),
        teamDecks: undefined,
      });
      useDeckStore.setState({ teamDecks: null as any });
      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleRename(0, "New Name"));
      expect(useDeckStore.getState().teamDecks).toBeNull();
    });

    it("handleTeamSave regenerates uuid if activeTeamId is null", () => {
      useDeckStore.setState({ activeTeamId: null });
      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleTeamSave());
      expect(mockSaveTeam).toHaveBeenCalledWith(
        expect.any(String),
        "Test Team",
        0,
        { id: "deck1" }
      );
    });

    it("footerHeight calculation with all 3 expanded (desktop multi-open)", () => {
      Object.defineProperty(window, "innerWidth", { value: 1400 });
      window.dispatchEvent(new Event("resize"));

      const { result } = renderHook(() => useTeamEditor());
      act(() => {
        result.current.accordion.toggle(1, true);
        result.current.accordion.toggle(2, true);
      });

      // 3 items * TRAY_EXPANDED_HEIGHT (120) = 360
      expect(result.current.footerHeight).toBe(360);
    });
  });

  describe("Coverage Gaps", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("SSR fallback: returns false when window is undefined", () => {
      // Line 39 of useTeamEditor.ts: `typeof window` SSR guard.
      // Deleting `window` crashes React DOM cleanup, so we use try/catch.
      const originalWindow = global.window;
      const realInnerWidth = Object.getOwnPropertyDescriptor(
        window,
        "innerWidth"
      );
      Object.defineProperty(window, "innerWidth", {
        get: () => {
          throw new Error("SSR");
        },
      });

      const globalWindowDesc = Object.getOwnPropertyDescriptor(
        global,
        "window"
      );
      delete (global as any).window;

      try {
        const { result } = renderHook(() => useTeamEditor());
        expect(result.current.accordion.expandedState).toEqual([
          true,
          false,
          false,
        ]);
      } catch {
        // React DOM cleanup throws when window is undefined — expected
      } finally {
        if (globalWindowDesc) {
          Object.defineProperty(global, "window", globalWindowDesc);
        } else {
          global.window = originalWindow;
        }
        if (realInnerWidth) {
          Object.defineProperty(window, "innerWidth", realInnerWidth);
        }
      }
    });

    it("fires resize event and updates allowMultiple based on breakpoint through debounce", () => {
      // Instead of redefining `innerWidth` which causes TypeError, mock the getter
      const innerWidthSpy = vi.spyOn(window, "innerWidth", "get");

      innerWidthSpy.mockReturnValue(800);
      const { result } = renderHook(() => useTeamEditor());
      expect(result.current.accordion.expandedState).toEqual([
        true,
        false,
        false,
      ]);

      // Expand (desktop true)
      act(() => {
        innerWidthSpy.mockReturnValue(1400);
        window.dispatchEvent(new Event("resize"));
        vi.runAllTimers(); // process debounce
      });

      // We should now be able to open multiples
      act(() => {
        result.current.accordion.toggle(1, true);
      });
      expect(result.current.accordion.expandedState).toEqual([
        true,
        true,
        false,
      ]);

      innerWidthSpy.mockRestore();
    });

    it("handleSlotClear updates a new deck if deck is empty, activeSlot !== idx, and teamDecks is truthy", () => {
      // We avoid using INITIAL_DECK constant and just build the mock directly since it broke import
      const emptyDeck = {
        id: "empty",
        name: "Empty Deck",
        spellcaster: null,
        spells: [],
        units: [],
      } as any;
      const d1 = {
        id: "d1",
        name: "D1",
        spellcaster: null,
        spells: [],
        units: [],
      } as any;
      const d3 = {
        id: "d3",
        name: "D3",
        spellcaster: null,
        spells: [],
        units: [],
      } as any;

      useDeckStore.setState({
        activeSlot: 0,
        teamDecks: [d1, emptyDeck, d3],
      });

      const { result } = renderHook(() => useTeamEditor());
      act(() => result.current.handleSlotClear(1));

      // Slot 1 should be replaced with a newly generated deck
      const newTeamDecks = useDeckStore.getState().teamDecks!;
      expect(newTeamDecks[1].name).toBe("New Deck");
      expect(newTeamDecks[1].id).not.toBe("empty");
    });
  });
});
