"use client";

import { useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/clipboard";
import { Deck } from "@/types/deck";

interface TeamHeaderProps {
  teamName: string;
  decks: [Deck, Deck, Deck];
}

export function TeamHeader({ teamName, decks }: TeamHeaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-surface-main z-10 gap-2 shrink-0 border-b border-white/5 w-full relative">
      <div className="flex flex-col items-center gap-0.5 group text-center">
        <h1 className="text-lg md:text-2xl font-black text-white uppercase tracking-wider truncate max-w-3xl">
          {teamName || "Untitled Team"}
        </h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
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

  const handleShare = async () => {
    // Dynamically generate the URL with the team hash
    const { encodeTeam } = await import("@/services/encoding");
    const hash = encodeTeam(decks, teamName);
    const url = `${window.location.origin}${window.location.pathname}?team=${hash}`;

    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider mt-2",
        copied
          ? "bg-green-500/20 border-green-500/50 text-green-400"
          : "bg-surface-card border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
      )}
    >
      {copied ? <Check size={14} /> : <LinkIcon size={14} />}
      {copied ? "Link Copied" : "Share Team"}
    </button>
  );
}
