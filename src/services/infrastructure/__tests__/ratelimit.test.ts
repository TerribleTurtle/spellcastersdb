import { Ratelimit } from "@upstash/ratelimit";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { monitoring } from "@/services/monitoring";

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: vi.fn(),
}));

// Add slidingWindow to the mock Ratelimit class object
vi.mocked(Ratelimit).slidingWindow = vi.fn().mockReturnValue("sliding-limiter");

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureMessage: vi.fn(),
  },
}));

// We test two states: redis existing, and redis null.
// We mock it out via module reset + explicit vi.doMock
describe("ratelimit infrastructure plugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should initialize Ratelimit if redis is available", async () => {
    // 1. Mock local file dependency BEFORE importing it
    const mockFakeRedis = { fake: "redis_client" };
    vi.doMock("../redis", () => ({
      redis: mockFakeRedis,
    }));

    // 2. Act: dynamic import triggers top-level code
    const ratelimitModule = await import("../ratelimit");

    // 3. Assert
    expect(Ratelimit.slidingWindow).toHaveBeenCalledWith(10, "10 s");
    expect(Ratelimit).toHaveBeenCalledWith({
      redis: mockFakeRedis,
      limiter: "sliding-limiter",
      analytics: true,
      prefix: "@upstash/ratelimit",
    });

    // Ratelimit mock constructor returns an object, which should be exported
    expect(ratelimitModule.ratelimit).toBeDefined();
    expect(ratelimitModule.ratelimit).not.toBeNull();
    expect(monitoring.captureMessage).not.toHaveBeenCalled();
  });

  it("should not initialize and should log a warning if redis is null", async () => {
    // 1. Mock local file dependency BEFORE importing
    vi.doMock("../redis", () => ({
      redis: null,
    }));

    // 2. Act
    const ratelimitModule = await import("../ratelimit");

    // 3. Assert
    expect(Ratelimit).not.toHaveBeenCalled();
    expect(ratelimitModule.ratelimit).toBeNull();
    expect(monitoring.captureMessage).toHaveBeenCalledWith(
      "Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not found.",
      "warning"
    );
  });
});
