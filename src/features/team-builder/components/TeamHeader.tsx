"use client";

import { useState } from "react";

import { Check, Link as LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import { Deck } from "@/types/deck";

interface TeamHeaderProps {
  teamName: string;
  decks: [Deck, Deck, Deck];
}

export function TeamHeader({ teamName, decks }: TeamHeaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-surface-main z-10 gap-2 shrink-0 border-b border-border-subtle w-full relative">
      <div className="flex flex-col items-center gap-0.5 group text-center">
        <h1 className="text-lg md:text-2xl font-black text-text-primary uppercase tracking-wider truncate max-w-3xl">
          {teamName || "Untitled Team"}
        </h1>
        <p className="text-text-dimmed text-[10px] font-bold uppercase tracking-widest">
          Spellcasters Trinity
        </p>
      </div>

      <ShareTeamButton decks={decks} teamName={teamName} />
    </div>
  );
}

function ShareTeamButton({
  decks,
  teamName,
}: {
  decks: [Deck, Deck, Deck];
  teamName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const { createShortLink } =
        await import("@/services/sharing/create-short-link");
      const { url } = await createShortLink({
        teamDecks: decks,
        teamName,
        isTeamMode: true,
      });

      const success = await copyToClipboard(url);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider mt-2",
        copied
          ? "bg-status-success-border text-status-success-text hover:bg-status-success-border/90"
          : "bg-surface-card border-border-default text-text-secondary hover:bg-surface-hover hover:text-text-primary"
      )}
    >
      {isSharing ? (
        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current" />
      ) : copied ? (
        <Check size={14} />
      ) : (
        <LinkIcon size={14} />
      )}
      {copied ? "Link Copied" : "Share Team"}
    </Button>
  );
}
