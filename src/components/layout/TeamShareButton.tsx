"use client";


import { Check, Share2 } from "lucide-react";
import { useDeckStore } from "@/store/index";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

import { useEphemeralState } from "@/hooks/useEphemeralState";

export function TeamShareButton() {
    const { teamDecks, teamName, mode } = useDeckStore();
    const { isActive: copied, trigger: triggerCopied } = useEphemeralState(2000);

    if (mode !== "TEAM") return null;

    const handleShare = async () => {
        const { encodeTeam } = await import("@/services/utils/encoding");
        const hash = encodeTeam(teamDecks, teamName);
        const url = `${window.location.origin}${window.location.pathname}?team=${hash}`;

        const success = await copyToClipboard(url);
        if (success) {
            triggerCopied();
        }
    };

    return (
        <button
            onClick={handleShare}
            className={cn(
                "p-2 rounded-full transition-colors flex items-center gap-2",
                copied 
                    ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-brand-accent"
            )}
            title="Share Team Link"
        >
            {copied ? <Check size={20} /> : <Share2 size={20} />}
            <span className="text-xs font-bold uppercase tracking-wider hidden lg:block">
                {copied ? "Copied" : "Share"}
            </span>
        </button>
    );
}
