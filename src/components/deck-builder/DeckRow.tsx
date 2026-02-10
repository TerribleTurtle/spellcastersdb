
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Check, AlertCircle, ArrowRight } from "lucide-react";

import { Deck } from "@/types/deck";
import { cn, getCardImageUrl } from "@/lib/utils";
import { GameImage } from "@/components/ui/GameImage";
import { validateDeck } from "@/lib/deck-validation";
import { encodeDeck } from "@/lib/encoding";
import { copyToClipboard } from "@/lib/clipboard";
import { ItemMenu } from "./ItemMenu";

interface DeckRowProps {
  deck: Deck;
  isActive: boolean;
  isTeamMode: boolean;
  onLoad: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function DeckRow({
  deck,
  isActive,
  isTeamMode,
  onLoad,
  onDelete,
  onDuplicate,
}: DeckRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deck.id! });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const { isValid, errors } = validateDeck(deck);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onLoad}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex items-center p-1.5 rounded cursor-grab active:cursor-grabbing touch-none select-none border transition-all relative overflow-visible",
        isActive
          ? "bg-brand-primary/10 border-brand-primary/50"
          : "bg-surface-card border-white/5 hover:border-white/20 hover:bg-white/5",
        isDragging && "opacity-50 border-brand-primary cursor-grabbing"
      )}
    >
      <div className="p-1 text-gray-600 hover:text-gray-400 -ml-1 mr-1 transition-colors">
        <GripVertical size={14} />
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
            {deck.name}
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
              "flex items-center gap-1",
              isTeamMode && "hidden md:flex" 
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
                />
              )}
            </div>
          </div>

          <div className="grow" />

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {isTeamMode && (
              <button className="flex items-center justify-center w-8 h-8 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-primary/80 transition-colors" title="Import Deck">
                <ArrowRight size={16} />
              </button>
            )}
            <ItemMenu
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onCopyLink={async () => {
                const hash = encodeDeck(deck);
                const url = `${window.location.origin}${window.location.pathname}?d=${hash}`;
                await copyToClipboard(url);
              }}
              type="DECK"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
