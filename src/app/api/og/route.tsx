import { NextRequest } from "next/server";

import { promises as fs } from "fs";
import path from "path";

import { fetchGameData } from "@/services/api/api";
import { ratelimit } from "@/services/infrastructure/ratelimit";
import { monitoring } from "@/services/monitoring";

import { renderDeckImage } from "./render-deck";
import { renderEntityImage } from "./render-entity";
import { renderTeamImage } from "./render-team";

export const runtime = "nodejs";

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

    // Entity IDs
    const spellcasterId = searchParams.get("spellcasterId");
    const unitId = searchParams.get("unitId");
    const itemId = searchParams.get("itemId");
    // Fallback/Generic ID (used by legacy calls)
    const genericId = searchParams.get("id");

    // Load Font (Oswald) from local filesystem
    // We use WOFF format from @fontsource/oswald
    const fontPath = path.join(
      process.cwd(),
      "src/assets/fonts/Oswald-Bold.woff"
    );
    const fontData = await fs.readFile(fontPath);

    // Fetch Game Data
    const data = await fetchGameData();

    // --- TEAM MODE ---
    if (teamHash) {
      return renderTeamImage(
        teamHash,
        data,
        fontData as unknown as ArrayBuffer,
        origin
      );
    }

    // --- ENTITY MODE ---
    const targetEntityId = spellcasterId || unitId || itemId || genericId;
    if (targetEntityId) {
      return renderEntityImage(
        targetEntityId,
        data,
        fontData as unknown as ArrayBuffer
      );
    }

    // --- DECK MODE ---
    if (!deckHash) {
      return new Response("Missing deck, team, or entity parameter", {
        status: 400,
      });
    }

    return renderDeckImage(
      deckHash,
      data,
      fontData as unknown as ArrayBuffer,
      origin
    );
  } catch (e: unknown) {
    monitoring.captureException(e, { operation: "ogGeneration" });

    return new Response("Internal Server Error", { status: 500 });
  }
}
