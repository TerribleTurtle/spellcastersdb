import { beforeEach, describe, expect, it, vi } from "vitest";

import { FALLBACK_ISSUES } from "@/data/roadmap-fallback";
import { DataFetchError } from "@/services/api/api-client";
import { fetchJson } from "@/services/api/api-client";
import { monitoring } from "@/services/monitoring";

import { roadmapService } from "../roadmap-service";

// Mock dependencies
vi.mock("@/services/api/api-client", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/services/api/api-client")>();
  return {
    ...original,
    fetchJson: vi.fn(),
  };
});

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureMessage: vi.fn(),
    captureException: vi.fn(),
  },
}));

const mockFetchJson = vi.mocked(fetchJson);

const MOCK_GITHUB_ISSUES = [
  {
    id: 1,
    number: 10,
    title: "Feature Request",
    html_url: "https://github.com/TerribleTurtle/spellcastersdb/issues/10",
    state: "open",
    labels: [
      { id: 100, name: "enhancement", color: "00ff00", description: "" },
    ],
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
    body: "A feature request",
  },
  {
    id: 2,
    number: 11,
    title: "Bug Fix PR",
    html_url: "https://github.com/TerribleTurtle/spellcastersdb/pull/11",
    state: "open",
    labels: [],
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
    body: "This is a PR, not an issue",
  },
  {
    id: 3,
    number: 12,
    title: "Bug Report",
    html_url: "https://github.com/TerribleTurtle/spellcastersdb/issues/12",
    state: "open",
    labels: [{ id: 200, name: "bug", color: "ff0000", description: "A bug" }],
    created_at: "2025-01-03T00:00:00Z",
    updated_at: "2025-01-04T00:00:00Z",
    body: "Something is broken",
  },
];

describe("roadmapService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getIssues (happy path)", () => {
    it("should return mapped issues and filter out Pull Requests", async () => {
      mockFetchJson.mockResolvedValueOnce(MOCK_GITHUB_ISSUES);

      const result = await roadmapService.getIssues();

      expect(result.isLive).toBe(true);
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0].title).toBe("Feature Request");
      expect(result.issues[1].title).toBe("Bug Report");
      // Verify the PR was filtered out
      expect(result.issues.every((i) => !i.html_url.includes("/pull/"))).toBe(
        true
      );
    });

    it("should correctly map labels from GitHub response", async () => {
      mockFetchJson.mockResolvedValueOnce(MOCK_GITHUB_ISSUES);

      const result = await roadmapService.getIssues();

      expect(result.issues[0].labels).toEqual([
        { id: 100, name: "enhancement", color: "00ff00", description: "" },
      ]);
    });
  });

  describe("getIssues (error handling)", () => {
    it("should return fallback data on 403 rate limit and log a warning", async () => {
      mockFetchJson.mockRejectedValueOnce(
        new DataFetchError("Rate limited", 403)
      );

      const result = await roadmapService.getIssues();

      expect(result.isLive).toBe(false);
      expect(result.issues).toEqual(FALLBACK_ISSUES);
      expect(monitoring.captureMessage).toHaveBeenCalledWith(
        expect.stringContaining("Rate limit"),
        "warning",
        expect.objectContaining({ status: 403 })
      );
    });

    it("should return fallback data on 429 rate limit and log a warning", async () => {
      mockFetchJson.mockRejectedValueOnce(
        new DataFetchError("Too Many Requests", 429)
      );

      const result = await roadmapService.getIssues();

      expect(result.isLive).toBe(false);
      expect(result.issues).toEqual(FALLBACK_ISSUES);
      expect(monitoring.captureMessage).toHaveBeenCalledWith(
        expect.stringContaining("Rate limit"),
        "warning",
        expect.objectContaining({ status: 429 })
      );
    });

    it("should return fallback data on other DataFetchError and log an error", async () => {
      mockFetchJson.mockRejectedValueOnce(
        new DataFetchError("Server Error", 500)
      );

      const result = await roadmapService.getIssues();

      expect(result.isLive).toBe(false);
      expect(result.issues).toEqual(FALLBACK_ISSUES);
      expect(monitoring.captureMessage).toHaveBeenCalledWith(
        expect.stringContaining("GitHub API Error"),
        "error",
        expect.objectContaining({ status: 500 })
      );
    });

    it("should return fallback data on network errors and log an exception", async () => {
      const networkError = new TypeError("fetch failed");
      mockFetchJson.mockRejectedValueOnce(networkError);

      const result = await roadmapService.getIssues();

      expect(result.isLive).toBe(false);
      expect(result.issues).toEqual(FALLBACK_ISSUES);
      expect(monitoring.captureException).toHaveBeenCalledWith(
        networkError,
        expect.objectContaining({
          message: "[RoadmapService] Network/Fetch Error",
        })
      );
    });
  });
});
