import { beforeEach, describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { UnifiedEntity } from "@/types/api";

import { useDeckStore } from "../index";

describe("createUISlice", () => {
  beforeEach(() => {
    useDeckStore.setState({
      mode: "SOLO",
      viewSummary: false,
      isReadOnly: false,

      viewingTeamData: null,
      viewingTeamId: null,
      viewingTeamName: null,
      viewingDeckData: null,
      viewingDeckId: null,

      pendingImport: null,
      isImporting: false,
      pendingSwapCard: null,

      activeDragItem: null,
      inspectorOpen: false,
      inspectedCard: null,
      inspectorPosition: null, // Fixed typo from 'null' to null
      inspectorOptions: {},
      hoveredItem: null,
      isInspectorHovered: false,
      commandCenterOpen: false,

      browserFilters: {
        schools: [],
        ranks: [],
        categories: [],
        classes: [],
      },
      hasSeenDeckBuilderWelcome: false,
    });
  });

  describe("setMode", () => {
    it("should set mode to TEAM", () => {
      const store = useDeckStore.getState();
      store.setMode("TEAM");

      const state = useDeckStore.getState();
      expect(state.mode).toBe("TEAM");
      // Other values shouldn't be overridden
    });

    it("should reset activeSlot and currentDeck when setting mode to SOLO", () => {
      useDeckStore.setState({ activeSlot: 2 });

      const store = useDeckStore.getState();
      store.setMode("SOLO");

      const state = useDeckStore.getState();
      expect(state.mode).toBe("SOLO");
      expect(state.activeSlot).toBeNull();
      expect(state.currentDeck.name).toBe("New Deck");
      expect(state.currentDeck.id).toBe(INITIAL_DECK.id);
    });
  });

  describe("setViewingTeam", () => {
    it("should set properties when data is provided", () => {
      const store = useDeckStore.getState();

      const mockTeam = [{ ...INITIAL_DECK }, { ...INITIAL_DECK }];
      store.setViewingTeam(mockTeam, "t1", "Test Team");

      const state = useDeckStore.getState();
      expect(state.viewingTeamData).toBe(mockTeam);
      expect(state.viewingTeamId).toBe("t1");
      expect(state.viewingTeamName).toBe("Test Team");
      expect(state.mode).toBe("TEAM");
      expect(state.viewSummary).toBe(true);
      expect(state.isReadOnly).toBe(true);
    });

    it("should clear properties when data is null", () => {
      useDeckStore.setState({
        viewingTeamData: [{ ...INITIAL_DECK }],
        viewingTeamId: "t1",
        viewingTeamName: "Test Team",
        mode: "TEAM",
        viewSummary: true,
        isReadOnly: true,
      });

      const store = useDeckStore.getState();
      store.setViewingTeam(null);

      const state = useDeckStore.getState();
      expect(state.viewingTeamData).toBeNull();
      expect(state.viewingTeamId).toBeNull();
      expect(state.viewingTeamName).toBe("");
      // It doesn't revert mode automatically by design, only sets viewing stuff
    });
  });

  describe("setViewingDeck", () => {
    it("should set properties when data is provided", () => {
      const store = useDeckStore.getState();

      const mockDeck = { ...INITIAL_DECK };
      store.setViewingDeck(mockDeck, "d1");

      const state = useDeckStore.getState();
      expect(state.viewingDeckData).toBe(mockDeck);
      expect(state.viewingDeckId).toBe("d1");
      expect(state.mode).toBe("SOLO");
      expect(state.isReadOnly).toBe(true);
    });
  });

  describe("pending imports", () => {
    it("should resolve with SAVE_AND_OVERWRITE", () => {
      let savedDeckName = "";
      useDeckStore.setState({
        pendingImport: { ...INITIAL_DECK, name: "Imported" },
        currentDeck: { ...INITIAL_DECK, name: "Current" },
        saveDeck: (nameInput?: string) => {
          savedDeckName = nameInput ?? "";
        },
        setDeck: (deck) => {
          useDeckStore.setState({ currentDeck: deck });
        },
      });

      const store = useDeckStore.getState();
      store.resolvePendingImport("SAVE_AND_OVERWRITE");

      const state = useDeckStore.getState();
      expect(savedDeckName).toBe("Current");
      expect(state.currentDeck.name).toBe("Imported");
      expect(state.pendingImport).toBeNull();
    });

    it("should resolve with OVERWRITE", () => {
      let savedStr = "";
      useDeckStore.setState({
        pendingImport: { ...INITIAL_DECK, name: "Imported O" },
        saveDeck: () => {
          savedStr = "saved";
        },
        setDeck: (deck) => {
          useDeckStore.setState({ currentDeck: deck });
        },
      });

      const store = useDeckStore.getState();
      store.resolvePendingImport("OVERWRITE");

      const state = useDeckStore.getState();
      expect(savedStr).toBe(""); // Not saved
      expect(state.currentDeck.name).toBe("Imported O");
      expect(state.pendingImport).toBeNull();
    });

    it("should resolve with CANCEL (no update to current deck)", () => {
      // While CANCEL wasn't explicitly checking string in method, the else branch handles it by doing nothing state-wise but setting pending import null
      useDeckStore.setState({
        pendingImport: { ...INITIAL_DECK, name: "Imported O" },
        currentDeck: { ...INITIAL_DECK, name: "Current" },
        setDeck: (deck) => {
          useDeckStore.setState({ currentDeck: deck });
        },
      });

      const store = useDeckStore.getState();
      store.resolvePendingImport("CANCEL");

      const state = useDeckStore.getState();
      expect(state.currentDeck.name).toBe("Current");
      expect(state.pendingImport).toBeNull();
    });
  });

  describe("Inspector State", () => {
    it("should open and close inspector", () => {
      const store = useDeckStore.getState();
      const mockItem = { entity_id: "1" } as unknown as UnifiedEntity;

      store.openInspector(mockItem, { x: 10, y: 20 }, { isReadOnly: true });

      expect(useDeckStore.getState().inspectorOpen).toBe(true);
      expect(useDeckStore.getState().inspectedCard).toBe(mockItem);
      expect(useDeckStore.getState().inspectorPosition).toEqual({
        x: 10,
        y: 20,
      });
      expect(useDeckStore.getState().inspectorOptions).toEqual({
        isReadOnly: true,
      });

      store.closeInspector();

      expect(useDeckStore.getState().inspectorOpen).toBe(false);
      expect(useDeckStore.getState().inspectedCard).toBeNull();
      expect(useDeckStore.getState().inspectorPosition).toBeNull();
    });
  });

  describe("Browser Filters", () => {
    it("should toggle browser filters", () => {
      const store = useDeckStore.getState();

      store.toggleBrowserFilter("schools", "Wild");
      expect(useDeckStore.getState().browserFilters.schools).toEqual(["Wild"]);

      store.toggleBrowserFilter("schools", "Life");
      expect(useDeckStore.getState().browserFilters.schools).toEqual([
        "Wild",
        "Life",
      ]);

      store.toggleBrowserFilter("schools", "Wild");
      expect(useDeckStore.getState().browserFilters.schools).toEqual(["Life"]);
    });

    it("should clear browser filters", () => {
      useDeckStore.setState({
        browserFilters: {
          schools: ["Wild"],
          ranks: ["I"],
          categories: ["Unit"],
          classes: ["Mage"],
        },
      });

      const store = useDeckStore.getState();
      store.clearBrowserFilters();

      const state = useDeckStore.getState();
      expect(state.browserFilters).toEqual({
        schools: [],
        ranks: [],
        categories: [],
        classes: [],
      });
    });
  });

  describe("Command Center", () => {
    it("should open command center", () => {
      const store = useDeckStore.getState();
      store.openCommandCenter();
      expect(useDeckStore.getState().commandCenterOpen).toBe(true);
    });

    it("should close command center and reset isImporting", () => {
      useDeckStore.setState({ commandCenterOpen: true, isImporting: true });
      const store = useDeckStore.getState();

      store.closeCommandCenter();

      const state = useDeckStore.getState();
      expect(state.commandCenterOpen).toBe(false);
      expect(state.isImporting).toBe(false);
    });
  });
});
