import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataFetchError } from "@/services/config/errors";
import { monitoring } from "@/services/monitoring";

import {
  fetchChunk,
  fetchChunkedData,
  fetchCriticalChunkedData,
  fetchJson,
} from "../api-client";

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

vi.mock("../mappers", () => ({
  mapRawDataToAllData: vi.fn((data) => ({
    ...data,
    infusions: data.infusions || [],
  })), // Passthrough with defaults
}));

describe("api-client.ts", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("fetchJson", () => {
    it("should return parsed JSON on success", async () => {
      const mockResponse = { test: true };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchJson("http://test.com");
      expect(result).toEqual(mockResponse);
    });

    it("should throw DataFetchError and log on HTTP error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(fetchJson("http://test.com")).rejects.toThrow(
        DataFetchError
      );
      // Wait for the async logging to complete if it's fire-and-forget or we just need the next tick
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(monitoring.captureMessage).toHaveBeenCalled();
    });

    it("should wrap network errors in 500 DataFetchError and log", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network Error")
      );

      await expect(fetchJson("http://test.com")).rejects.toThrow(
        "Network Error"
      );
      expect(monitoring.captureException).toHaveBeenCalled();
    });

    it("should handle non-Error throws", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        "String error"
      );

      await expect(fetchJson("http://test.com")).rejects.toThrow(
        "Unknown fetch error"
      );
    });
  });

  describe("fetchChunk", () => {
    it("should append endpoint to base URL and pass init config", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: "chunk" }),
      });

      await fetchChunk("test-endpoint", { next: { revalidate: 3600 } });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/test-endpoint"),
        expect.objectContaining({
          next: { revalidate: 3600, tags: ["game-data", "test-endpoint"] },
        })
      );
    });
  });

  describe("fetchChunkedData", () => {
    it("should return parsed data with _source tracking on full success", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await fetchChunkedData();
      expect(result._source).toBe("Remote API (Chunked)");
      expect(result.units).toEqual([]); // since we mapped [] -> []
    });

    it("should throw if critical chunks (units/spells/heroes) fail", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }); // e.g. spells endpoint fails

      await expect(fetchChunkedData()).rejects.toThrow(DataFetchError);
    });

    it("should gracefully degrade non-critical chunks (titans, consumables, upgrades, infusions) to [] on failure", async () => {
      // Return ok for spells, units, heroes. Return failure for the rest.
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (
          url.includes("spells") ||
          url.includes("units") ||
          url.includes("heroes") ||
          url.includes("build-info")
        ) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        }
        return Promise.resolve({ ok: false, status: 500 }); // simulate failure for non-critical
      });

      const result = await fetchChunkedData();
      expect(result.titans).toEqual([]);
      expect(result.upgrades).toEqual([]);
      expect(result.infusions).toEqual([]);
      expect(monitoring.captureException).toHaveBeenCalled(); // non-critical failures should be logged
    });
  });

  describe("fetchCriticalChunkedData", () => {
    it("should fetch only critical chunks and hardcode Upgrades/Consumables/Infusions to []", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await fetchCriticalChunkedData();
      expect(result._source).toBe("Remote API (Critical)");
      expect(result.upgrades).toEqual([]);
      expect(result.consumables).toEqual([]);
      expect(result.infusions).toEqual([]);
      expect(result.spellcasters).toBeDefined(); // Fetched
      expect(result.titans).toBeDefined(); // Fetched
    });

    it("should gracefully degrade Titans to [] on failure", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url) => {
        if (url.includes("titans")) {
          return Promise.resolve({ ok: false, status: 500 });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      });

      const result = await fetchCriticalChunkedData();
      expect(result.titans).toEqual([]);
      expect(monitoring.captureException).toHaveBeenCalled();
    });
  });
});
