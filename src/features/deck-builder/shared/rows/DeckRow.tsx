"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Check, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Deck } from "@/types/deck";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { GameImage } from "@/components/ui/GameImage";
import { validateDeck } from "@/services/validation/deck-validation";
import { encodeDeck } from "@/services/utils/encoding";
import { copyToClipboard } from "@/lib/clipboard";
import { ItemMenu } from "@/features/shared/deck/ui/ItemMenu";

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
  onToggleSelect
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
          : "bg-surface-card border-white/5 hover:border-white/20 hover:bg-white/5",
        isDragging &&
          "scale-105 shadow-xl shadow-brand-primary/20 z-50 border-brand-primary cursor-grabbing",
        selectionMode && isSelected && "bg-brand-primary/20 border-brand-primary",
        className
      )}
      onClick={selectionMode ? onToggleSelect : undefined}
    >
      <div 
        className="p-1 text-gray-600 hover:text-gray-400 -ml-1 mr-1 transition-colors cursor-grab active:cursor-grabbing touch-none outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
        role="button"
        tabIndex={0}
        aria-label="Drag to reorder deck"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
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
                    : "border-white/20 group-hover:border-white/50"
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
              isActive ? "text-brand-primary" : "text-gray-200"
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
                className="bg-black/40 border border-brand-primary/50 rounded px-1 min-w-0 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            ) : (
              <div
                className={cn(
                  "font-bold truncate text-sm flex items-center gap-2",
                  isActive ? "text-brand-primary" : "text-gray-200"
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
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-black shadow-sm">
              {deck.spellcaster ? (
                <GameImage
                  src={getCardImageUrl(deck.spellcaster)}
                  alt=""
                  fill
                  className="object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold text-xs">
                  ?
                </div>
              )}
            </div>
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-surface-card flex items-center justify-center",
                isValid ? "bg-green-500 text-white" : "bg-red-500 text-white"
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
                className="w-9 h-9 rounded-md bg-black/50 border border-white/10 overflow-hidden shrink-0 relative"
              >
                {s.unit && (
                  <GameImage
                    src={getCardImageUrl(s.unit)}
                    alt=""
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
                  alt=""
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
                      "bg-transparent border-gray-500 text-gray-400 hover:text-white hover:border-white hover:bg-white/5"
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
                      "bg-brand-primary text-white hover:bg-brand-primary/80 border-0"
                  )}
                  onClick={(e) => {
                      e.stopPropagation();
                      onLoad?.();
                  }}
                  title={isTeamMode ? "Import Deck to Slot" : "Load Deck"}
                  aria-label={isTeamMode ? "Import Deck to Slot" : "Load Deck"}
               >
                  <ArrowRight size={14} />
                  <span className="hidden sm:inline">{isTeamMode ? "Import" : "Load"}</span>
               </Button>
             )}

            <ItemMenu
              onDuplicate={onDuplicate ?? (() => {})}
              onDelete={onDelete ?? (() => {})}
              onCopyLink={async () => {
                const hash = encodeDeck(deck);
                const url = `${window.location.origin}${window.location.pathname}?d=${hash}`;
                await copyToClipboard(url);
              }}
              type="DECK"
              onRename={onRename ? () => {
                setEditName(deck.name || "");
                setIsEditing(true);
              } : undefined}
              onExport={() => {
                  const blob = new Blob([JSON.stringify(deck, null, 2)], { type: "application/json" });
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
