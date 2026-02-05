import Image from "next/image";
import { useDroppable } from "@dnd-kit/core";
import { DeckSlot } from "@/types/deck";

import { X, Shield } from "lucide-react";
import { cn, getCardImageUrl } from "@/lib/utils";

interface ActiveDeckTrayProps {
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  onRemoveSlot: (index: 0 | 1 | 2 | 3 | 4) => void;
}

export function ActiveDeckTray({ slots, onRemoveSlot }: ActiveDeckTrayProps) {
  return (
    <div className="h-full bg-surface-main border-t border-brand-primary/20 flex flex-col">
      <div className="grow flex items-center justify-center px-4 py-2 gap-4 overflow-x-auto">
        {slots.map((slot) => (
            <Slot 
                key={slot.index} 
                slot={slot} 
                onRemove={() => onRemoveSlot(slot.index)} 
            />
        ))}
      </div>
    </div>
  );
}

function Slot({ slot, onRemove }: { slot: DeckSlot; onRemove: () => void }) {
    const { isOver, setNodeRef } = useDroppable({
        id: `slot-${slot.index}`,
        data: { index: slot.index, allowedTypes: slot.allowedTypes }
    });

    const isTitanSlot = slot.allowedTypes.includes("TITAN");

    return (
        <div 
            ref={setNodeRef}
            className={cn(
                "relative group w-32 md:w-40 aspect-3/4 rounded-lg border-2 transition-all flex flex-col items-center justify-center",
                isOver ? "border-brand-primary bg-brand-primary/10 scale-105" : "border-white/10 bg-surface-card",
                isTitanSlot && "border-brand-accent/30 bg-brand-accent/5",
                slot.unit && "border-brand-secondary/50"
            )}
        >
            {/* Label for Empty Slot */}
            {!slot.unit && (
                <div className="text-center opacity-30">
                    <div className="mb-2 flex justify-center">
                        {isTitanSlot ? <Shield size={24} /> : <div className="w-6 h-6 rounded-full border border-current" />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">
                        {isTitanSlot ? "Titan" : `Slot ${slot.index + 1}`}
                    </span>
                </div>
            )}

            {/* Filled State */}
            {slot.unit && (
                <div className="flex flex-col w-full h-full overflow-hidden rounded text-left">
                    {/* Image Area */}
                    <div className="relative flex-1 bg-slate-800 overflow-hidden">
                        <Image 
                             src={getCardImageUrl(slot.unit)} 
                             alt={slot.unit.name}
                             fill
                             sizes="(max-width: 768px) 100vw, 33vw"
                             className="object-cover object-top"
                        />
                         {/* Rank Badge - Overlaid */}
                        <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm">
                            {slot.unit.card_config.rank}
                        </div>
                    </div>
                     {/* Name Banner */}
                    <div className="h-6 min-h-6 bg-surface-main/95 border-t border-white/10 flex items-center justify-center px-1 z-10 shrink-0">
                        <span className="text-[10px] font-bold text-gray-200 text-center leading-tight truncate w-full">
                            {slot.unit.name}
                        </span>
                    </div>

                    {/* Remove Action */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg"
                    >
                        <X size={12} className="text-white" />
                    </button>
                </div>
            )}

            {/* Titan Icon Indicator (Always visible if titan slot) */}
            {isTitanSlot && !slot.unit && (
                <div className="absolute bottom-2 font-mono text-[10px] text-brand-accent opacity-50">TITAN ONLY</div>
            )}
        </div>
    )
}
