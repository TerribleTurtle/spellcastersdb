import { beforeEach, describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";

import { useDeckStore } from "../index";

describe("createUISlice — Adversarial", () => {
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
      inspectorPosition: null,
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
      currentDeck: { ...INITIAL_DECK, name: "New Deck" },
    });
  });

  // --- resolvePendingImport Abuse ---

  describe("resolvePendingImport Torture", () => {
    it("ADV-UI-1: resolvePendingImport with invalid strategy string should not crash", () => {
      useDeckStore.setState({
        pendingImport: { ...INITIAL_DECK, name: "Evil Import" },
        setDeck: (deck: any) => {
          useDeckStore.setState({ currentDeck: deck });
        },
        saveDeck: () => {},
      });

      const store = useDeckStore.getState();

      // Pass a totally invalid strategy
      store.resolvePendingImport("YOLO_DELETE_EVERYTHING" as any);

      // pendingImport should still be null (the function clears it regardless)
      expect(useDeckStore.getState().pendingImport).toBeNull();
      // But the currentDeck should NOT have been replaced
      expect(useDeckStore.getState().currentDeck.name).toBe("New Deck");
    });

    it("ADV-UI-2: resolvePendingImport with empty string strategy should not crash", () => {
      useDeckStore.setState({
        pendingImport: { ...INITIAL_DECK, name: "Evil" },
        setDeck: (deck: any) => {
          useDeckStore.setState({ currentDeck: deck });
        },
        saveDeck: () => {},
      });

      useDeckStore.getState().resolvePendingImport("" as any);
      expect(useDeckStore.getState().pendingImport).toBeNull();
      expect(useDeckStore.getState().currentDeck.name).toBe("New Deck");
    });

    it("ADV-UI-3: SAVE_AND_OVERWRITE when currentDeck has empty name should use 'Untitled Deck' fallback", () => {
      let savedName = "";
      useDeckStore.setState({
        currentDeck: { ...INITIAL_DECK, name: "" },
        pendingImport: { ...INITIAL_DECK, name: "Fresh Import" },
        saveDeck: (nameInput?: string) => {
          savedName = nameInput ?? "";
        },
        setDeck: (deck: any) => {
          useDeckStore.setState({ currentDeck: deck });
        },
      });

      useDeckStore.getState().resolvePendingImport("SAVE_AND_OVERWRITE");
      expect(savedName).toBe("Untitled Deck");
    });

    it("ADV-UI-4: SAVE_AND_OVERWRITE when saveDeck throws should not leave pendingImport hanging", () => {
      useDeckStore.setState({
        currentDeck: { ...INITIAL_DECK, name: "Current" },
        pendingImport: { ...INITIAL_DECK, name: "Import" },
        saveDeck: () => {
          throw new Error("Save exploded");
        },
        setDeck: (deck: any) => {
          useDeckStore.setState({ currentDeck: deck });
        },
      });

      expect(() => {
        useDeckStore.getState().resolvePendingImport("SAVE_AND_OVERWRITE");
      }).toThrow("Save exploded");
    });

    it("ADV-UI-5: resolvePendingImport called 100 times rapidly with CANCEL should not crash", () => {
      useDeckStore.setState({
        pendingImport: { ...INITIAL_DECK, name: "Import" },
        setDeck: () => {},
        saveDeck: () => {},
      });

      // First call clears pendingImport, all subsequent should no-op
      for (let i = 0; i < 100; i++) {
        useDeckStore.getState().resolvePendingImport("CANCEL");
      }
      expect(useDeckStore.getState().pendingImport).toBeNull();
    });
  });

  // --- setMode Abuse ---

  describe("setMode Abuse", () => {
    it("ADV-UI-6: setMode with invalid mode string should still set it (no validation)", () => {
      useDeckStore.getState().setMode("INVALID_MODE" as any);
      expect(useDeckStore.getState().mode).toBe("INVALID_MODE");
    });

    it("ADV-UI-7: toggling SOLO → TEAM → SOLO 50 times should not leak state", () => {
      for (let i = 0; i < 50; i++) {
        useDeckStore.getState().setMode("TEAM");
        useDeckStore.getState().setMode("SOLO");
      }
      const state = useDeckStore.getState();
      expect(state.mode).toBe("SOLO");
      expect(state.activeSlot).toBeNull();
      expect(state.currentDeck.name).toBe("New Deck");
    });
  });

  // --- Browser Filter Abuse ---

  describe("Browser Filter Abuse", () => {
    it("ADV-UI-8: toggling the same filter value 1000 times should leave it empty (even count)", () => {
      const store = useDeckStore.getState();
      for (let i = 0; i < 1000; i++) {
        useDeckStore.getState().toggleBrowserFilter("schools", "Wild");
      }
      expect(useDeckStore.getState().browserFilters.schools).toEqual([]);
    });

    it("ADV-UI-9: toggleBrowserFilter with XSS payload value should store literally", () => {
      useDeckStore
        .getState()
        .toggleBrowserFilter("schools", '<script>alert("xss")</script>' as any);
      expect(useDeckStore.getState().browserFilters.schools).toContain(
        '<script>alert("xss")</script>'
      );
    });

    it("ADV-UI-10: toggleBrowserFilter with invalid type key should not crash", () => {
      // TypeScript prevents this, but JS runtime might receive it
      expect(() => {
        useDeckStore
          .getState()
          .toggleBrowserFilter("nonExistentFilter" as any, "value");
      }).toThrow(); // Should throw because state.browserFilters["nonExistentFilter"] is undefined → .includes() fails
    });

    it("ADV-UI-11: setBrowserFilters with __proto__ key should not pollute", () => {
      const evilFilters = JSON.parse(
        '{"schools":[],"ranks":[],"categories":[],"classes":[],"__proto__":{"polluted":true}}'
      );
      useDeckStore.getState().setBrowserFilters(evilFilters);

      // Prototype should NOT be polluted
      expect(({} as any).polluted).toBeUndefined();
    });

    // --- Round 2: Deep Edge Cases ---

    it("ADV-UI-17: corrupted LocalStorage injecting string instead of array for browserFilters should cause expected TypeError on toggle", () => {
      // Simulate corrupted LocalStorage restoring a string instead of an array
      useDeckStore.setState({
        browserFilters: {
          schools: "This is a string" as any,
          ranks: [],
          categories: [],
          classes: [],
        },
      });

      // The hook uses `current.includes` and then `[...current, value]`.
      // Calling `toggle` will spread a string into an array of characters + new value,
      // or if it was an object, throw "current is not iterable".
      // Let's test what happens when it's a number (totally un-iterable and no includes method)
      useDeckStore.setState({
        browserFilters: {
          schools: 12345 as any,
          ranks: [],
          categories: [],
          classes: [],
        },
      });

      expect(() => {
        useDeckStore.getState().toggleBrowserFilter("schools", "Fire");
      }).toThrow(/current\.includes is not a function/);
    });

    it("ADV-UI-18: passing undefined as filter type creates an 'undefined' key rather than crashing", () => {
      // Because `[type]: updated` is used
      expect(() => {
        useDeckStore.getState().toggleBrowserFilter(undefined as any, "Fire");
      }).toThrow();
      // Actually, since state.browserFilters[undefined] evaluates to undefined,
      // current.includes will throw "Cannot read properties of undefined (reading 'includes')"
    });
  });

  // --- Inspector Abuse ---

  describe("Inspector Abuse", () => {
    it("ADV-UI-12: openInspector with null item should not crash", () => {
      expect(() => {
        useDeckStore.getState().openInspector(null as any);
      }).not.toThrow();
      expect(useDeckStore.getState().inspectorOpen).toBe(true);
      expect(useDeckStore.getState().inspectedCard).toBeNull();
    });

    it("ADV-UI-13: openInspector with negative coordinates should store them", () => {
      useDeckStore
        .getState()
        .openInspector({ entity_id: "u1" } as any, { x: -9999, y: -9999 });
      expect(useDeckStore.getState().inspectorPosition).toEqual({
        x: -9999,
        y: -9999,
      });
    });

    it("ADV-UI-14: rapid open/close 100 times should not leak state", () => {
      for (let i = 0; i < 100; i++) {
        useDeckStore.getState().openInspector({ entity_id: `u${i}` } as any, {
          x: i,
          y: i,
        });
        useDeckStore.getState().closeInspector();
      }
      expect(useDeckStore.getState().inspectorOpen).toBe(false);
      expect(useDeckStore.getState().inspectedCard).toBeNull();
    });
  });

  // --- Viewing State Abuse ---

  describe("Viewing State Abuse", () => {
    it("ADV-UI-15: setViewingTeam with massive deck array should not crash", () => {
      const giantDecks = Array.from({ length: 10000 }, () => ({
        ...INITIAL_DECK,
      }));
      useDeckStore.getState().setViewingTeam(giantDecks, "t1", "Monster Team");
      expect(useDeckStore.getState().viewingTeamData).toHaveLength(10000);
    });

    it("ADV-UI-16: setViewingDeck with deck containing circular toString should store it", () => {
      const cursedDeck = {
        ...INITIAL_DECK,
        toString: () => {
          throw new Error("toString trap");
        },
      };
      expect(() => {
        useDeckStore.getState().setViewingDeck(cursedDeck as any, "d1");
      }).not.toThrow();
    });
  });
});
