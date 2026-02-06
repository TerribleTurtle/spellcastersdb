import Image from "next/image";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { DeckSlot } from "@/types/deck";
import { Spellcaster, Unit } from "@/types/api";

import { Shield, Sparkles } from "lucide-react";
import { cn, getCardImageUrl } from "@/lib/utils";

interface ActiveDeckTrayProps {
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  spellcaster: Spellcaster | null;
  onSelect?: (item: Unit | Spellcaster) => void;
  draggedItem?: Unit | Spellcaster | null;
}

export function ActiveDeckTray({ slots, spellcaster, onSelect, draggedItem }: ActiveDeckTrayProps) {
  return (
    <div className="h-full bg-surface-main border-t border-brand-primary/20 flex flex-col pb-2 md:pb-3">
      <div className="grow flex items-center justify-center px-4 py-2 md:py-3 gap-[1.5vw] md:gap-[0.75vw] overflow-x-auto">
        {/* Unit Slots 1-4 */}
        <div className="flex gap-[1.5vw] md:gap-[0.75vw] mx-2">
            {slots.slice(0, 4).map((slot) => (
                <Slot 
                    key={slot.index} 
                    slot={slot} 
                    draggedItem={draggedItem}
                    allSlots={slots}
                    onSelect={onSelect}
                />
            ))}
        </div>

        {/* Separator */}
        <div className="w-px h-24 bg-white/10 mx-2 self-center hidden md:block" />

        {/* Titan Slot */}
        <div className="mx-2">
            <Slot 
                slot={slots[4]} 
                draggedItem={draggedItem}
                allSlots={slots}
                onSelect={onSelect}
            />
        </div>

        {/* Separator */}
        <div className="w-px h-24 bg-white/10 mx-2 self-center hidden md:block" />

        {/* Spellcaster Area - Slot + Passives (Desktop) */}
        <div className="mx-2 relative flex items-center">
            <SpellcasterSlot spellcaster={spellcaster} draggedItem={draggedItem} onSelect={onSelect} />
            
            {/* Passives - Desktop Only - Absolute positioning to prevent layout shift */}
            {spellcaster && spellcaster.abilities.passive.length > 0 && (
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-1.5 w-[200px] lg:w-[240px]">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Passives</span>
                    <div className="flex flex-wrap gap-1">
                        {spellcaster.abilities.passive.map((passive, i) => (
                            <PassiveChip key={`${passive.ability_id}-${i}`} name={passive.name} description={passive.description} />
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

function Slot({ slot, draggedItem, allSlots, onSelect }: { 
    slot: DeckSlot; 
    draggedItem?: Unit | Spellcaster | null;
    allSlots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
    onSelect?: (item: Unit | Spellcaster) => void;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: `slot-${slot.index}`,
        data: { index: slot.index, allowedTypes: slot.allowedTypes }
    });

    const { attributes, listeners, setNodeRef: setDragNodeRef, transform, isDragging } = useDraggable({
        id: `slot-drag-${slot.index}`,
        data: { type: 'slot', index: slot.index, unit: slot.unit },
        disabled: !slot.unit // CRITICAL: Only draggable if populated
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: isDragging ? 0 : 1, // Hide original when dragging (overlay is shown)
    } : undefined;

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
                "relative group aspect-3/4 rounded-lg border-2 transition-all flex flex-col items-center justify-center",
                "w-[clamp(48px,12vw,80px)] md:w-[clamp(64px,8vw,96px)] lg:w-[clamp(72px,7vw,112px)]",
                // Valid drop target (not hovering yet)
                isValidTarget && !isOver && "border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.6),0_0_40px_rgba(251,191,36,0.3)] animate-pulse",
                // Active hover state (brightest)
                isOver && "border-brand-primary bg-brand-primary/10 scale-105",
                // Default states
                !isValidTarget && !isOver && "border-white/10 bg-surface-card",
                isTitanSlot && !isValidTarget && !isOver && "border-brand-accent/30 bg-brand-accent/5",
                slot.unit && "border-brand-secondary/50",
                isDragging && "opacity-50"
            )}
        >
            {/* Draggable Wrapper (only renders if unit exists) */}
            {slot.unit && (
                <div 
                    ref={setDragNodeRef} 
                    {...listeners} 
                    {...attributes} 
                    style={style}
                    className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
                    onClick={() => {
                         // Stop propagation so drag doesn't conflict with click
                         // But we want click to work if not dragging... dnd-kit handles this usually
                         if (onSelect) onSelect(slot.unit!);
                    }}
                >
                    {/* Visual Content moved inside draggable wrapper so it moves with drag? 
                        NO - dnd-kit moves the element using transform on the ORIGINAL element or uses an overlay. 
                        We want to leave the slot styling on the parent (droppable) and move the card content?
                        Actually, typical pattern is: 
                        Wrapper (Droppable) -> Inner (Draggable)
                    */}
                </div>
             )}

            {/* Label for Empty Slot */}
            {!slot.unit && (
                <div className="text-center opacity-30">
                    <div className="mb-2 flex justify-center">
                        {isTitanSlot ? <Shield size={24} /> : <div className="w-6 h-6 rounded-full border border-current" />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">
                        {isTitanSlot ? "Titan" : `Unit ${slot.index + 1}`}
                    </span>
                </div>
            )}

            {/* Filled State - Renders BEHIND the draggable wrapper hit area but visually matches */}
            {slot.unit && (
                <div className={cn("flex flex-col w-full h-full overflow-hidden rounded text-left pointer-events-none", isDragging && "opacity-0")}>
                    {/* Image Area */}
                    <div className="relative flex-1 bg-slate-800 overflow-hidden">
                        <Image 
                             src={getCardImageUrl(slot.unit)} 
                             alt={slot.unit.name}
                             fill
                             sizes="(max-width: 768px) 100vw, 33vw"
                             className="object-cover object-top"
                        />
                         {/* Rank/Titan Badge - Overlaid */}
                        {slot.unit.category === 'Titan' ? (
                            <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm">
                                TITAN
                            </div>
                        ) : (
                            <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm">
                                {slot.unit.card_config.rank}
                            </div>
                        )}
                    </div>
                     {/* Name Banner */}
                    <div className="h-6 min-h-6 bg-surface-main/95 border-t border-white/10 flex items-center justify-center px-1 z-10 shrink-0">
                        <span className="text-[10px] font-bold text-gray-200 text-center leading-tight truncate w-full">
                            {slot.unit.name}
                        </span>
                    </div>

                    {/* Remove Action - Needs pointer-events-auto to work through draggable overlay layer? */}

                </div>
            )}

            {/* Titan Icon Indicator (Always visible if titan slot) - Removed redundant text label */}
            {isTitanSlot && !slot.unit && (
                <div className="absolute bottom-2 font-mono text-[10px] text-brand-accent opacity-50 hidden">TITAN</div>
            )}
        </div>
    )
}

function SpellcasterSlot({ spellcaster, draggedItem, onSelect }: { 
    spellcaster: Spellcaster | null;
    draggedItem?: Unit | Spellcaster | null;
    onSelect?: (item: Unit | Spellcaster) => void;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: "spellcaster-zone",
        data: { type: "spellcaster" }
    });

    const { attributes, listeners, setNodeRef: setDragNodeRef, transform, isDragging } = useDraggable({
        id: "spellcaster-slot-drag",
        data: { type: 'spellcaster-slot', spellcaster },
        disabled: !spellcaster
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: isDragging ? 0 : 1,
    } : undefined;

    // Valid target if dragging a Spellcaster
    const isValidTarget = draggedItem && 'hero_id' in draggedItem;

    return (
        <div 
            ref={setNodeRef}
            onClick={() => {
                if (spellcaster && onSelect) {
                    onSelect(spellcaster);
                }
            }}
            className={cn(
                "relative group aspect-3/4 rounded-lg border-2 transition-all flex flex-col items-center justify-center shadow-lg",
                "w-[clamp(56px,14vw,96px)] md:w-[clamp(80px,10vw,120px)] lg:w-[clamp(88px,8vw,128px)]",
                // Valid drop target (not hovering yet)
                isValidTarget && !isOver && "border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.6),0_0_40px_rgba(251,191,36,0.3)] animate-pulse",
                // Active hover state (brightest)
                isOver && "border-brand-primary bg-brand-primary/10 scale-105 shadow-brand-primary/20",
                // Default states
                !isValidTarget && !isOver && "border-brand-primary/30 bg-surface-card",
                spellcaster && "border-brand-primary",
                isDragging && "opacity-50"
            )}
        >
             {/* Draggable Wrapper */}
             {spellcaster && (
                <div 
                    ref={setDragNodeRef} 
                    {...listeners} 
                    {...attributes} 
                    style={style}
                    className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
                    onClick={() => {
                         if (onSelect) onSelect(spellcaster);
                    }}
                />
             )}
             {!spellcaster && (
                <div className="text-center opacity-30 text-brand-primary">
                    <div className="mb-2 flex justify-center">
                        <Sparkles size={28} />
                    </div>
                    <span className="text-[9px] md:text-xs font-bold uppercase tracking-normal md:tracking-widest">
                        Spellcaster
                    </span>
                </div>
            )}

            {spellcaster && (
                <div className={cn("flex flex-col w-full h-full overflow-hidden rounded text-left pointer-events-none", isDragging && "opacity-0")}>
                    {/* Image Area */}
                    <div className="relative flex-1 bg-slate-800 overflow-hidden">
                        <Image 
                             src={getCardImageUrl(spellcaster)} 
                             alt={spellcaster.name}
                             fill
                             sizes="(max-width: 768px) 100vw, 33vw"
                             className="object-cover object-top"
                        />
                        {/* Spellcaster Class Badge */}
                        <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm uppercase">
                            {spellcaster.class}
                        </div>
                    </div>
                     {/* Name Banner */}
                    <div className="h-7 min-h-7 bg-brand-primary/20 backdrop-blur-sm border-t border-brand-primary/30 flex items-center justify-center px-1 z-10 shrink-0">
                        <span className="text-[11px] font-bold text-white text-center leading-tight truncate w-full shadow-black drop-shadow-md">
                            {spellcaster.name}
                        </span>
                    </div>

                    {/* Remove Action */}

                </div>
            )}
        </div>
    )
}

function PassiveChip({ name, description }: { name: string; description: string }) {
    return (
        <div className="relative group/passive">
            {/* Chip */}
            <div className="px-2 py-1 bg-brand-primary/20 border border-brand-primary/30 rounded text-[10px] font-bold text-brand-primary cursor-default hover:bg-brand-primary/30 transition-colors whitespace-nowrap">
                {name}
            </div>
            
            {/* Tooltip - Shows on hover */}
            <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-surface-main border border-white/20 rounded-lg shadow-2xl opacity-0 invisible group-hover/passive:opacity-100 group-hover/passive:visible transition-all z-50 pointer-events-none">
                <p className="text-xs font-bold text-brand-accent mb-1">{name}</p>
                <p className="text-[11px] text-gray-300 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
