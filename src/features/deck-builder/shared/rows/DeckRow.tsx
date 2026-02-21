"use client";

import { useEffect, useRef, useState } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  GripVertical,
} from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { Button } from "@/components/ui/button";
import { ItemMenu } from "@/features/shared/deck/ui/ItemMenu";
import { useToast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { validateDeck } from "@/services/validation/deck-validation";
import { Deck } from "@/types/deck";

interface DeckRowProps {
  deck: Deck;
  isActive?: boolean;
  isTeamMode?: boolean;
  onLoad?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onRename?: (newName: string) => void;
  onPutAway?: () => void;
  className?: string;
  showStats?: boolean;
  // Selection Props
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function DeckRow({
  deck,
  isActive = false,
  isTeamMode = false,
  onLoad,
  onDelete,
  onDuplicate,
  onRename,
  onPutAway,
  className,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}: DeckRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(deck.name || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleRename = () => {
    if (onRename && editName.trim() !== "") {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditName(deck.name || "");
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    // setActivatorNodeRef, // Removed for full row drag
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deck.id || "temp-deck-id" });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const { isValid, errors } = validateDeck(deck);
  const { showToast } = useToast();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex items-center p-1.5 rounded cursor-grab active:cursor-grabbing touch-manipulation select-none border transition-all relative overflow-visible",
        isActive
          ? "bg-brand-primary/10 border-brand-primary/50"
          : "bg-surface-card border-border-subtle hover:border-border-strong hover:bg-surface-card",
        isDragging &&
          "scale-105 shadow-xl shadow-brand-primary/20 z-50 border-brand-primary cursor-grabbing",
        selectionMode &&
          isSelected &&
          "bg-brand-primary/20 border-brand-primary",
        className
      )}
      onClick={selectionMode ? onToggleSelect : undefined}
    >
      <div
        className="p-1 text-text-faint hover:text-text-muted -ml-1 mr-1 transition-colors cursor-grab active:cursor-grabbing touch-none outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
        role="button"
        tabIndex={0}
        aria-label="Drag to reorder deck"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            // Logic for keyboard reordering would go here,
            // for now just prevent default to avoid confusion
            e.preventDefault();
          }
        }}
      >
        {selectionMode ? (
          <div
            className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
              isSelected
                ? "bg-brand-primary border-brand-primary text-black"
                : "border-border-strong group-hover:border-border-subtle0"
            )}
            role="checkbox"
            aria-checked={isSelected}
            aria-label="Select deck"
          >
            {isSelected && <Check size={10} strokeWidth={4} />}
          </div>
        ) : (
          <GripVertical size={14} />
        )}
      </div>

      {/* Content Container - Grid for better layout */}
      <div className="flex-1 grid grid-rows-[auto_1fr] gap-1 min-w-0">
        {/* Top Row: Name + Menu */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              "font-bold truncate text-sm",
              isActive ? "text-brand-primary" : "text-text-secondary"
            )}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-inset border border-brand-primary/50 rounded px-1 min-w-0 text-sm font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            ) : (
              <div
                className={cn(
                  "font-bold truncate text-sm flex items-center gap-2",
                  isActive ? "text-brand-primary" : "text-text-secondary"
                )}
                title={deck.name}
              >
                <span className="truncate">{deck.name}</span>
                {isActive && (
                  <span className="text-[10px] uppercase font-bold bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded border border-brand-primary/30">
                    Active
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Avatar + Units + Actions */}
        <div className="flex items-center gap-2">
          {/* Avatar with Badge */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-border-strong bg-black shadow-sm">
              {deck.spellcaster ? (
                <GameImage
                  src={getCardImageUrl(deck.spellcaster)}
                  alt={deck.spellcaster.name}
                  fill
                  className="object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-faint font-bold text-xs">
                  ?
                </div>
              )}
            </div>
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-surface-card flex items-center justify-center",
                isValid
                  ? "bg-status-success text-brand-dark"
                  : "bg-status-danger text-text-primary"
              )}
              title={isValid ? "Valid Deck" : errors[0]}
            >
              {isValid ? (
                <Check size={6} strokeWidth={4} />
              ) : (
                <AlertCircle size={6} strokeWidth={4} />
              )}
            </div>
          </div>

          {/* Units Preview */}
          <div
            className={cn(
              "items-center gap-1",
              isTeamMode ? "hidden md:flex" : "flex"
            )}
          >
            {deck.slots.slice(0, 4).map((s, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-md bg-surface-inset border border-border-default overflow-hidden shrink-0 relative"
              >
                {s.unit && (
                  <GameImage
                    src={getCardImageUrl(s.unit)}
                    alt={s.unit.name}
                    fill
                    className="object-cover opacity-80"
                    draggable={false}
                  />
                )}
              </div>
            ))}
            {/* Titan */}
            <div className="w-9 h-9 rounded-md bg-brand-accent/10 border border-brand-accent/30 overflow-hidden shrink-0 relative">
              {deck.slots[4].unit && (
                <GameImage
                  src={getCardImageUrl(deck.slots[4].unit)}
                  alt={deck.slots[4].unit.name}
                  fill
                  className="object-cover opacity-80"
                  draggable={false}
                />
              )}
            </div>
          </div>

          <div className="grow" />

          {/* Actions - Hide in selection mode */}
          {!selectionMode && (
            <div className="flex items-center gap-2 shrink-0 relative z-10">
              {/* Load/Import Button - Now for BOTH modes */}
              {isActive && onPutAway ? (
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm transition-colors text-xs font-bold uppercase tracking-wider h-8",
                    "bg-transparent border-border-strong text-text-muted hover:text-text-primary hover:border-text-primary hover:bg-surface-card"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPutAway();
                  }}
                  title="Put Away Deck"
                  aria-label="Put Away Deck"
                >
                  <ArrowLeft size={14} />
                  <span className="hidden sm:inline">Put Away</span>
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm transition-colors text-xs font-bold uppercase tracking-wider h-8",
                    "bg-brand-primary text-brand-dark hover:bg-brand-primary/80 border-0"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoad?.();
                  }}
                  title={isTeamMode ? "Import Deck to Slot" : "Load Deck"}
                  aria-label={isTeamMode ? "Import Deck to Slot" : "Load Deck"}
                >
                  <ArrowRight size={14} />
                  <span className="hidden sm:inline">
                    {isTeamMode ? "Import" : "Load"}
                  </span>
                </Button>
              )}

              <ItemMenu
                onDuplicate={onDuplicate ?? (() => {})}
                onDelete={onDelete ?? (() => {})}
                onCopyLink={async () => {
                  const { createShortLink } =
                    await import("@/services/sharing/create-short-link");
                  const { url, isShortLink, rateLimited } =
                    await createShortLink({ deck });
                  const success = await copyToClipboard(url);
                  if (success) {
                    if (rateLimited) {
                      showToast(
                        "Rate limit exceeded. Copied long URL instead.",
                        "warning"
                      );
                    } else if (isShortLink) {
                      showToast("Deck link copied to clipboard.", "success");
                    } else {
                      showToast(
                        "Copied long link (short link unavailable)",
                        "warning"
                      );
                    }
                  }
                }}
                type="DECK"
                onRename={
                  onRename
                    ? () => {
                        setEditName(deck.name || "");
                        setIsEditing(true);
                      }
                    : undefined
                }
                onExport={() => {
                  const blob = new Blob([JSON.stringify(deck, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${(deck.name || "untitled-deck").toLowerCase().replace(/\s+/g, "-")}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
