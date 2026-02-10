
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ArrowRight, MoreHorizontal, Layers, Link as LinkIcon, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

import { Team } from "@/hooks/useTeamBuilder";
import { cn, getCardImageUrl } from "@/lib/utils";
import { GameImage } from "@/components/ui/GameImage";
import { encodeTeam } from "@/lib/encoding";
import { copyToClipboard } from "@/lib/clipboard";

// Re-using ItemMenu from ForgeControls (which we will likely extract too, or duplicate for now to avoid circular deps if we keep it in ForgeControls)
// For now, I'll include a local version of ItemMenu or export it from a shared place. 
// Let's create a shared ItemMenu component or keep it simple here.
// To keep things clean, I will inline the necessary parts or create a UI component for it. 
// Check: ItemMenu uses "createPortal" and has some logic. 

import { ItemMenu } from "./ItemMenu";

interface TeamRowProps {
  team: Team;
  onLoad: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

export function TeamRow({
  team,
  onLoad,
  onDelete,
  onDuplicate,
}: TeamRowProps) {
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
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onLoad}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex flex-col p-2 rounded border bg-surface-card border-white/5 hover:border-white/20 hover:bg-white/5 transition-all relative overflow-visible gap-2 cursor-grab active:cursor-grabbing touch-none select-none",
        isDragging && "opacity-50 border-brand-primary cursor-grabbing"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 text-gray-600 hover:text-gray-400 -ml-1 transition-colors">
            <GripVertical size={14} />
          </div>
          <div className="font-bold text-gray-200 text-sm truncate">
            {team.name}
          </div>
        </div>
        <div className="flex gap-1 shrink-0 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLoad();
            }}
            className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase rounded hover:bg-brand-primary hover:text-white transition-colors"
          >
            Load
          </button>
          <ItemMenu
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            type="TEAM"
            onCopyLink={async () => {
              const hash = encodeTeam(team.decks, team.name); // Updated to include team name
              const url = `${window.location.origin}${window.location.pathname}?team=${hash}`;
              await copyToClipboard(url);
            }}
          />
        </div>
      </div>
      <div className="flex -space-x-1.5 overflow-hidden">
        {team.decks.map(
          (d, i) =>
            d.spellcaster && (
              <div
                key={i}
                className="w-8 h-8 rounded-full border border-surface-card bg-black/50 overflow-hidden ring-2 ring-surface-card shrink-0 relative"
              >
                <GameImage
                  src={getCardImageUrl(d.spellcaster)}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            )
        )}
      </div>
    </div>
  );
}
