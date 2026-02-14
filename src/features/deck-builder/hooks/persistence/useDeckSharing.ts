import { useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import { encodeDeck, encodeTeam } from "@/services/utils/encoding";
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
  activeSlot
}: UseDeckSharingProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    let url = window.location.href; 

    if (!isTeamMode) {
      // Solo Mode
      const hash = encodeDeck(deck);
      url = `${window.location.origin}${window.location.pathname}?d=${hash}`;
    } else if (teamDecks) {
      // Team Mode
      const currentTeamDecks = [...teamDecks] as [Deck, Deck, Deck];
      if (typeof activeSlot === 'number' && activeSlot >= 0 && activeSlot < 3) {
          currentTeamDecks[activeSlot] = deck;
      }

      const hash = encodeTeam(
        currentTeamDecks,
        teamName || "Untitled Team"
      );
      url = `${window.location.origin}${window.location.pathname}?team=${hash}`;
    }

    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      console.error("Failed to copy URL");
      alert("Failed to copy URL. Please copy manually from address bar.");
    }
  };

  return {
    handleShare,
    copied
  };
}
