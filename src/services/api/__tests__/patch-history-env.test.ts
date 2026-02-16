import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchBalanceIndex } from "../patch-history";
import { CONFIG } from "@/lib/config";

// Mock fetch global
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe("patch-history service (Environment URL Switching)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ patch_version: "1.0", patch_date: "2026-01-01", entities: {} }),
    });
    // Default to test or development if not stubbed
     vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses production URL in production environment", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await fetchBalanceIndex();
    
    const callUrl = fetchMock.mock.calls[0][0];
    expect(callUrl).toContain(CONFIG.API.BASE_URL);
    expect(callUrl).not.toContain("/api/local-assets");
  });

  it("uses local proxy URL in development environment", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await fetchBalanceIndex();

    const callUrl = fetchMock.mock.calls[0][0];
    // In dev, the code uses window.location.origin if available, or just the path
    // Let's check the implementation of fetchBalanceIndex logic if needed, 
    // but based on previous test expectation:
    expect(callUrl).toBe("/api/local-assets/balance_index.json");
  });
});
