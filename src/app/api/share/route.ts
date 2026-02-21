import { NextResponse } from "next/server";

import { anonymizeIp } from "@/services/infrastructure/anonymize-ip";
import { ratelimit } from "@/services/infrastructure/ratelimit";
import { redis } from "@/services/infrastructure/redis";
import { monitoring } from "@/services/monitoring";

const TTL_SECONDS = 30 * 24 * 60 * 60; // 30 Days

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    if (ratelimit) {
      // Anonymize IP before use — raw IPs are PII (GDPR). Hash with salt so
      // the rate limiter can still distinguish clients without storing real IPs.
      const rawIp =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("cf-connecting-ip") ||
        "anonymous";

      const { success } = await ratelimit.limit(`share_${anonymizeIp(rawIp)}`);
      if (!success) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again in a minute." },
          { status: 429 }
        );
      }
    }

    // 2. Body Parsing
    const body = await request.json();
    const { hash, type, path } = body;

    if (!hash || typeof hash !== "string") {
      return NextResponse.json(
        { error: "Missing hash parameter" },
        { status: 400 }
      );
    }
    if (!type || (type !== "deck" && type !== "team")) {
      return NextResponse.json(
        { error: "Invalid type parameter" },
        { status: 400 }
      );
    }

    if (!redis) {
      // Graceful fallback to client: redis isn't configured, they must use long URL
      return NextResponse.json(
        { error: "Redis not configured" },
        { status: 503 }
      );
    }

    // 3. Generate Short ID & Save
    const id = crypto.randomUUID().replace(/-/g, "").substring(0, 7);

    // Save payload
    const payload = JSON.stringify({
      hash,
      type,
      path: path || "/deck-builder",
    });

    await redis.set(`share:${id}`, payload, { ex: TTL_SECONDS });

    return NextResponse.json({ id });
  } catch (error) {
    monitoring.captureException(error, {
      message: "Failed to generate short link",
      context: "/api/share:POST",
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
