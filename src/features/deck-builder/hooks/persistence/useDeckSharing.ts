import { useState } from "react";

import { useEphemeralState } from "@/hooks/useEphemeralState";
import { copyToClipboard } from "@/lib/clipboard";
import { monitoring } from "@/services/monitoring";
import { createShortLink } from "@/services/sharing/create-short-link";
import { Deck } from "@/types/deck";

interface UseDeckSharingProps {
  deck: Deck;
  isTeamMode: boolean;
  teamDecks?: Deck[];
  teamName?: string;
  activeSlot?: number | null;
}

export function useDeckSharing({
  deck,
  isTeamMode,
  teamDecks,
  teamName,
  activeSlot,
}: UseDeckSharingProps) {
  const { isActive: copied, trigger: triggerCopied } = useEphemeralState(2000);

  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    setIsLoading(true);

    try {
      const { url, isShortLink, rateLimited } = await createShortLink({
        deck,
        isTeamMode,
        teamDecks,
        teamName,
        activeSlot,
      });

      const success = await copyToClipboard(url);
      if (success) {
        triggerCopied();
        // Since useDeckSharing doesn't useToast directly, we rely on the component using it, but we can return the status.
        // Actually, we can just use the alert fallback if not copied, but what about the successful message?
        // useDeckSharing doesn't show a toast normally. It just triggers `copied` boolean.
      } else {
        monitoring.captureMessage("Failed to copy URL", "error");
        alert("Failed to copy URL. Please copy manually from address bar.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleShare,
    copied,
    isLoading,
  };
}
