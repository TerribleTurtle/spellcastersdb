"use client";

import { useState } from "react";

import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useEphemeralState } from "@/hooks/useEphemeralState";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import { useDeckStore } from "@/store/index";

export function TeamShareButton() {
  const { teamDecks, teamName, mode } = useDeckStore();
  const { isActive: copied, trigger: triggerCopied } = useEphemeralState(2000);

  const [isSharing, setIsSharing] = useState(false);

  if (mode !== "TEAM") return null;

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const { createShortLink } =
        await import("@/services/sharing/create-short-link");
      const { url } = await createShortLink({
        teamDecks,
        teamName,
        isTeamMode: true,
      });

      const success = await copyToClipboard(url);
      if (success) {
        triggerCopied();
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleShare}
      className={cn(
        "p-2 rounded-full transition-colors flex items-center gap-2 h-auto",
        copied
          ? "bg-status-success-muted text-status-success-text hover:bg-status-success-border"
          : "text-text-muted hover:bg-surface-card hover:text-brand-accent"
      )}
      title="Share Team Link"
    >
      {isSharing ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
      ) : copied ? (
        <Check size={20} />
      ) : (
        <Share2 size={20} />
      )}
      <span className="text-xs font-bold uppercase tracking-wider hidden lg:block">
        {copied ? "Copied" : "Share"}
      </span>
    </Button>
  );
}
