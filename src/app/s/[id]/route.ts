import { NextResponse } from "next/server";

import { getSpellcasterById } from "@/services/api/api";
import { redis } from "@/services/infrastructure/redis";
import { monitoring } from "@/services/monitoring";
import { decodeDeck, decodeTeam } from "@/services/utils/encoding";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.spellcastersdb.com";

/**
 * Escapes a string for safe embedding in HTML attributes.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Builds a minimal HTML page with OG meta tags and a meta-refresh redirect.
 * Social crawlers (Discord, Twitter, iMessage) see the OG tags.
 * Human browsers are instantly redirected via meta-refresh + JS.
 */
function buildOgHtml(meta: {
  title: string;
  description: string;
  ogImageUrl: string;
  redirectUrl: string;
}): string {
  const t = escapeHtml(meta.title);
  const d = escapeHtml(meta.description);
  const img = escapeHtml(meta.ogImageUrl);
  const redirect = escapeHtml(meta.redirectUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${t}</title>
  <meta name="description" content="${d}"/>
  <meta property="og:title" content="${t}"/>
  <meta property="og:description" content="${d}"/>
  <meta property="og:image" content="${img}"/>
  <meta property="og:image:width" content="1600"/>
  <meta property="og:image:height" content="840"/>
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${redirect}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${t}"/>
  <meta name="twitter:description" content="${d}"/>
  <meta name="twitter:image" content="${img}"/>
  <meta http-equiv="refresh" content="0; url=${redirect}"/>
</head>
<body>
  <p>Redirecting&hellip;</p>
  <script>window.location.replace("${meta.redirectUrl.replace(/"/g, '\\"')}");</script>
</body>
</html>`;
}

/**
 * Resolves a short link ID into a redirect page with embedded OG metadata.
 *
 * Returns a 200 OK HTML page with <meta> OG tags for social crawlers,
 * plus a <meta http-equiv="refresh"> and inline JS to redirect humans.
 * Error cases fall back to a standard 307 redirect (crawlers don't need OG for errors).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!redis) {
      return NextResponse.redirect(
        new URL("/deck-builder?error=redis-offline", request.url)
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || typeof id !== "string") {
      return NextResponse.redirect(
        new URL("/deck-builder?error=invalid-link", request.url)
      );
    }

    const dataString = await redis.get<string>(`share:${id}`);

    if (!dataString) {
      return NextResponse.redirect(
        new URL("/deck-builder?error=link-expired", request.url)
      );
    }

    let data;
    try {
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

    // Build the redirect target URL
    const targetUrl = new URL(redirectPath, SITE_URL);
    if (type === "team") {
      targetUrl.searchParams.set("team", hash);
    } else {
      targetUrl.searchParams.set("d", hash);
    }

    // Build OG metadata
    let title = "Shared Deck - SpellcastersDB";
    let description = "Check out this build for Spellcasters Chronicles.";
    let ogImageUrl = `${SITE_URL}/og-default.png`;

    if (type === "team") {
      const { name } = decodeTeam(hash);
      title = `${name || "Team Trinity"} - SpellcastersDB`;
      description = "Check out this team build for Spellcasters Chronicles.";
      ogImageUrl = `${SITE_URL}/api/og?team=${encodeURIComponent(hash)}`;
    } else {
      const decoded = decodeDeck(hash);
      let deckName = decoded?.name;

      if (decoded?.spellcasterId) {
        try {
          const spellcaster = await getSpellcasterById(decoded.spellcasterId);
          if (spellcaster) {
            if (!deckName) deckName = `${spellcaster.name} Deck`;
            description = `Check out this ${spellcaster.name} build for Spellcasters Chronicles.`;
          }
        } catch {
          // Spellcaster lookup is best-effort for metadata
        }
      }

      if (!deckName) deckName = "Custom Deck";
      title = `${deckName} - SpellcastersDB`;
      ogImageUrl = `${SITE_URL}/api/og?d=${encodeURIComponent(hash)}`;
    }

    const html = buildOgHtml({
      title,
      description,
      ogImageUrl,
      redirectUrl: targetUrl.toString(),
    });

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
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
