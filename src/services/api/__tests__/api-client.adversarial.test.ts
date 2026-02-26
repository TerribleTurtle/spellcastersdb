import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataFetchError, fetchChunk, fetchJson } from "../api-client";

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
  })),
}));

/**
 * ADVERSARIAL: API Client
 * Throws garbage at fetch, feeds malformed JSON, tests timeout behavior,
 * and fires thrown primitives (strings, numbers, booleans) instead of Errors.
 */
describe("api-client.ts — adversarial", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // ─── Thrown Primitives ───────────────────────────────────────────
  describe("thrown primitive types (not Error instances)", () => {
    const THROWN_GARBAGE = [
      { value: "string error", label: "string" },
      { value: 42, label: "number" },
      { value: true, label: "boolean" },
      { value: null, label: "null" },
      { value: undefined, label: "undefined" },
      { value: { custom: "object" }, label: "plain object" },
      { value: ["array", "error"], label: "array" },
    ];

    for (const { value, label } of THROWN_GARBAGE) {
      it(`should wrap thrown ${label} in DataFetchError`, async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(value);

        await expect(fetchJson("http://test.com")).rejects.toThrow(
          DataFetchError
        );
      });
    }
  });

  // ─── Malformed Response Bodies ───────────────────────────────────
  describe("malformed response bodies", () => {
    it("should throw when response.json() throws (invalid JSON)", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new SyntaxError("Unexpected token")),
      });

      await expect(fetchJson("http://test.com")).rejects.toThrow(
        DataFetchError
      );
    });

    it("should handle response.json() returning undefined", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(undefined),
      });

      const result = await fetchJson("http://test.com");
      expect(result).toBeUndefined();
    });

    it("should handle response.json() returning null", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      });

      const result = await fetchJson("http://test.com");
      expect(result).toBeNull();
    });
  });

  // ─── HTTP Status Edge Cases ──────────────────────────────────────
  describe("HTTP status edge cases", () => {
    const NASTY_STATUSES = [
      0, 299, 300, 400, 403, 418, 429, 500, 502, 503, 504, 599,
    ];

    for (const status of NASTY_STATUSES) {
      it(`should throw DataFetchError for status ${status}`, async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
          ok: status >= 200 && status < 300,
          status,
          statusText: `Status ${status}`,
          json: () => Promise.resolve({}),
        });

        if (status >= 200 && status < 300) {
          // Should succeed
          await expect(fetchJson("http://test.com")).resolves.toBeDefined();
        } else {
          await expect(fetchJson("http://test.com")).rejects.toThrow(
            DataFetchError
          );
        }
      });
    }
  });

  // ─── URL Injection ───────────────────────────────────────────────
  describe("URL injection via fetchChunk", () => {
    it("should not crash with path traversal endpoint", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await expect(fetchChunk("../../../etc/passwd")).resolves.toBeDefined();
    });

    it("should handle endpoint with query string injection", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await expect(fetchChunk("units.json?admin=true")).resolves.toBeDefined();
    });

    it("should handle empty string endpoint", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await expect(fetchChunk("")).resolves.toBeDefined();
    });
  });

  // ─── Re-throw Preservation ───────────────────────────────────────
  describe("DataFetchError re-throw preservation", () => {
    it("should preserve the original DataFetchError when re-thrown", async () => {
      const originalError = new DataFetchError("Original", 404);
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        originalError
      );

      try {
        await fetchJson("http://test.com");
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).toBe(originalError);
        expect((err as DataFetchError).status).toBe(404);
      }
    });
  });
});
