import { NextResponse } from "next/server";

import { redis } from "@/services/infrastructure/redis";
import { monitoring } from "@/services/monitoring";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validate redis is available
    if (!redis) {
      // Without redis, we can't look up the link.
      return NextResponse.redirect(
        new URL("/deck-builder?error=redis-offline", request.url)
      );
    }

    // Await params since Next 15 requires it
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || typeof id !== "string") {
      return NextResponse.redirect(
        new URL("/deck-builder?error=invalid-link", request.url)
      );
    }

    // 2. Lookup in Redis
    const dataString = await redis.get<string>(`share:${id}`);

    if (!dataString) {
      // Link expired or never existed
      return NextResponse.redirect(
        new URL("/deck-builder?error=link-expired", request.url)
      );
    }

    // 3. Parse and redirect
    let data;
    try {
      // Upstash sometimes returns objects directly if it auto-parses JSON,
      // but if we saved stringified payload, it might come back as a string.
      data =
        typeof dataString === "string" ? JSON.parse(dataString) : dataString;
    } catch (e) {
      monitoring.captureException(e, {
        message: "Failed to parse short link data from Redis",
        context: `/s/[id]:GET`,
        id,
      });
      return NextResponse.redirect(
        new URL("/deck-builder?error=invalid-data", request.url)
      );
    }

    const { hash, type, path } = data;
    const redirectPath = path || "/deck-builder";

    // Construct the redirect URL with the hash params
    const targetUrl = new URL(redirectPath, request.url);
    if (type === "team") {
      targetUrl.searchParams.set("team", hash);
    } else {
      targetUrl.searchParams.set("d", hash);
    }

    return NextResponse.redirect(targetUrl);
  } catch (error) {
    monitoring.captureException(error, {
      message: "Exception resolving short link",
      context: "/s/[id]:GET",
    });
    return NextResponse.redirect(
      new URL("/deck-builder?error=server-error", request.url)
    );
  }
}
