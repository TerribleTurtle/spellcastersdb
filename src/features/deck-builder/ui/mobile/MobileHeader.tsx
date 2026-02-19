"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Share2, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Mode } from "@/types/api";
import { LibraryButton } from "@/components/ui/LibraryButton";

interface MobileHeaderProps {
  mode: Mode;
  onSetMode: (mode: Mode) => void;
  onShare: () => void;
  onClear: () => void;
  onOpenLibrary: () => void;
}

export function MobileHeader({ mode, onSetMode, onShare, onClear, onOpenLibrary }: MobileHeaderProps) {

  return (
    <header data-testid="mobile-header" className="h-14 flex items-center justify-between px-4 bg-surface-main/95 backdrop-blur-sm border-b border-border-default shrink-0 sticky top-0 z-50">
      {/* Left: Library */}
      <LibraryButton
          onClick={onOpenLibrary}
          className="-ml-1"
      />

      {/* Center: Mode Switcher */}
      <div className="flex bg-surface-dim p-1 rounded-lg border border-border-subtle">
        <button
          onClick={() => onSetMode("SOLO")}
          className={cn(
            "px-4 py-1.5 text-xs font-bold uppercase rounded transition-all",
            mode === "SOLO" 
              ? "bg-brand-primary text-brand-dark shadow-sm" 
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          Solo
        </button>
        <button
          onClick={() => onSetMode("TEAM")}
          className={cn(
            "px-4 py-1.5 text-xs font-bold uppercase rounded transition-all",
            mode === "TEAM" 
              ? "bg-brand-primary text-brand-dark shadow-sm" 
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          Team
        </button>
      </div>

      {/* Right: Actions (Share, New) */}
      <div className="flex items-center gap-1">
        <Button
           variant="ghost"
           size="icon"
           onClick={onShare}
           className="text-text-muted hover:text-text-primary rounded-full hover:bg-surface-hover"
           title="Share"
           aria-label="Share deck"
        >
            <Share2 size={20} />
        </Button>
        <Button
           variant="ghost"
           size="icon"
           onClick={onClear}
           className="-mr-1 text-text-muted hover:text-text-primary rounded-full hover:bg-surface-hover"
           title="New Deck"
           aria-label="Create a new deck"
        >
            <PlusCircle size={20} />
        </Button>
      </div>
    </header>
  );
}
