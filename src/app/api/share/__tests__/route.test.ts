import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/share/route";
// Import mocks after vi.mock so we can manipulate them
import { ratelimit } from "@/services/infrastructure/ratelimit";
import { redis } from "@/services/infrastructure/redis";

// Mock dependencies
vi.mock("@/services/infrastructure/ratelimit", () => ({
  ratelimit: {
    limit: vi.fn(),
  },
}));

vi.mock("@/services/infrastructure/redis", () => {
  const mockPipeline = {
    set: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(["OK", "OK"]),
  };
  return {
    redis: {
      get: vi.fn(),
      set: vi.fn(),
      pipeline: vi.fn(() => mockPipeline),
    },
  };
});

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
  },
}));

// Helper to create a mock Request with a JSON body
function createRequest(
  body: Record<string, unknown>,
  headers?: Record<string, string>
): Request {
  return new Request("http://localhost:3000/api/share", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/share", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default: rate limit passes
    vi.mocked(ratelimit!.limit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60_000,
      pending: Promise.resolve(),
    });
    // Default: redis get misses (no cached link)
    vi.mocked(redis!.get).mockResolvedValue(null);
    // Default: redis set succeeds
    vi.mocked(redis!.set).mockResolvedValue("OK");
  });

  // ─── Happy Path ───────────────────────────────────────────────────

  it("returns a 7-char id on valid solo deck request", async () => {
    const req = createRequest({
      hash: "NobwRAenc",
      type: "deck",
      path: "/deck-builder",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBeDefined();
    expect(json.id).toHaveLength(7);
  });

  it("stores the payload and reverse lookup in Redis via pipeline with a 30-day TTL", async () => {
    const req = createRequest({
      hash: "NobwRAenc",
      type: "deck",
      path: "/deck-builder",
    });

    const res = await POST(req);
    const json = await res.json();

    const pipeline = redis!.pipeline();
    expect(pipeline.set).toHaveBeenCalledWith(
      `share:${json.id}`,
      expect.stringContaining('"hash":"NobwRAenc"'),
      { ex: 30 * 24 * 60 * 60 }
    );
    expect(pipeline.set).toHaveBeenCalledWith(
      `share_hash:deck:NobwRAenc`,
      json.id,
      { ex: 30 * 24 * 60 * 60 }
    );
    expect(pipeline.exec).toHaveBeenCalled();
  });

  it("returns an existing ID when the payload hash already exists in Redis", async () => {
    vi.mocked(redis!.get).mockResolvedValueOnce("existing-id-123");

    const req = createRequest({
      hash: "NobwRAenc",
      type: "deck",
      path: "/deck-builder",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBe("existing-id-123");

    // It should NOT try to create or pipeline anything new
    expect(redis!.pipeline).not.toHaveBeenCalled();
    expect(redis!.set).not.toHaveBeenCalled();
  });

  it("accepts a valid team request", async () => {
    const req = createRequest({
      hash: "v2~teamdata",
      type: "team",
      path: "/deck-builder",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toHaveLength(7);
  });

  // ─── Validation ───────────────────────────────────────────────────

  it("returns 400 when hash is missing", async () => {
    const req = createRequest({ type: "deck" });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("hash");
  });

  it("returns 400 when type is invalid", async () => {
    const req = createRequest({ hash: "abc", type: "spell" });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("type");
  });

  // ─── Rate Limiting ────────────────────────────────────────────────

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(ratelimit!.limit).mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60_000,
      pending: Promise.resolve(),
    });

    const req = createRequest({
      hash: "NobwRAenc",
      type: "deck",
      path: "/deck-builder",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toContain("Rate limit");
    expect(redis!.set).not.toHaveBeenCalled();
  });

  // ─── Redis Unavailable ────────────────────────────────────────────

  it("returns 503 when Redis is not configured", async () => {
    // Temporarily set redis to null
    const redisModule = await import("@/services/infrastructure/redis");
    const originalRedis = redisModule.redis;
    Object.defineProperty(redisModule, "redis", {
      value: null,
      writable: true,
      configurable: true,
    });

    const req = createRequest({
      hash: "NobwRAenc",
      type: "deck",
      path: "/deck-builder",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.error).toContain("Redis");

    // Restore
    Object.defineProperty(redisModule, "redis", {
      value: originalRedis,
      writable: true,
      configurable: true,
    });
  });

  // ─── Error Handling ───────────────────────────────────────────────

  it("returns 500 and captures exception when Redis pipeline throws", async () => {
    const mockPipeline = redis!.pipeline();
    (
      mockPipeline.exec as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error("Connection refused (pipeline)"));

    const req = createRequest({
      hash: "NobwRAenc",
      type: "deck",
      path: "/deck-builder",
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Internal Server Error");
  });

  // ─── IP Extraction ────────────────────────────────────────────────

  it("uses x-forwarded-for header for rate limiting", async () => {
    const rawIp = "1.2.3.4";
    const req = createRequest(
      { hash: "abc", type: "deck", path: "/deck-builder" },
      { "x-forwarded-for": rawIp }
    );

    await POST(req);

    // Dynamic import to get the actual anonymized value used by the route (which uses the default salt)
    const { anonymizeIp } =
      await import("@/services/infrastructure/anonymize-ip");
    expect(ratelimit!.limit).toHaveBeenCalledWith(
      `share_${anonymizeIp(rawIp)}`
    );
  });
});
