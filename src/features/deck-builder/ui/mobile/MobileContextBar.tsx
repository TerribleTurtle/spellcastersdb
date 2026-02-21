"use client";

import React from "react";

import {
  Check,
  ChevronUp,
  ChevronsDown,
  Copy,
  MoreVertical,
  PlusCircle,
  Save,
  Share2,
} from "lucide-react";

import { LibraryButton } from "@/components/ui/LibraryButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Mode } from "@/types/api";

interface MobileContextBarProps {
  deckName: string;
  onRename: (name: string) => void;
  isSaved: boolean;
  isExistingDeck: boolean;
  onSave: () => void;
  onSaveCopy?: () => void;
  isEmptyDeck: boolean;

  // Mode props (merged from MobileHeader)
  mode: Mode;
  onSetMode: (mode: Mode) => void;
  onOpenLibrary: () => void;
  onShare: () => void;
  onClear: () => void;

  // Collapse props (optional, for Team mode)
  canCollapse?: boolean;
  areAllCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function MobileContextBar({
  deckName,
  onRename,
  isSaved,
  isExistingDeck,
  onSave,
  onSaveCopy,
  isEmptyDeck,
  mode,
  onSetMode,
  onOpenLibrary,
  onShare,
  onClear,
  canCollapse,
  areAllCollapsed,
  onToggleCollapse,
}: MobileContextBarProps) {
  return (
    <div
      data-testid="mobile-context-bar"
      className="h-12 px-2 flex items-center gap-2 border-b border-border-default bg-surface-main shrink-0"
    >
      {/* Library Button */}
      <LibraryButton onClick={onOpenLibrary} className="shrink-0 p-1.5!" />

      {/* Mode Toggle — single button, tap to cycle */}
      <button
        onClick={() => onSetMode(mode === "SOLO" ? "TEAM" : "SOLO")}
        className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-surface-hover text-text-secondary border border-border-subtle shadow-sm shrink-0 hover:text-text-primary hover:border-border-default transition-colors"
        title={`Switch to ${mode === "SOLO" ? "Team" : "Solo"}`}
        aria-label={`Current mode: ${mode}. Tap to switch.`}
      >
        {mode}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m7 15 5 5 5-5" />
          <path d="m7 9 5-5 5 5" />
        </svg>
      </button>

      {/* Deck Name Input — fills remaining space, faint underline */}
      <div className="relative group flex-1 min-w-0 ml-1">
        <input
          value={deckName || ""}
          onChange={(e) => onRename(e.target.value)}
          className="w-full bg-transparent text-sm font-black text-text-primary uppercase tracking-wider focus:outline-none placeholder:text-text-muted truncate border-b border-border-subtle focus:border-brand-primary transition-colors pb-0.5"
          placeholder="UNTITLED"
          aria-label="Deck Name"
        />
      </div>

      {/* Save Button */}
      <Button
        onClick={onSave}
        disabled={isEmptyDeck && !isSaved}
        variant="ghost"
        size="icon"
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full border transition-all shrink-0",
          isEmptyDeck && !isSaved
            ? "opacity-50 cursor-not-allowed bg-surface-raised border-border-subtle text-text-dimmed"
            : isSaved
              ? "bg-status-success-muted text-status-success-text border-status-success-border"
              : "bg-brand-primary/10 text-brand-primary border-brand-primary/50"
        )}
        aria-label={isSaved ? "Deck Saved" : "Save Deck"}
        title={isSaved ? "Saved" : "Save"}
      >
        {isSaved ? <Check size={14} /> : <Save size={14} />}
      </Button>

      {/* More Menu */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-text-muted hover:text-text-primary shrink-0"
            aria-label="More actions"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuItem onSelect={onShare}>
            <Share2 size={14} className="mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onClear}>
            <PlusCircle size={14} className="mr-2" />
            New {mode === "TEAM" ? "Team" : "Deck"}
          </DropdownMenuItem>
          {isExistingDeck && onSaveCopy && (
            <DropdownMenuItem onSelect={onSaveCopy}>
              <Copy size={14} className="mr-2" />
              Save Copy
            </DropdownMenuItem>
          )}
          {canCollapse && onToggleCollapse && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onToggleCollapse();
                }}
              >
                {areAllCollapsed ? (
                  <ChevronsDown size={14} className="mr-2" />
                ) : (
                  <ChevronUp size={14} className="mr-2" />
                )}
                {areAllCollapsed ? "Expand All" : "Collapse All"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
