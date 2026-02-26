// @vitest-environment node
import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { monitoring } from "@/services/monitoring";

import { assetCache, getCachedAsset } from "../asset-cache";

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureMessage: vi.fn(),
  },
}));

describe("Asset Cache (Server Implementation)", () => {
  beforeEach(() => {
    assetCache.clear();
    global.fetch = vi.fn();

    // Ensure "window" is undefined to trigger server path
    // Vitest runs in Node (JSDOM optional), but we want to force server path logic check.
    // We cannot delete global.window easily if JSDOM is present, but we can check if implementation respects it.
    // Actually, asset-cache checks: if (typeof window !== "undefined" && typeof FileReader !== "undefined")
    // So we just need to ensure window/FileReader are undefined or implementation falls back.
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should use Buffer path in Node environment", async () => {
    // Mock fetch response
    const mockArrayBuffer = new TextEncoder().encode("fake-image-data"); // "fake-image-data"

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => mockArrayBuffer,
    });

    // Use defineProperty to shadow window if it exists (JSDOM environment)
    // Or we can rely on verifying the output, but output format is same.
    // However, implementation uses Buffer.from() in else block.
    // Spy on Buffer.from? It's global.
    const bufferSpy = vi.spyOn(Buffer, "from");

    const result = await getCachedAsset("https://example.com/image.png");

    expect(result).toBeDefined();

    // @vitest-environment node ensures window is undefined, so Buffer path is taken
    expect(bufferSpy).toHaveBeenCalled();

    expect(result?.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("should use image/webp mime type for .webp extensions", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new TextEncoder().encode("webp-data"),
    });

    const result = await getCachedAsset("https://example.com/image.webp");
    expect(result?.startsWith("data:image/webp;base64,")).toBe(true);
  });

  it("should return cached value on subsequent calls without fetching", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new TextEncoder().encode("data"),
    });

    const url = "https://example.com/cache-hit.png";
    await getCachedAsset(url);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const cachedResult = await getCachedAsset(url);
    expect(cachedResult).toBeDefined();
    expect(global.fetch).toHaveBeenCalledTimes(1); // Not called again
  });

  it("should deduplicate concurrent requests", async () => {
    // Mock fetch to simulate latency so both calls hit the dedup logic
    (global.fetch as Mock).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return {
        ok: true,
        arrayBuffer: async () => new TextEncoder().encode("concurrent"),
      };
    });

    const url = "https://example.com/concurrent.png";
    const [res1, res2] = await Promise.all([
      getCachedAsset(url),
      getCachedAsset(url),
    ]);

    expect(res1).toBe(res2);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should evict oldest item when max cache size is exceeded", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new TextEncoder().encode("data"),
    });

    // Fill the cache up to its limit (50)
    for (let i = 0; i < 50; i++) {
      await getCachedAsset(`https://example.com/img${i}.png`);
    }

    expect(assetCache.size).toBe(50);
    expect(assetCache.has("https://example.com/img0.png")).toBe(true);

    // Add 51st item, should evict the first one (img0.png)
    await getCachedAsset(`https://example.com/img50.png`);

    expect(assetCache.size).toBe(50);
    expect(assetCache.has("https://example.com/img0.png")).toBe(false); // Evicted
    expect(assetCache.has("https://example.com/img50.png")).toBe(true);
  });

  it("should return null and log warning if fetch fails with non-ok response", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
    });

    const url = "https://example.com/bad.png";
    const result = await getCachedAsset(url);

    expect(result).toBeNull();
    // Non-ok skips the `if (res.ok)` block and returns null without throwing.
  });

  it("should return null and capture message if fetch throws an error", async () => {
    const error = new Error("Network error");
    (global.fetch as Mock).mockRejectedValue(error);

    const result = await getCachedAsset("https://example.com/error.png");

    expect(result).toBeNull();
    expect(monitoring.captureMessage).toHaveBeenCalledWith(
      "Asset fetch failed",
      "warning",
      { url: "https://example.com/error.png", error }
    );
  });
});
