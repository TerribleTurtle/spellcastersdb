import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchChangelog } from "../patch-history";
import { CONFIG } from "@/lib/config";

// Mock fetch global
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe("patch-history service (Environment URL Switching)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock changelog_index.json returning null (404) to trigger legacy fallback
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses production URL in production environment", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await fetchChangelog();

    const callUrl = fetchMock.mock.calls[0][0];
    expect(callUrl).toContain(CONFIG.API.BASE_URL);
    expect(callUrl).not.toContain("/api/local-assets");
  });

  it("uses local proxy URL in development environment", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await fetchChangelog();

    const callUrl = fetchMock.mock.calls[0][0];
    expect(callUrl).toContain("/api/local-assets");
  });
});
