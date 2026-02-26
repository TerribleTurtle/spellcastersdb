import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEphemeralState } from "@/hooks/useEphemeralState";

import { useDeckBuilder } from "../../domain/useDeckBuilder";
import { useDeckPersistence } from "../useDeckPersistence";

vi.mock("../../domain/useDeckBuilder", () => ({
  useDeckBuilder: vi.fn(),
}));

vi.mock("@/hooks/useEphemeralState", () => ({
  useEphemeralState: vi.fn(),
}));

describe("useDeckPersistence", () => {
  let mockDeckBuilder: any;
  let mockEphemeralState: any;
  const mockOnClear = vi.fn();
  const mockOnImportSolo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockDeckBuilder = {
      currentDeck: { id: "deck-1", name: "My Deck", slots: [] } as any,
      savedDecks: [{ id: "deck-1", name: "My Deck", slots: [] }],
      saveDeck: vi.fn(),
      saveAsCopy: vi.fn(),
      loadDeck: vi.fn(),
      hasChanges: false,
      loadTeam: vi.fn(),
      saveTeam: vi.fn(),
      activeTeamId: null,
      clearTeam: vi.fn(),
      mode: "SOLO",
    };

    (useDeckBuilder as any).mockReturnValue(mockDeckBuilder);

    mockEphemeralState = {
      isActive: false,
      trigger: vi.fn(),
    };
    (useEphemeralState as any).mockReturnValue(mockEphemeralState);
  });

  const renderPersistenceHook = () =>
    renderHook(() =>
      useDeckPersistence({
        onClear: mockOnClear,
        onImportSolo: mockOnImportSolo,
      })
    );

  describe("saveLabel", () => {
    it("returns 'Saved' when justSaved is true", () => {
      mockEphemeralState.isActive = true;
      const { result } = renderPersistenceHook();
      expect(result.current.saveLabel).toBe("Saved");
    });

    describe("SOLO Mode", () => {
      beforeEach(() => {
        mockDeckBuilder.mode = "SOLO";
      });

      it("returns 'Close Deck' when Deck is Clean and has ID", () => {
        mockDeckBuilder.currentDeck = { id: "1" };
        mockDeckBuilder.hasChanges = false;
        const { result } = renderPersistenceHook();
        expect(result.current.saveLabel).toBe("Close Deck");
      });

      it("returns 'Save Deck' when New Deck is Clean (no ID)", () => {
        mockDeckBuilder.currentDeck = {}; // no ID
        mockDeckBuilder.hasChanges = false;
        const { result } = renderPersistenceHook();
        expect(result.current.saveLabel).toBe("Save Deck");
      });

      it("returns 'Update Deck' when Deck has ID and hasChanges is true", () => {
        mockDeckBuilder.currentDeck = { id: "1" };
        mockDeckBuilder.hasChanges = true;
        const { result } = renderPersistenceHook();
        expect(result.current.saveLabel).toBe("Update Deck");
      });

      it("returns 'Save Deck' when Deck has no ID and hasChanges is true", () => {
        mockDeckBuilder.currentDeck = {};
        mockDeckBuilder.hasChanges = true;
        const { result } = renderPersistenceHook();
        expect(result.current.saveLabel).toBe("Save Deck");
      });
    });

    describe("TEAM Mode", () => {
      beforeEach(() => {
        mockDeckBuilder.mode = "TEAM";
      });

      it("returns 'Close Team' when Team is Clean (activeTeamId and no teamHasChanges)", () => {
        mockDeckBuilder.activeTeamId = "team1";
        mockDeckBuilder.teamHasChanges = false; // Override default true
        const { result } = renderPersistenceHook();
        expect(result.current.saveLabel).toBe("Close Team");
      });

      it("returns 'Close Team' when Team is Clean (activeTeamId and no teamHasChanges)", () => {
        mockDeckBuilder.activeTeamId = "team1";
        mockDeckBuilder.teamHasChanges = false; // Override default true
        const { result } = renderPersistenceHook();
        expect(result.current.saveLabel).toBe("Close Team");
      });

      it("returns 'Update Team' when Team has activeTeamId but also has changes", () => {
        mockDeckBuilder.activeTeamId = "team1";
        mockDeckBuilder.teamHasChanges = true;
        const { result } = renderPersistenceHook();
        expect(result.current.saveLabel).toBe("Update Team");
      });

      it("returns 'Save Team' when Team has no activeTeamId", () => {
        mockDeckBuilder.activeTeamId = null;
        const { result } = renderPersistenceHook();
        expect(result.current.saveLabel).toBe("Save Team");
      });
    });
  });

  describe("performSave & performSaveAsCopy", () => {
    it("performSave calls saveDeck, triggers justSaved, and runs onSuccess", () => {
      const { result } = renderPersistenceHook();
      const onSuccess = vi.fn();
      act(() => result.current.performSave("NewName", onSuccess));

      expect(mockDeckBuilder.saveDeck).toHaveBeenCalledWith("NewName");
      expect(mockEphemeralState.trigger).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      expect(mockOnClear).not.toHaveBeenCalled();
    });

    it("performSave calls onClear if no onSuccess provided", () => {
      const { result } = renderPersistenceHook();
      act(() => result.current.performSave("NewName"));
      expect(mockOnClear).toHaveBeenCalled();
    });

    it("performSaveAsCopy calls saveAsCopy, triggers justSaved, and runs onSuccess", () => {
      const { result } = renderPersistenceHook();
      const onSuccess = vi.fn();
      act(() => result.current.performSaveAsCopy("CopyName", onSuccess));

      expect(mockDeckBuilder.saveAsCopy).toHaveBeenCalledWith("CopyName");
      expect(mockEphemeralState.trigger).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it("performSaveAsCopy falls back to onClear if no onSuccess provided", () => {
      const { result } = renderPersistenceHook();
      act(() => result.current.performSaveAsCopy("CopyName"));
      expect(mockOnClear).toHaveBeenCalled();
    });

    it("performSaveAsCopy does nothing if saveAsCopy is not provided by store", () => {
      mockDeckBuilder.saveAsCopy = undefined;
      const { result } = renderPersistenceHook();
      act(() => result.current.performSaveAsCopy("CopyName"));
      expect(mockEphemeralState.trigger).not.toHaveBeenCalled();
    });
  });

  describe("handleSave", () => {
    it("handles isTeamClean by clearing team or falling back to onClear", () => {
      mockDeckBuilder.mode = "TEAM";
      mockDeckBuilder.activeTeamId = "team1";
      mockDeckBuilder.teamHasChanges = false;

      const { result } = renderPersistenceHook();
      const onSuccess = vi.fn();
      act(() => result.current.handleSave(onSuccess));
      expect(mockDeckBuilder.clearTeam).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it("handles isTeamClean by falling back to onClear if no clearTeam in store", () => {
      mockDeckBuilder.mode = "TEAM";
      mockDeckBuilder.activeTeamId = "team1";
      mockDeckBuilder.teamHasChanges = false;
      mockDeckBuilder.clearTeam = undefined; // Force fallback

      const { result } = renderPersistenceHook();
      act(() => result.current.handleSave());
      expect(mockOnClear).toHaveBeenCalled();
    });

    it("handles isNewClean by calling onClear", () => {
      mockDeckBuilder.mode = "SOLO";
      mockDeckBuilder.currentDeck = {};
      mockDeckBuilder.hasChanges = false; // isNewClean = true

      const { result } = renderPersistenceHook();
      act(() => result.current.handleSave());
      expect(mockOnClear).toHaveBeenCalled();
    });

    it("handles TEAM Mode save", () => {
      mockDeckBuilder.mode = "TEAM";
      // teamHasChanges = true means it's not clean.
      const { result } = renderPersistenceHook();
      const onSuccess = vi.fn();
      act(() => result.current.handleSave(onSuccess));

      expect(mockDeckBuilder.saveTeam).toHaveBeenCalled();
      expect(result.current.savedListTab).toBe("TEAMS");
      expect(mockEphemeralState.trigger).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it("handles Deck Save Collision Check - prompts collision", () => {
      mockDeckBuilder.mode = "SOLO";
      mockDeckBuilder.currentDeck = { id: "deck-2", name: "Existing Name" };
      mockDeckBuilder.savedDecks = [{ id: "deck-1", name: "Existing Name" }];
      mockDeckBuilder.hasChanges = true;

      const { result } = renderPersistenceHook();
      act(() => result.current.handleSave());

      expect(result.current.confirmSave).toEqual({
        name: "Existing Name",
        existingId: "deck-1",
        type: "COLLISION",
        onSuccess: undefined,
      });
      expect(mockDeckBuilder.saveDeck).not.toHaveBeenCalled();
    });

    it("handles Deck Save with undefined names — collides with another unnamed deck", () => {
      mockDeckBuilder.mode = "SOLO";
      mockDeckBuilder.currentDeck = { id: "deck-1", name: undefined }; // Hit || "" on nameToSave
      mockDeckBuilder.savedDecks = [
        { id: "deck-2", name: "Different" },
        { id: "deck-3", name: undefined },
      ]; // Hit || "" on collision check
      mockDeckBuilder.hasChanges = true;

      const { result } = renderPersistenceHook();
      act(() => result.current.handleSave());

      // deck-3 has name undefined -> "" which matches nameToSave "", and deck-3 !== deck-1, so collision
      expect(result.current.confirmSave?.type).toBe("COLLISION");
      expect(result.current.confirmSave?.existingId).toBe("deck-3");
      expect(mockDeckBuilder.saveDeck).not.toHaveBeenCalled();
    });

    it("handles regular Deck Save if same-named deck matches current deck ID (not a collision)", () => {
      mockDeckBuilder.mode = "SOLO";
      mockDeckBuilder.currentDeck = { id: "deck-1", name: "Identical" };
      mockDeckBuilder.savedDecks = [{ id: "deck-1", name: "Identical" }]; // Same ID, not a collision!
      mockDeckBuilder.hasChanges = true;

      const { result } = renderPersistenceHook();
      act(() => result.current.handleSave());

      expect(result.current.confirmSave).toBeNull();
      expect(mockDeckBuilder.saveDeck).toHaveBeenCalledWith("Identical");
    });

    it("handles regular Deck Save safely if savedDecks is null", () => {
      mockDeckBuilder.mode = "SOLO";
      mockDeckBuilder.currentDeck = { id: "deck-1", name: "Null Decks" };
      mockDeckBuilder.savedDecks = null; // Force savedDecksList fallback `|| []`
      mockDeckBuilder.hasChanges = true;

      const { result } = renderPersistenceHook();
      act(() => result.current.handleSave());

      expect(mockDeckBuilder.saveDeck).toHaveBeenCalledWith("Null Decks");
    });
  });

  describe("Safe Load Handlers", () => {
    it("handleSafeLoadTeam sets pendingAction if teamHasChanges is true", () => {
      const { result } = renderPersistenceHook();
      act(() => result.current.handleSafeLoadTeam("team-2"));
      expect(result.current.pendingAction?.type).toBe("LOAD_TEAM");
      // executing the action
      act(() => result.current.pendingAction!.action());
      expect(mockDeckBuilder.loadTeam).toHaveBeenCalledWith("team-2");
    });

    it("handleSafeLoadTeam runs immediately if teamHasChanges is false", () => {
      mockDeckBuilder.teamHasChanges = false;
      const { result } = renderPersistenceHook();
      act(() => result.current.handleSafeLoadTeam("team-2"));
      expect(mockDeckBuilder.loadTeam).toHaveBeenCalledWith("team-2");
      expect(result.current.pendingAction).toBeNull();
    });

    it("handleSafeLoadDeck sets pendingAction if hasChanges is true", () => {
      mockDeckBuilder.hasChanges = true;
      const { result } = renderPersistenceHook();
      act(() => result.current.handleSafeLoadDeck("deck-2"));
      expect(result.current.pendingAction?.type).toBe("LOAD_DECK");
      act(() => result.current.pendingAction!.action());
      expect(mockDeckBuilder.loadDeck).toHaveBeenCalledWith("deck-2");
    });

    it("handleSafeLoadDeck runs immediately if hasChanges is false", () => {
      mockDeckBuilder.hasChanges = false;
      const { result } = renderPersistenceHook();
      act(() => result.current.handleSafeLoadDeck("deck-2"));
      expect(mockDeckBuilder.loadDeck).toHaveBeenCalledWith("deck-2");
      expect(result.current.pendingAction).toBeNull();
    });

    it("handleSafeImportSolo sets pending action if team has changes AND active slot not empty", () => {
      mockDeckBuilder.currentDeck.spellcaster = { id: "sc-1" }; // Not empty
      const { result } = renderPersistenceHook();
      const d = { id: "import" } as any;
      act(() => result.current.handleSafeImportSolo(d));
      expect(result.current.pendingAction?.type).toBe("IMPORT");

      act(() => result.current.pendingAction!.action());
      expect(mockOnImportSolo).toHaveBeenCalledWith(d);
    });

    it("handleSafeImportSolo runs immediately if active slot is empty", () => {
      mockDeckBuilder.currentDeck.spellcaster = null;
      mockDeckBuilder.currentDeck.slots = []; // Empty
      const { result } = renderPersistenceHook();
      const d = { id: "import" } as any;
      act(() => result.current.handleSafeImportSolo(d));

      expect(mockOnImportSolo).toHaveBeenCalledWith(d);
      expect(result.current.pendingAction).toBeNull();
    });

    it("handleSafeImportSolo handles gracefully if no onImportSolo passed", () => {
      mockDeckBuilder.currentDeck.spellcaster = null;
      mockDeckBuilder.currentDeck.slots = [];
      const { result } = renderHook(() =>
        useDeckPersistence({ onClear: mockOnClear })
      );
      act(() => result.current.handleSafeImportSolo({} as any));
      // Should not crash
      expect(result.current.pendingAction).toBeNull();
    });
  });

  describe("Setters", () => {
    it("can manually update list tab state", () => {
      const { result } = renderPersistenceHook();
      act(() => result.current.setSavedListTab("SOLO"));
      expect(result.current.savedListTab).toBe("SOLO");
    });

    it("can manually clear confirmSave map", () => {
      const { result } = renderPersistenceHook();
      act(() =>
        result.current.setConfirmSave({
          name: "1",
          existingId: "2",
          type: "COLLISION",
        })
      );
      expect(result.current.confirmSave?.type).toBe("COLLISION");
      act(() => result.current.setConfirmSave(null));
      expect(result.current.confirmSave).toBeNull();
    });
    describe("Adversarial & Edge Cases", () => {
      it("handleSave: collision uses case-insensitive check and trims whitespace", () => {
        mockDeckBuilder.mode = "SOLO";
        mockDeckBuilder.currentDeck = {
          id: "deck-2",
          name: "  My AwesoMe DeCk  ",
        };
        mockDeckBuilder.savedDecks = [
          { id: "deck-1", name: "my awesome deck" },
        ];
        mockDeckBuilder.hasChanges = true;

        const { result } = renderPersistenceHook();
        const onSuccess = vi.fn();
        act(() => result.current.handleSave(onSuccess));

        expect(result.current.confirmSave).toEqual({
          name: "My AwesoMe DeCk", // trimmed
          existingId: "deck-1",
          type: "COLLISION",
          onSuccess,
        });
        expect(mockDeckBuilder.saveDeck).not.toHaveBeenCalled();
      });

      it("handleSafeImportSolo: short-circuits safely if teamHasChanges is false despite slot being populated", () => {
        mockDeckBuilder.teamHasChanges = false;
        mockDeckBuilder.currentDeck = {
          spellcaster: null,
          slots: [{ unit: { id: "u1" } }],
        }; // slot populated
        const { result } = renderPersistenceHook();
        const d = { id: "import" } as any;
        act(() => result.current.handleSafeImportSolo(d));

        expect(result.current.pendingAction).toBeNull();
        expect(mockOnImportSolo).toHaveBeenCalledWith(d);
      });

      it("handleSave: handles purely whitespace deck names gracefully without colliding if no other empty names exist", () => {
        mockDeckBuilder.mode = "SOLO";
        mockDeckBuilder.currentDeck = { id: "deck-1", name: "   " }; // Whitespace only
        mockDeckBuilder.savedDecks = [{ id: "deck-2", name: "Valid Name" }];
        mockDeckBuilder.hasChanges = true;

        const { result } = renderPersistenceHook();
        act(() => result.current.handleSave());

        expect(result.current.confirmSave).toBeNull();
        expect(mockDeckBuilder.saveDeck).toHaveBeenCalledWith(""); // trimmed to empty string
      });
    });
  });
});
