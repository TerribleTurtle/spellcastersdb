import Image from "next/image";
import { useDroppable } from "@dnd-kit/core";
import { DeckSlot } from "@/types/deck";
import { Spellcaster, Unit } from "@/types/api";

import { X, Shield, Sparkles } from "lucide-react";
import { cn, getCardImageUrl } from "@/lib/utils";

interface ActiveDeckTrayProps {
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  spellcaster: Spellcaster | null;
  onRemoveSlot: (index: 0 | 1 | 2 | 3 | 4) => void;
  onRemoveSpellcaster?: () => void; // Optional if we want to allow clearing commander from here
  draggedItem?: Unit | Spellcaster | null;
}

export function ActiveDeckTray({ slots, spellcaster, onRemoveSlot, onRemoveSpellcaster, draggedItem }: ActiveDeckTrayProps) {
  return (
    <div className="h-full bg-surface-main border-t border-brand-primary/20 flex flex-col pb-4">
      <div className="grow flex items-center justify-center px-4 py-2 md:py-4 gap-2 md:gap-4 overflow-x-auto min-h-[120px] md:min-h-[160px]">
        {/* Unit Slots 1-4 */}
        <div className="flex gap-2 mx-2">
            {slots.slice(0, 4).map((slot) => (
                <Slot 
                    key={slot.index} 
                    slot={slot} 
                    onRemove={() => onRemoveSlot(slot.index as 0|1|2|3)}
                    draggedItem={draggedItem}
                    allSlots={slots}
                />
            ))}
        </div>

        {/* Separator */}
        <div className="w-px h-24 bg-white/10 mx-2 self-center hidden md:block" />

        {/* Titan Slot */}
        <div className="mx-2">
            <Slot 
                slot={slots[4]} 
                onRemove={() => onRemoveSlot(4)}
                draggedItem={draggedItem}
                allSlots={slots}
            />
        </div>

        {/* Separator */}
        <div className="w-px h-24 bg-white/10 mx-2 self-center hidden md:block" />

        {/* Spellcaster Slot - Larger/Distinct */}
        <div className="mx-2">
            <SpellcasterSlot spellcaster={spellcaster} onRemove={onRemoveSpellcaster} draggedItem={draggedItem} />
        </div>
      </div>
    </div>
  );
}

function Slot({ slot, onRemove, draggedItem, allSlots }: { 
    slot: DeckSlot; 
    onRemove: () => void;
    draggedItem?: Unit | Spellcaster | null;
    allSlots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: `slot-${slot.index}`,
        data: { index: slot.index, allowedTypes: slot.allowedTypes }
    });

    const isTitanSlot = slot.allowedTypes.includes("TITAN");

    // Determine if this slot is a valid drop target for the dragged item
    let isValidTarget = false;
    if (draggedItem && 'entity_id' in draggedItem) {
        // It's a Unit being dragged
        const draggedUnit = draggedItem as Unit;
        const isTitan = draggedUnit.category === 'Titan';
        
        // Check type compatibility
        const typeMatches = isTitanSlot ? isTitan : !isTitan;
        
        // Check singleton rule: can't drop in a slot that already has this unit (for slots 0-3)
        const isDuplicate = slot.index < 4 && allSlots.some((s, i) => 
            i < 4 && i !== slot.index && s.unit?.entity_id === draggedUnit.entity_id
        );
        
        isValidTarget = typeMatches && !isDuplicate;
    }

    return (
        <div 
            ref={setNodeRef}
            className={cn(
                "relative group w-20 md:w-36 aspect-3/4 rounded-lg border-2 transition-all flex flex-col items-center justify-center",
                // Valid drop target (not hovering yet)
                isValidTarget && !isOver && "border-brand-accent/60 bg-brand-accent/5 shadow-[0_0_12px_rgba(251,191,36,0.3)] animate-pulse",
                // Active hover state (brightest)
                isOver && "border-brand-primary bg-brand-primary/10 scale-105",
                // Default states
                !isValidTarget && !isOver && "border-white/10 bg-surface-card",
                isTitanSlot && !isValidTarget && !isOver && "border-brand-accent/30 bg-brand-accent/5",
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
                <div className="absolute bottom-2 font-mono text-[10px] text-brand-accent opacity-50">TITAN</div>
            )}
        </div>
    )
}

function SpellcasterSlot({ spellcaster, onRemove, draggedItem }: { 
    spellcaster: Spellcaster | null;
    onRemove?: () => void;
    draggedItem?: Unit | Spellcaster | null;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: "spellcaster-zone",
        data: { type: "spellcaster" }
    });

    // Valid target if dragging a Spellcaster
    const isValidTarget = draggedItem && 'hero_id' in draggedItem;

    return (
        <div 
            ref={setNodeRef}
            className={cn(
                "relative group w-24 md:w-40 aspect-3/4 rounded-lg border-2 transition-all flex flex-col items-center justify-center shadow-lg",
                // Valid drop target (not hovering yet)
                isValidTarget && !isOver && "border-brand-accent/60 bg-brand-accent/5 shadow-[0_0_12px_rgba(251,191,36,0.3)] animate-pulse",
                // Active hover state (brightest)
                isOver && "border-brand-primary bg-brand-primary/10 scale-105 shadow-brand-primary/20",
                // Default states
                !isValidTarget && !isOver && "border-brand-primary/30 bg-surface-card",
                spellcaster && "border-brand-primary"
            )}
        >
             {!spellcaster && (
                <div className="text-center opacity-30 text-brand-primary">
                    <div className="mb-2 flex justify-center">
                        <Sparkles size={28} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">
                        Spellcaster
                    </span>
                </div>
            )}

            {spellcaster && (
                <div className="flex flex-col w-full h-full overflow-hidden rounded text-left">
                    {/* Image Area */}
                    <div className="relative flex-1 bg-slate-800 overflow-hidden">
                        <Image 
                             src={getCardImageUrl(spellcaster)} 
                             alt={spellcaster.name}
                             fill
                             sizes="(max-width: 768px) 100vw, 33vw"
                             className="object-cover object-top"
                        />
                    </div>
                     {/* Name Banner */}
                    <div className="h-7 min-h-7 bg-brand-primary/20 backdrop-blur-sm border-t border-brand-primary/30 flex items-center justify-center px-1 z-10 shrink-0">
                        <span className="text-[11px] font-bold text-white text-center leading-tight truncate w-full shadow-black drop-shadow-md">
                            {spellcaster.name}
                        </span>
                    </div>

                    {/* Remove Action */}
                     {onRemove && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg"
                        >
                            <X size={12} className="text-white" />
                        </button>
                     )}
                </div>
            )}
        </div>
    )
}
