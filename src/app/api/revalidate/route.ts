import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { timingSafeEqual } from "crypto";

import { monitoring } from "@/services/monitoring";

export async function GET(request: NextRequest) {
  // Securely get secret from Authorization header
  const authHeader = request.headers.get("authorization");
  const secret = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : request.nextUrl.searchParams.get("secret"); // Fallback for backward compatibility during rollout

  const bufferA = Buffer.from(secret || "");
  const bufferB = Buffer.from(process.env.REVALIDATION_SECRET || "");

  if (bufferA.length !== bufferB.length || !timingSafeEqual(bufferA, bufferB)) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  try {
    // 1. Revalidate Data Cache (This updates all pages that use fetch with 'game-data' tag)
    // This is much more robust than guessing paths.
    // 'max' is required by this Next.js version (16.1.6) for revalidateTag.
    revalidateTag("game-data", "max");

    // 2. Revalidate Sitemap (Static route, not data-driven in the same way)
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: "Game data and sitemap revalidation triggered",
    });
  } catch (err) {
    monitoring.captureException(err, { operation: "revalidation" });
    return NextResponse.json(
      {
        message: "Error revalidating",
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
