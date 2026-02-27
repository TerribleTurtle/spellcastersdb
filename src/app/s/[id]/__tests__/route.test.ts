import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/s/[id]/route";
import { redis } from "@/services/infrastructure/redis";
import { monitoring } from "@/services/monitoring";

vi.mock("@/services/infrastructure/redis", () => ({
  redis: {
    get: vi.fn(),
  },
}));

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

vi.mock("@/services/api/api", () => ({
  getSpellcasterById: vi.fn().mockResolvedValue({ name: "Arcanus" }),
}));

// Mock NextResponse.redirect to return a simple object
vi.mock("next/server", () => {
  return {
    NextResponse: {
      redirect: vi.fn((url: string | URL) => {
        return { status: 307, headers: { Location: url.toString() } };
      }),
    },
  };
});

function createRequest(url: string) {
  return new Request(url);
}

describe("GET /s/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Success: 200 HTML with OG Tags ───────────────────────────────

  it("returns 200 HTML with og:image for a valid deck link", async () => {
    vi.mocked(redis!.get).mockResolvedValue(
      JSON.stringify({
        hash: "mydeckhash",
        type: "deck",
        path: "/deck-builder",
      })
    );

    const req = createRequest("https://spellcastersdb.com/s/123XYZ");
    const res = await GET(req, { params: Promise.resolve({ id: "123XYZ" }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");

    const body = await res.text();
    expect(body).toContain('<meta property="og:image"');
    expect(body).toContain("/api/og?d=mydeckhash");
    expect(body).toContain('<meta http-equiv="refresh"');
    expect(body).toContain("/deck-builder?d=mydeckhash");
  });

  it("returns 200 HTML with og:image for a valid team link", async () => {
    vi.mocked(redis!.get).mockResolvedValue(
      JSON.stringify({
        hash: "myteamhash",
        type: "team",
        path: "/deck-builder",
      })
    );

    const req = createRequest("https://spellcastersdb.com/s/789ABC");
    const res = await GET(req, { params: Promise.resolve({ id: "789ABC" }) });

    expect(res.status).toBe(200);

    const body = await res.text();
    expect(body).toContain('<meta property="og:image"');
    expect(body).toContain("/api/og?team=");
    expect(body).toContain('<meta http-equiv="refresh"');
    expect(body).toContain("team=myteamhash");
  });

  it("includes twitter:card summary_large_image in the HTML", async () => {
    vi.mocked(redis!.get).mockResolvedValue(
      JSON.stringify({ hash: "abc", type: "deck", path: "/deck-builder" })
    );

    const req = createRequest("https://spellcastersdb.com/s/tw1");
    const res = await GET(req, { params: Promise.resolve({ id: "tw1" }) });
    const body = await res.text();

    expect(body).toContain(
      '<meta name="twitter:card" content="summary_large_image"'
    );
    expect(body).toContain('<meta name="twitter:image"');
  });

  it("handles when Upstash auto-parses the JSON and returns an object", async () => {
    vi.mocked(redis!.get).mockResolvedValue({
      hash: "parsedhash",
      type: "deck",
      path: "/deck-builder",
    } as any);

    const req = createRequest("https://spellcastersdb.com/s/autoXYZ");
    const res = await GET(req, { params: Promise.resolve({ id: "autoXYZ" }) });

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("og:image");
    expect(body).toContain("/deck-builder?d=parsedhash");
  });

  // ─── Error Cases: Standard 307 Redirects ──────────────────────────

  it("redirects to error=invalid-link if id is missing", async () => {
    const req = createRequest("https://spellcastersdb.com/s/");
    const res = (await GET(req, {
      params: Promise.resolve({ id: "" }),
    })) as any;

    expect(res.status).toBe(307);
    expect(res.headers.Location).toContain("?error=invalid-link");
    expect(redis!.get).not.toHaveBeenCalled();
  });

  it("redirects to error=link-expired if redis returns null", async () => {
    vi.mocked(redis!.get).mockResolvedValue(null);

    const req = createRequest("https://spellcastersdb.com/s/expired123");
    const res = (await GET(req, {
      params: Promise.resolve({ id: "expired123" }),
    })) as any;

    expect(res.status).toBe(307);
    expect(res.headers.Location).toContain("?error=link-expired");
  });

  it("redirects to error=invalid-data and logs exception if parsing fails", async () => {
    vi.mocked(redis!.get).mockResolvedValue("this is not valid json");

    const req = createRequest("https://spellcastersdb.com/s/badjson");
    const res = (await GET(req, {
      params: Promise.resolve({ id: "badjson" }),
    })) as any;

    expect(res.status).toBe(307);
    expect(res.headers.Location).toContain("?error=invalid-data");
    expect(monitoring.captureException).toHaveBeenCalled();
  });

  it("redirects to error=server-error and logs exception if redis.get throws", async () => {
    vi.mocked(redis!.get).mockRejectedValue(new Error("Redis is angry"));

    const req = createRequest("https://spellcastersdb.com/s/boom");
    const res = (await GET(req, {
      params: Promise.resolve({ id: "boom" }),
    })) as any;

    expect(res.status).toBe(307);
    expect(res.headers.Location).toContain("?error=server-error");
    expect(monitoring.captureException).toHaveBeenCalled();
  });

  it("redirects to error=redis-offline if redis client is null", async () => {
    const redisModule = await import("@/services/infrastructure/redis");
    const originalRedis = redisModule.redis;

    Object.defineProperty(redisModule, "redis", {
      value: null,
      writable: true,
      configurable: true,
    });

    const req = createRequest("https://spellcastersdb.com/s/offline");
    const res = (await GET(req, {
      params: Promise.resolve({ id: "offline" }),
    })) as any;

    expect(res.status).toBe(307);
    expect(res.headers.Location).toContain("?error=redis-offline");

    Object.defineProperty(redisModule, "redis", {
      value: originalRedis,
      writable: true,
      configurable: true,
    });
  });
});
