"use client";

import React, { useState } from "react";

import { AlertCircle, CheckCircle2 } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActiveDeckTray } from "@/features/shared/deck/ui/ActiveDeckTray";
import { cn } from "@/lib/utils";
import { Spellcaster, UnifiedEntity } from "@/types/api";
import { DeckSlot } from "@/types/deck";

interface MobileDeckDockProps {
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  spellcaster: Spellcaster | null;
  validation?: {
    isValid: boolean;
    errors: string[];
  };
  onSelect: (
    item: UnifiedEntity | undefined,
    pos: { x: number; y: number } | undefined,
    slotIndex?: number
  ) => void;
  deckId?: string;
  deckName?: string;
  isSwapMode?: boolean;
}

export function MobileDeckDock({
  slots,
  spellcaster,
  validation,
  onSelect,
  deckId,
  deckName,
  isSwapMode,
}: MobileDeckDockProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  return (
    <div
      data-testid="mobile-deck-dock"
      className="fixed bottom-0 left-0 right-0 bg-surface-deck border-t border-brand-primary/20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-40 pb-[env(safe-area-inset-bottom)]"
    >
      {/* Active Header for Mobile */}
      <div className="h-8 xl:hidden w-full bg-surface-card border-b border-border-subtle flex items-center justify-between px-3 md:px-4 shrink-0 transition-colors pointer-events-auto select-none relative z-40">
        <div className="flex items-center gap-2 max-w-[80%]">
          {validation && (
            <TooltipProvider delayDuration={0}>
              <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center justify-center shrink-0 transition-all rounded-full p-0.5",
                      validation.isValid
                        ? "text-status-success"
                        : "text-status-danger"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTooltipOpen(!isTooltipOpen);
                    }}
                  >
                    {validation.isValid ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className={cn(
                    "font-medium shadow-md border",
                    validation.isValid
                      ? "bg-popover text-status-success-text border-status-success-border"
                      : "bg-popover text-status-danger-text border-status-danger-border"
                  )}
                >
                  {validation.isValid ? (
                    "Deck Valid"
                  ) : (
                    <div className="flex flex-col gap-1 text-left">
                      {validation.errors.map((err, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="shrink-0 leading-tight pt-0.5">
                            •
                          </span>
                          <span className="leading-tight">{err}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <span className="text-sm font-bold uppercase tracking-wider truncate text-text-primary">
            {deckName || "Untitled"}
          </span>
        </div>

        {/* Decorative Handle */}
        <div className="w-12 h-1 rounded-full bg-surface-hover/50 absolute left-1/2 -translate-x-1/2" />
      </div>
      <div className="relative">
        <ActiveDeckTray
          slots={slots}
          spellcaster={spellcaster}
          validation={validation}
          onSelect={onSelect}
          deckId={deckId}
          isSwapMode={isSwapMode}
          idSuffix="mobile-dock"
          prioritySpellcaster={true}
        />

        {/* Gradient fade to show it continues */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent opacity-50" />
      </div>
    </div>
  );
}
