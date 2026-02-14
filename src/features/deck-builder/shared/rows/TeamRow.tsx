import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ArrowRight, Check } from "lucide-react";

import { Team, Deck } from "@/types/deck";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { GameImage } from "@/components/ui/GameImage";
import { encodeTeam } from "@/services/utils/encoding";
import { copyToClipboard } from "@/lib/clipboard";

// Re-using ItemMenu from ForgeControls 

import { ItemMenu } from "@/features/shared/deck/ui/ItemMenu";

interface TeamRowProps {
  team: Team;
  onLoad: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onRename?: (newName: string) => void;
  onPutAway?: () => void;
  // Selection Props
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  // Active State
  isActive?: boolean;
}

export function TeamRow({
  team,
  onLoad,
  onDelete,
  onDuplicate,
  onRename,
  onPutAway,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  isActive = false
}: TeamRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(team.name || "");
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
      setEditName(team.name || "");
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.id! });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={selectionMode ? onToggleSelect : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
            // Prevent default only if we aren't in the input or a button
            // And only if not in selection mode or explicitly selecting
            if (e.target === e.currentTarget) {
                e.preventDefault();
                if (selectionMode && onToggleSelect) {
                    onToggleSelect();
                } else {
                    // onLoad(); // Don't auto load on enter anymore for the row itself
                }
            }
        }
      }}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex items-center p-1.5 rounded cursor-grab active:cursor-grabbing touch-manipulation select-none border transition-all relative overflow-visible focus:outline-none focus:ring-1 focus:ring-brand-primary",
        isDragging
          ? "scale-105 shadow-xl shadow-brand-primary/20 z-50 border-brand-primary cursor-grabbing"
          : "bg-surface-card border-white/5 hover:border-white/20 hover:bg-white/5",
        selectionMode && isSelected && "bg-brand-primary/20 border-brand-primary"
      )}
    >
      <div className="p-1 text-gray-600 hover:text-gray-400 -ml-1 mr-1 transition-colors">
        {selectionMode ? (
            <div className={cn(
                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                isSelected 
                    ? "bg-brand-primary border-brand-primary text-black" 
                    : "border-white/20 group-hover:border-white/50"
            )}>
                {isSelected && <Check size={10} strokeWidth={4} />}
            </div>
        ) : (
            <GripVertical size={14} />
        )}
      </div>

      {/* Content Container */}
      <div className="flex-1 grid grid-rows-[auto_1fr] gap-1 min-w-0">
        {/* Top Row: Name */}
        <div className="font-bold text-gray-200 text-sm truncate">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/40 border border-brand-primary/50 rounded px-1 min-w-0 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-primary w-full"
              aria-label="Edit team name"
            />
          ) : (
            <span title={team.name} className="flex items-center gap-2">
                <span className="truncate">{team.name}</span>
                {isActive && (
                    <span className="text-[10px] uppercase font-bold bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded border border-brand-primary/30">
                        Active
                    </span>
                )}
            </span>
          )}
        </div>

        {/* Bottom Row: Icons + Actions */}
        <div className="flex items-center gap-2">
          {/* Team Decks */}
          <div className="flex items-center gap-1">
            {team.decks.map(
              (d: Deck, i: number) =>
                d.spellcaster && (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-md border border-white/10 bg-black/50 overflow-hidden shrink-0 relative"
                  >
                    <GameImage
                      src={getCardImageUrl(d.spellcaster)}
                      alt=""
                      fill
                      className="object-cover"
                      draggable={false}
                    />
                  </div>
                )
            )}
          </div>

          <div className="grow" />

          {/* Actions - Hide in selection mode */}
          {!selectionMode && (
          <div className="flex items-center gap-2 shrink-0">
            {isActive && onPutAway ? (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onPutAway();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-gray-500 text-gray-400 rounded-full shadow-sm hover:text-white hover:border-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-wider"
                    title="Put Away Team"
                >
                    <span className="hidden sm:inline">Put Away</span>
                </button>
            ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLoad();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-full shadow-sm hover:bg-brand-primary/80 transition-colors text-xs font-bold uppercase tracking-wider"
              title="Load Team"
            >
              <ArrowRight size={14} />
              <span className="hidden sm:inline">Load</span>
            </button>
            )}
            <ItemMenu
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              type="TEAM"
              onRename={onRename ? () => {
                setEditName(team.name || "");
                setIsEditing(true);
              } : undefined}
              onCopyLink={async () => {
                const hash = encodeTeam(team.decks, team.name);
                const url = `${window.location.origin}${window.location.pathname}?team=${hash}`;
                await copyToClipboard(url);
              }}
              onExport={() => {
                  const exportData = {
                      name: team.name || "Untitled Team",
                      decks: team.decks,
                      exportedAt: new Date().toISOString(),
                      version: "1.0"
                  };
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${(team.name || "untitled-team").toLowerCase().replace(/\s+/g, "-")}.json`;
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
