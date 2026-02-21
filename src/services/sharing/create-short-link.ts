import { DataFetchError, fetchJson } from "@/services/api/api-client";
import { monitoring } from "@/services/monitoring";
import { encodeDeck, encodeTeam } from "@/services/utils/encoding";
import { Deck } from "@/types/deck";

interface ShareOptions {
  deck?: Deck;
  teamDecks?: Deck[];
  teamName?: string;
  isTeamMode?: boolean;
  activeSlot?: number | null;
}

/**
 * Single source of truth for generating share links.
 * 1. Encodes the payload locally.
 * 2. Attempts to exchange it for a short link via /api/share.
 * 3. Falls back to the long URL if the API is unreachable, rate limited, or fails.
 */
export interface ShareResult {
  url: string;
  isShortLink: boolean;
  rateLimited: boolean;
}

export async function createShortLink({
  deck,
  isTeamMode,
  teamDecks,
  teamName,
  activeSlot,
}: ShareOptions): Promise<ShareResult> {
  const origin = window.location.origin;
  const path = window.location.pathname;

  let hash = "";
  let shareType: "deck" | "team" = "deck";
  let fallbackUrl = "";

  // 1. Generate local hash and long fallback URL
  if (!isTeamMode && deck) {
    hash = encodeDeck(deck);
    shareType = "deck";
    fallbackUrl = `${origin}${path}?d=${hash}`;
  } else if (isTeamMode && teamDecks) {
    const currentTeamDecks = [...teamDecks] as [Deck, Deck, Deck];
    // Splice in the active deck changes if any
    if (
      deck &&
      typeof activeSlot === "number" &&
      activeSlot >= 0 &&
      activeSlot < 3
    ) {
      currentTeamDecks[activeSlot] = deck;
    }

    hash = encodeTeam(currentTeamDecks, teamName || "Untitled Team");
    shareType = "team";
    fallbackUrl = `${origin}${path}?team=${hash}`;
  } else {
    monitoring.captureMessage(
      "createShortLink: Invalid options provided, returning current URL",
      "warning"
    );
    return {
      url: window.location.href,
      isShortLink: false,
      rateLimited: false,
    };
  }

  // 2. Try to generate a short link
  try {
    const data = await fetchJson<{ id?: string }>("/api/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hash,
        type: shareType,
        path,
      }),
    });

    if (data.id) {
      // Success! Return the short link.
      return {
        url: `${origin}/s/${data.id}`,
        isShortLink: true,
        rateLimited: false,
      };
    }

    throw new Error("No ID returned from /api/share");
  } catch (error) {
    if (error instanceof DataFetchError) {
      if (error.status === 429) {
        return { url: fallbackUrl, isShortLink: false, rateLimited: true };
      }

      monitoring.captureMessage(
        "Short link generation failed, falling back to long URL",
        "warning",
        {
          status: error.status,
          error: error.cause,
        }
      );
      return { url: fallbackUrl, isShortLink: false, rateLimited: false };
    }

    monitoring.captureException(error, {
      message: "Exception calling /api/share, falling back to long URL",
      context: "createShortLink",
    });
    return { url: fallbackUrl, isShortLink: false, rateLimited: false };
  }
}
