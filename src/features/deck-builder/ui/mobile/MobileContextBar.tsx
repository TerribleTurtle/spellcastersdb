"use client";

import React from "react";
import { Edit2, Save, Check, Copy, ChevronUp, ChevronsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileContextBarProps {
  deckName: string;
  onRename: (name: string) => void;
  isSaved: boolean;
  isExistingDeck: boolean;
  onSave: () => void;
  onSaveCopy?: () => void;
  isEmptyDeck: boolean;
  
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
  canCollapse,
  areAllCollapsed,
  onToggleCollapse
}: MobileContextBarProps) {
  return (
    <div data-testid="mobile-context-bar" className="h-14 px-4 flex items-center justify-between border-b border-border-default bg-surface-main shrink-0">
        {/* Deck Name Input - Prominent */}
        <div className="relative group flex-1 mr-4">
               <input 
                  value={deckName || ""}
                  onChange={(e) => onRename(e.target.value)}
                  className="w-full bg-transparent text-lg font-black text-text-primary uppercase tracking-wider focus:outline-none placeholder:text-text-muted truncate"
                  placeholder="UNTITLED DECK"
                  aria-label="Deck Name"
               />
               <Edit2 size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>

        {/* Save Actions */}
        <div className="flex items-center gap-2">
            {/* Main Save */}
            <Button
                  onClick={onSave}
                  disabled={isEmptyDeck && !isSaved}
                  variant="ghost"
                  size="icon"
                  className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full border transition-all",
                      isEmptyDeck && !isSaved
                        ? "opacity-50 cursor-not-allowed bg-surface-raised border-border-subtle text-text-dimmed"
                        : isSaved 
                            ? "bg-status-success-muted text-status-success-text border-green-500/50 hover:bg-status-success-border hover:text-green-300"
                            : "bg-brand-primary/10 text-brand-primary border-brand-primary/50 hover:bg-brand-primary/20 hover:text-brand-accent"
                  )}
                  aria-label={isSaved ? "Deck Saved" : "Save Deck"}
                  title={isSaved ? "Saved" : "Save Deck"}
            >
                   {isSaved ? <Check size={18} /> : <Save size={18} />}
            </Button>
            
            {/* Save Copy (if existing) */}
            {isExistingDeck && onSaveCopy && (
                <Button
                    onClick={onSaveCopy}
                    variant="ghost"
                    size="icon"
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-border-default bg-surface-card text-text-muted hover:text-text-primary transition-all hover:bg-surface-hover"
                    aria-label="Save Copy"
                    title="Save Copy"
                >
                    <Copy size={18} />
                </Button>
            )}

            {/* Collapse/Expand (Team Mode) */}
            {canCollapse && onToggleCollapse && (
                 <Button
                    onClick={onToggleCollapse}
                    variant="ghost"
                    size="icon"
                    className="flex items-center justify-center w-9 h-9 text-text-muted hover:text-text-primary transition-colors ml-1 hover:bg-surface-card"
                    title={areAllCollapsed ? "Expand All" : "Collapse All"}
                    aria-label={areAllCollapsed ? "Expand All" : "Collapse All"}
                >
                    {areAllCollapsed ? <ChevronsDown size={20} /> : <ChevronUp size={20} />}
                </Button>
            )}
        </div>
    </div>
  );
}
