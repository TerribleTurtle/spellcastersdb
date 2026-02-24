import { Redis } from "@upstash/redis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { monitoring } from "@/services/monitoring";

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: vi.fn(),
  },
}));

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

describe("redis infrastructure plugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules(); // Force dynamic import to re-evaluate the module level code
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should initialize upstash redis when required env vars are present", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://fake-url.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "fake-token");

    const mockRedisInstance = { fake: "redis" };
    vi.mocked(Redis.fromEnv).mockReturnValue(
      mockRedisInstance as unknown as Redis
    );

    // Act
    const redisModule = await import("./redis");

    // Assert
    expect(Redis.fromEnv).toHaveBeenCalled();
    expect(redisModule.redis).toBe(mockRedisInstance);
    expect(monitoring.captureMessage).not.toHaveBeenCalled();
    expect(monitoring.captureException).not.toHaveBeenCalled();
  });

  it("should not initialize and should log a warning if env vars are missing", async () => {
    // Delete just the token so the condition fails
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://fake-url.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", ""); // falsy

    // Act
    const redisModule = await import("./redis");

    // Assert
    expect(Redis.fromEnv).not.toHaveBeenCalled();
    expect(redisModule.redis).toBeNull();
    expect(monitoring.captureMessage).toHaveBeenCalledWith(
      "Redis disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not found.",
      "warning"
    );
  });

  it("should capture an exception if Redis.fromEnv throws", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://fake-url.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "fake-token");

    const mockError = new Error("Failed to connect");
    vi.mocked(Redis.fromEnv).mockImplementation(() => {
      throw mockError;
    });

    // Act
    const redisModule = await import("./redis");

    // Assert
    expect(Redis.fromEnv).toHaveBeenCalled();
    expect(redisModule.redis).toBeNull(); // Caught by the try/catch, remains null
    expect(monitoring.captureException).toHaveBeenCalledWith(mockError, {
      message: "Failed to initialize Upstash Redis from environment",
      context: "redis.ts",
    });
  });
});
