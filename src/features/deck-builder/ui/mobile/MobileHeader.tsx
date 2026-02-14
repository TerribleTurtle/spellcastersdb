"use client";

import React from "react";
import { Share2, PlusCircle, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { Mode } from "@/types/api";

interface MobileHeaderProps {
  mode: Mode;
  onSetMode: (mode: Mode) => void;
  onShare: () => void;
  onClear: () => void;
  onOpenLibrary: () => void;
}

export function MobileHeader({ mode, onSetMode, onShare, onClear, onOpenLibrary }: MobileHeaderProps) {

  return (
    <header data-testid="mobile-header" className="h-14 flex items-center justify-between px-4 bg-surface-main/95 backdrop-blur-sm border-b border-white/10 shrink-0 sticky top-0 z-50">
      {/* Left: Library */}
      <button
          onClick={onOpenLibrary}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary border border-brand-primary hover:bg-brand-primary/90 text-white transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-primary/20 -ml-1"
          title="Open Library"
      >
          <Library size={14} />
          <span>Library</span>
      </button>

      {/* Center: Mode Switcher */}
      <div className="flex bg-black/30 p-1 rounded-lg border border-white/5">
        <button
          onClick={() => onSetMode("SOLO")}
          className={cn(
            "px-4 py-1.5 text-xs font-bold uppercase rounded transition-all",
            mode === "SOLO" 
              ? "bg-brand-primary text-white shadow-sm" 
              : "text-gray-500 hover:text-gray-300"
          )}
        >
          Solo
        </button>
        <button
          onClick={() => onSetMode("TEAM")}
          className={cn(
            "px-4 py-1.5 text-xs font-bold uppercase rounded transition-all",
            mode === "TEAM" 
              ? "bg-brand-primary text-white shadow-sm" 
              : "text-gray-500 hover:text-gray-300"
          )}
        >
          Team
        </button>
      </div>

      {/* Right: Actions (Share, New) */}
      <div className="flex items-center gap-1">
        <button
           onClick={onShare}
           className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
           title="Share"
        >
            <Share2 size={20} />
        </button>
        <button
           onClick={onClear}
           className="p-2 -mr-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
           title="New Deck"
        >
            <PlusCircle size={20} />
        </button>
      </div>
    </header>
  );
}
