import { useState } from "react";

import { CheckCircle2, Link as LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useEphemeralState } from "@/hooks/useEphemeralState";
import { useToast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import { useDeckStore } from "@/store/index";
import { Deck } from "@/types/deck";

import { TeamActionButtons } from "./TeamActionButtons";
import { TeamDeckRow } from "./TeamDeckRow";

interface TeamOverviewProps {
  decks: [Deck, Deck, Deck];
  onEditDeck: (index: number) => void;
  onBack?: () => void;
  isReadOnly?: boolean;
  onSave?: () => void;
  existingId?: string | null;
  teamName?: string | null;
}

export function TeamOverview({
  decks,
  onEditDeck,
  onBack,
  isReadOnly,
  onSave,

  existingId,
  teamName,
}: TeamOverviewProps) {
  const openInspector = useDeckStore((state) => state.openInspector);
  const closeInspector = useDeckStore((state) => state.closeInspector);

  /* SHARE LOGIC */
  const { isActive: copied, trigger: triggerCopied } = useEphemeralState(2000);
  const { showToast } = useToast();

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Dynamic import to avoid circular dep issues
      const { createShortLink } =
        await import("@/services/sharing/create-short-link");

      const { url, isShortLink, rateLimited } = await createShortLink({
        teamDecks: decks,
        teamName: teamName || "Untitled Team",
        isTeamMode: true,
      });

      const success = await copyToClipboard(url);
      if (success) {
        triggerCopied();
        if (rateLimited) {
          showToast("Rate limit exceeded. Copied long URL instead.", "error");
        } else if (isShortLink) {
          showToast("Short link copied!", "success");
        } else {
          showToast("Copied long link (short link unavailable)", "error");
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="h-auto w-full flex flex-col bg-surface-main rounded-xl relative">
      {/* TeamHeader removed - Unified into Global Navbar */}
      {/* UPDATE: Added Back for Mobile Context in Overlay */}

      <div className="shrink-0 p-4 pb-2 text-center border-b border-border-subtle relative">
        <h2 className="text-xl md:text-3xl font-black text-text-primary uppercase tracking-wider line-clamp-2 max-w-xs md:max-w-xl mx-auto">
          {teamName || "Untitled Team"}
        </h2>

        {/* Share Button - Absolute Right */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 right-4 z-20 rounded-full transition-all shadow-lg",
            copied
              ? "bg-status-success text-brand-dark border-status-success-border hover:bg-status-success/90"
              : "bg-surface-card border-border-default hover:bg-brand-primary hover:border-brand-primary"
          )}
          title="Share Team"
        >
          {isSharing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : copied ? (
            <CheckCircle2 size={16} />
          ) : (
            <LinkIcon size={16} />
          )}
        </Button>
      </div>

      {/* Main Content - Scrollable List of Horizontal Decks */}
      <div className="overflow-y-auto p-2 md:p-4 space-y-2 bg-surface-dim shrink-0">
        <div className="max-w-5xl mx-auto w-full space-y-2">
          {decks.map((deck, index) => (
            <TeamDeckRow
              key={index}
              index={index}
              deck={deck}
              onEdit={() => onEditDeck(index)}
              isReadOnly={isReadOnly}
              onInspect={(item, pos) =>
                openInspector(item, pos, { isReadOnly: true })
              }
              onStopInspect={closeInspector}
            />
          ))}
        </div>
      </div>

      <TeamActionButtons
        onBack={onBack}
        isReadOnly={isReadOnly}
        onSave={onSave}
        existingId={existingId}
        onEditDeck={onEditDeck}
      />
    </div>
  );
}
