/**
 * @file route.tsx
 * @description CRITICAL CORE COMPONENT. Public API for generating Social Share (OG) Images.
 * DO NOT DELETE OR MODIFY WITHOUT VERIFICATION.
 */
import { NextRequest } from "next/server";

import { fetchGameData } from "@/lib/api";
import { ratelimit } from "@/lib/ratelimit";
import { renderDeckImage } from "./render-deck";
import { renderTeamImage } from "./render-team";

export const runtime = "nodejs";

// Font fallback strategy:
const fontUrl =
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/oswald/Oswald-Bold.ttf";

export async function GET(request: NextRequest) {
  // Rate Limiting
  if (ratelimit) {
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return new Response("Too Many Requests", { status: 429 });
    }
  }

  try {
    const { searchParams, origin } = new URL(request.url);
    const deckHash = searchParams.get("deck") || searchParams.get("d");
    const teamHash = searchParams.get("team");

    // Load Font (Oswald)
    let fontData: ArrayBuffer | null = null;
    try {
      const fontRes = await fetch(fontUrl);
      if (fontRes.ok) {
        fontData = await fontRes.arrayBuffer();
      }
    } catch (e) {
      console.warn("Font fetch failed", e);
    }

    // Fetch Game Data
    const data = await fetchGameData();

    // --- TEAM MODE ---
    if (teamHash) {
      return renderTeamImage(teamHash, data, fontData, origin);
    }

    // --- DECK MODE ---
    if (!deckHash) {
      return new Response("Missing deck or team parameter", { status: 400 });
    }

    return renderDeckImage(deckHash, data, fontData, origin);
  } catch (e: unknown) {
    console.error("OG Error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(`OG Error: ${message}`, { status: 500 });
  }
}
