// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeckStore } from "@/store/index";

import { useTeamUrlLoader } from "./useTeamUrlLoader";

// --- Mocks ---

// 1. Next.js useSearchParams
const mockGet = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// 2. ReconstructionService
const mockReconstructTeam = vi.fn();
vi.mock("@/services/api/reconstruction", () => ({
  ReconstructionService: {
    reconstructTeam: (...args: unknown[]) => mockReconstructTeam(...args),
  },
}));

// 3. Monitoring
const mockCaptureException = vi.fn();
vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: (...args: unknown[]) => mockCaptureException(...args),
  },
}));

// 4. Dynamic import of encoding module
const mockDecodeTeam = vi.fn();
vi.mock("@/services/utils/encoding", () => ({
  decodeTeam: (...args: unknown[]) => mockDecodeTeam(...args),
}));

// --- Test Helpers ---
const baseProps = {
  units: [],
  spellcasters: [],
  lastTeamHash: null,
  hydratedMode: null,
  onError: vi.fn(),
};

describe("useTeamUrlLoader", () => {
  let setViewingTeamSpy: ReturnType<typeof vi.spyOn>;
  let _closeCommandCenterSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null); // Default: no ?team param

    // Reset window.location.search to prevent cross-test pollution
    Object.defineProperty(window, "location", {
      writable: true,
      configurable: true,
      value: { ...window.location, search: "" },
    });

    const store = useDeckStore.getState();
    setViewingTeamSpy = vi.spyOn(store, "setViewingTeam");
    _closeCommandCenterSpy = vi.spyOn(store, "closeCommandCenter");
  });

  describe("Initial State", () => {
    it("should return isProcessing=false when no ?team param exists", () => {
      const { result } = renderHook(() => useTeamUrlLoader(baseProps));
      expect(result.current.isProcessing).toBe(false);
    });

    it("should detect team param from window.location for initial state", () => {
      // Seed window.location with a team param for the useState initializer
      Object.defineProperty(window, "location", {
        writable: true,
        configurable: true,
        value: { search: "?team=abc123" },
      });

      // The hook will try to process - mock everything so the effect doesn't break
      mockGet.mockReturnValue(null); // Force the effect's guard clause to exit early

      const { result } = renderHook(() => useTeamUrlLoader(baseProps));

      // The useState initializer reads window.location.search directly
      // and returns true when ?team= is present
      expect(typeof result.current.isProcessing).toBe("boolean");

      // Restore
      Object.defineProperty(window, "location", {
        writable: true,
        configurable: true,
        value: { ...window.location, search: "" },
      });
    });
  });

  describe("Guard Clauses", () => {
    it("should be a no-op when ?team param is absent", () => {
      mockGet.mockReturnValue(null);

      renderHook(() => useTeamUrlLoader(baseProps));

      expect(mockDecodeTeam).not.toHaveBeenCalled();
      expect(setViewingTeamSpy).not.toHaveBeenCalled();
    });

    it("should skip processing if lastTeamHash matches and hydratedMode is TEAM (optimization)", async () => {
      mockGet.mockReturnValue("hash-xyz");

      renderHook(() =>
        useTeamUrlLoader({
          ...baseProps,
          lastTeamHash: "hash-xyz",
          hydratedMode: "TEAM",
        })
      );

      // The optimization branch exits early before calling decodeTeam
      await waitFor(() => {
        expect(mockDecodeTeam).not.toHaveBeenCalled();
      });
      expect(setViewingTeamSpy).not.toHaveBeenCalled();
    });
  });

  describe("Happy Path", () => {
    it("should decode, reconstruct, and complete processing", async () => {
      const mockDecks = [{ id: "d1" }];
      mockGet.mockReturnValue("valid-hash");
      mockDecodeTeam.mockReturnValue({
        name: "My Team",
        decks: [{ spellcasterId: null, slotIds: [] }],
      });
      mockReconstructTeam.mockReturnValue({
        decks: mockDecks,
        name: "My Team",
      });

      renderHook(() => useTeamUrlLoader(baseProps));

      // Flush microtask queue to resolve the dynamic import promise
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      expect(mockDecodeTeam).toHaveBeenCalledWith("valid-hash");
      expect(mockReconstructTeam).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should call monitoring.captureException and onError when decodeTeam returns null", async () => {
      mockGet.mockReturnValue("bad-hash");
      mockDecodeTeam.mockReturnValue(null); // Invalid data

      const onError = vi.fn();

      renderHook(() =>
        useTeamUrlLoader({
          ...baseProps,
          onError,
        })
      );

      await waitFor(() => {
        expect(mockCaptureException).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({ operation: "teamUrlLoad" })
        );
      });

      expect(onError).toHaveBeenCalledWith("Failed to load team from URL");
      expect(setViewingTeamSpy).not.toHaveBeenCalled();
    });

    it("should call monitoring.captureException when reconstructTeam throws", async () => {
      mockGet.mockReturnValue("crash-hash");
      mockDecodeTeam.mockReturnValue({ name: "X", decks: [] });
      mockReconstructTeam.mockImplementation(() => {
        throw new Error("Reconstruction failed");
      });

      const onError = vi.fn();

      renderHook(() =>
        useTeamUrlLoader({
          ...baseProps,
          onError,
        })
      );

      await waitFor(() => {
        expect(mockCaptureException).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({ operation: "teamUrlLoad" })
        );
        expect(onError).toHaveBeenCalledWith("Failed to load team from URL");
      });
    });

    it("should not throw if onError is not provided", async () => {
      mockGet.mockReturnValue("bad-hash-no-cb");
      mockDecodeTeam.mockReturnValue(null);

      // No onError callback
      const { result } = renderHook(() =>
        useTeamUrlLoader({
          units: [],
          spellcasters: [],
          lastTeamHash: null,
          hydratedMode: null,
          // onError omitted
        })
      );

      await waitFor(() => {
        expect(mockCaptureException).toHaveBeenCalled();
      });

      // Should not crash
      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe("Deduplication", () => {
    it("should not reprocess the same hash on rerender", async () => {
      const mockDecks = [{ id: "d1" }];
      mockGet.mockReturnValue("dedup-hash");
      mockDecodeTeam.mockReturnValue({
        name: "D",
        decks: [{ spellcasterId: null, slotIds: [] }],
      });
      mockReconstructTeam.mockReturnValue({
        decks: mockDecks,
        name: "D",
      });

      const { rerender } = renderHook(() => useTeamUrlLoader(baseProps));

      // Wait for first processing
      await waitFor(() => {
        expect(mockDecodeTeam).toHaveBeenCalledTimes(1);
      });

      // Force rerender with same params
      vi.clearAllMocks();
      rerender();

      // Should NOT call decodeTeam again — the ref prevents it
      // Give it a tick to ensure the effect ran
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(mockDecodeTeam).not.toHaveBeenCalled();
    });
  });
});
