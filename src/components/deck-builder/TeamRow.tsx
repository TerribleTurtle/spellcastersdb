
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ArrowRight } from "lucide-react";

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
        "group flex items-center p-1.5 rounded cursor-grab active:cursor-grabbing touch-none select-none border transition-all relative overflow-visible",
        isDragging
          ? "opacity-50 border-brand-primary cursor-grabbing"
          : "bg-surface-card border-white/5 hover:border-white/20 hover:bg-white/5"
      )}
    >
      <div className="p-1 text-gray-600 hover:text-gray-400 -ml-1 mr-1 transition-colors">
        <GripVertical size={14} />
      </div>

      {/* Content Container */}
      <div className="flex-1 grid grid-rows-[auto_1fr] gap-1 min-w-0">
        {/* Top Row: Name */}
        <div className="font-bold text-gray-200 text-sm truncate">
          {team.name}
        </div>

        {/* Bottom Row: Icons + Actions */}
        <div className="flex items-center gap-2">
          {/* Team Decks */}
          <div className="flex items-center gap-1">
            {team.decks.map(
              (d, i) =>
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
                    />
                  </div>
                )
            )}
          </div>

          <div className="grow" />

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLoad();
              }}
              className="flex items-center justify-center w-8 h-8 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-primary/80 transition-colors"
              title="Load Team"
            >
              <ArrowRight size={16} />
            </button>
            <ItemMenu
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              type="TEAM"
              onCopyLink={async () => {
                const hash = encodeTeam(team.decks, team.name);
                const url = `${window.location.origin}${window.location.pathname}?team=${hash}`;
                await copyToClipboard(url);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
