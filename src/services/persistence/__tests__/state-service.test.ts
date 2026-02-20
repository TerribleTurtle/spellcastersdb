import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppState, StateService } from "../state-service";

// Matching implementation constant since it's not exported
const STORAGE_KEY_APP_STATE = "spellcasters_app_state_v2";

const MockState: AppState = {
  mode: "TEAM",
  viewSummary: true,
  lastTeamHash: "hash123",
};

describe("StateService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe("save", () => {
    it("should save state to localStorage", () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      StateService.save(MockState);

      expect(setItemSpy).toHaveBeenCalledWith(
        STORAGE_KEY_APP_STATE,
        JSON.stringify(MockState)
      );
    });

    it("should handle quota exceeded error gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      // Should not throw
      expect(() => StateService.save(MockState)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe("hydrate", () => {
    it("should return defaults if no data in localStorage", () => {
      const result = StateService.hydrate("SOLO", false);

      expect(result).toEqual({
        hydratedMode: "SOLO",
        hydratedViewSummary: false,
        lastHash: null,
      });
    });

    it("should return parsed state if valid data exists", () => {
      localStorage.setItem(STORAGE_KEY_APP_STATE, JSON.stringify(MockState));

      // Pass different defaults to ensure it reads from storage
      const result = StateService.hydrate("SOLO", false);

      expect(result).toEqual({
        hydratedMode: "TEAM",
        hydratedViewSummary: true,
        lastHash: "hash123",
      });
    });

    it("should return defaults if data is corrupt", () => {
      localStorage.setItem(STORAGE_KEY_APP_STATE, "{ invalid json");
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = StateService.hydrate("SOLO", false);

      expect(result).toEqual({
        hydratedMode: "SOLO",
        hydratedViewSummary: false,
        lastHash: null,
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
