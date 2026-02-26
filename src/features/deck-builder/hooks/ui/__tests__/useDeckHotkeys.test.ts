import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useToast } from "@/hooks/useToast";
import { useDeckStore } from "@/store/index";
import * as selectors from "@/store/selectors";

import { useDeckHotkeys } from "../useDeckHotkeys";

// Mock dependencies
vi.mock("@/hooks/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/store/index", () => ({
  useDeckStore: vi.fn(),
}));

vi.mock("@/store/selectors", () => ({
  selectIsSaved: vi.fn(),
}));

describe("useDeckHotkeys", () => {
  let mockShowToast: ReturnType<typeof vi.fn>;
  let mockStore: any;
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockShowToast = vi.fn();
    (useToast as any).mockReturnValue({ showToast: mockShowToast });

    mockStore = {
      mode: "SOLO",
      saveDeck: vi.fn(),
      clearDeck: vi.fn(),
      saveTeam: vi.fn(),
      teamName: "Test Team",
      activeTeamId: "team-1",
      activeSlot: null,
    };
    (useDeckStore as any).mockImplementation((selector: any) => {
      if (!selector) return mockStore;
      if (selector === selectors.selectIsSaved) return true; // Default to saved
      return null;
    });

    confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  const fireKey = (key: string, ctrlKey = false, shiftKey = false) => {
    const event = new KeyboardEvent("keydown", {
      key,
      ctrlKey,
      shiftKey,
      metaKey: ctrlKey, // To cover macs
    });
    window.dispatchEvent(event);
  };

  it("should ignore input elements and TextAreas", () => {
    renderHook(() => useDeckHotkeys());

    // Create an input element and focus it
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    fireKey("s", true); // Ctrl+S
    expect(mockStore.saveDeck).not.toHaveBeenCalled();

    // Clean up
    document.body.removeChild(input);
  });

  describe("Save: Ctrl+S", () => {
    it("should savedeck in SOLO mode", () => {
      mockStore.mode = "SOLO";
      renderHook(() => useDeckHotkeys());

      fireKey("s", true);
      expect(mockStore.saveDeck).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        "Deck saved successfully",
        "success"
      );
    });

    it("should saveteam in TEAM mode", () => {
      mockStore.mode = "TEAM";
      renderHook(() => useDeckHotkeys());

      fireKey("s", true);
      expect(mockStore.saveTeam).toHaveBeenCalledWith(
        "team-1",
        "Test Team",
        undefined, // activeSlot ?? undefined where activeSlot is null
        undefined
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        "Team saved successfully",
        "success"
      );
    });

    it("should saveteam with activeSlot if present", () => {
      mockStore.mode = "TEAM";
      mockStore.activeSlot = 2; // Not null
      mockStore.activeTeamId = null; // Test uuid generation fallback by seeing undefined behavior?
      // Actually uuidv4 will generate a dynamic id if activeTeamId is falsy. We'll just test that saveTeam is called.
      renderHook(() => useDeckHotkeys());

      fireKey("s", true);
      expect(mockStore.saveTeam).toHaveBeenCalledWith(
        expect.any(String), // The generated uuid
        "Test Team",
        2,
        undefined
      );
    });

    it("should do nothing if Ctrl is not pressed", () => {
      renderHook(() => useDeckHotkeys());
      fireKey("s", false);
      expect(mockStore.saveDeck).not.toHaveBeenCalled();
    });
  });

  describe("Clear: Ctrl+Shift+Delete/Backspace", () => {
    it("should clear deck immediately in SOLO if saved", () => {
      mockStore.mode = "SOLO";
      (useDeckStore as any).mockImplementation((selector: any) => {
        if (!selector) return mockStore;
        if (selector === selectors.selectIsSaved) return true;
        return null;
      });
      renderHook(() => useDeckHotkeys());

      fireKey("Delete", true, true);
      expect(mockStore.clearDeck).toHaveBeenCalled();
    });

    it("should prompt confirm in SOLO if not saved and clear if affirmed", () => {
      mockStore.mode = "SOLO";
      (useDeckStore as any).mockImplementation((selector: any) => {
        if (!selector) return mockStore;
        if (selector === selectors.selectIsSaved) return false; // Unsaved
        return null;
      });
      renderHook(() => useDeckHotkeys());

      confirmSpy.mockReturnValue(true);
      fireKey("Backspace", true, true); // Cover Backspace too
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockStore.clearDeck).toHaveBeenCalled();
    });

    it("should prompt confirm in SOLO if not saved and do nothing if canceled", () => {
      mockStore.mode = "SOLO";
      (useDeckStore as any).mockImplementation((selector: any) => {
        if (!selector) return mockStore;
        if (selector === selectors.selectIsSaved) return false; // Unsaved
        return null;
      });
      renderHook(() => useDeckHotkeys());

      confirmSpy.mockReturnValue(false);
      fireKey("Delete", true, true);
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockStore.clearDeck).not.toHaveBeenCalled();
    });

    it("should do nothing in TEAM mode", () => {
      mockStore.mode = "TEAM";
      renderHook(() => useDeckHotkeys());

      fireKey("Delete", true, true);
      expect(mockStore.clearDeck).not.toHaveBeenCalled();
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it("should do nothing for unknown modes on Save", () => {
      mockStore.mode = "BOGUS" as any;
      renderHook(() => useDeckHotkeys());
      fireKey("s", true);
      expect(mockStore.saveDeck).not.toHaveBeenCalled();
      expect(mockStore.saveTeam).not.toHaveBeenCalled();
    });

    it("should do nothing if modifiers are missing", () => {
      renderHook(() => useDeckHotkeys());
      fireKey("Delete", true, false); // missing shift
      expect(mockStore.clearDeck).not.toHaveBeenCalled();
    });
  });

  it("should remove listener on unmount", () => {
    const addListenerSpy = vi.spyOn(window, "addEventListener");
    const removeListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useDeckHotkeys());
    expect(addListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );

    unmount();
    expect(removeListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });

  describe("Adversarial & Edge Cases", () => {
    it("ignores textarea elements", () => {
      renderHook(() => useDeckHotkeys());
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.focus();

      fireKey("s", true);
      expect(mockStore.saveDeck).not.toHaveBeenCalled();
      document.body.removeChild(textarea);
    });

    it("handles case-agnostic keys (S vs s)", () => {
      mockStore.mode = "SOLO";
      renderHook(() => useDeckHotkeys());
      fireKey("S", true); // Uppercase
      expect(mockStore.saveDeck).toHaveBeenCalled();
    });

    it("does nothing in SOLO if shift+ctrl+delete pressed but confirm is canceled", () => {
      mockStore.mode = "SOLO";
      (useDeckStore as any).mockImplementation((selector: any) => {
        if (!selector) return mockStore;
        if (selector === selectors.selectIsSaved) return false;
        return null;
      });
      renderHook(() => useDeckHotkeys());

      confirmSpy.mockReturnValue(false); // Canceled
      fireKey("Delete", true, true);
      expect(mockStore.clearDeck).not.toHaveBeenCalled();
    });

    it("uses dynamically-generated activeTeamId if it is null or undefined (TEAM MODE)", () => {
      mockStore.mode = "TEAM";
      mockStore.activeTeamId = undefined; // Falsy
      renderHook(() => useDeckHotkeys());

      fireKey("s", true); // metaKey simulated
      // expects a generated UUID string, not undefined
      expect(mockStore.saveTeam).toHaveBeenCalledWith(
        expect.any(String),
        "Test Team",
        undefined,
        undefined
      );
    });
  });
});
