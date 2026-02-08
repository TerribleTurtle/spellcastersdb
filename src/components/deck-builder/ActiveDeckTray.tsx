import { GameImage } from "@/components/ui/GameImage";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { DeckSlot } from "@/types/deck";
import { Spellcaster, Unit, Spell, Titan } from "@/types/api";

import { Shield, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { cn, getCardImageUrl } from "@/lib/utils";

interface ActiveDeckTrayProps {
  slots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
  spellcaster: Spellcaster | null;
  onSelect?: (item: Unit | Spellcaster | Spell | Titan) => void;
  draggedItem?: Unit | Spellcaster | Spell | Titan | null;
  validation?: {
      isValid: boolean;
      errors: string[];
  };
}

export function ActiveDeckTray({ slots, spellcaster, onSelect, draggedItem, validation }: ActiveDeckTrayProps) {
  return (
    <div className="h-full bg-surface-main border-t border-brand-primary/20 flex flex-col pb-2 md:pb-3 relative">
      <div className="grow flex items-center justify-between md:justify-center px-3 md:px-4 py-2 md:py-3 gap-0.5 md:gap-4">
        {/* Spellcaster Area - Far Left */}
        <div className="relative flex items-center flex-1 md:flex-none min-w-0 max-w-[17%] md:max-w-none">
            <SpellcasterSlot spellcaster={spellcaster} draggedItem={draggedItem} onSelect={onSelect} />
            
            {/* Passives - Absolute positioning to prevent layout shift */}

        </div>

        {/* Separator */}
        <div className="w-px h-24 bg-white/10 mx-2 self-center hidden md:block" />

        {/* Unit Slots 1-4 */}
        <div className="flex gap-0.5 md:gap-4 mx-0 md:mx-2 flex-[4] md:flex-none min-w-0 justify-center">
            {slots.slice(0, 4).map((slot) => (
                <div key={slot.index} className="flex-1 md:flex-none min-w-0">
                    <Slot 
                        slot={slot} 
                        draggedItem={draggedItem}
                        allSlots={slots}
                        onSelect={onSelect}
                    />
                </div>
            ))}
        </div>

        {/* Separator */}
        <div className="w-px h-24 bg-white/10 mx-2 self-center hidden md:block" />

        {/* Titan Area - Slot + Validation Indicator (Directly to the right) */}
        <div className="relative flex items-center flex-1 md:flex-none min-w-0 max-w-[17%] md:max-w-none">
            <Slot 
                slot={slots[4]}  
                draggedItem={draggedItem}
                allSlots={slots}
                onSelect={onSelect}
            />

            {/* Validation Indicator - Directly to the right of Titan */}
            {validation && (
                <div className={cn(
                    "absolute z-50 flex items-center gap-1.5 rounded-full shadow-sm border backdrop-blur-md transition-all cursor-help whitespace-nowrap",
                    // Mobile: Top-Right Corner Overlay
                    "-top-2 -right-2 px-1.5 py-0.5",
                    // Desktop: Side Badge (Reverted per user request)
                    "md:top-0 md:left-full md:right-auto md:ml-3 md:px-2 md:py-0.5",
                    validation.isValid 
                        ? "bg-green-500/10 border-green-500/20 text-green-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                )} title={validation.isValid ? "Deck Valid" : validation.errors.join('\n')}>
                    {validation.isValid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    <span className="text-[9px] font-bold uppercase tracking-widest hidden md:inline">
                        {validation.isValid ? "Valid" : `${validation.errors.length} Issues`}
                    </span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

function Slot({ slot, draggedItem, allSlots, onSelect }: { 
    slot: DeckSlot; 
    draggedItem?: Unit | Spellcaster | Spell | Titan | null;
    allSlots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
    onSelect?: (item: Unit | Spellcaster | Spell | Titan) => void;
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
        // It's a Unit/Spell/Titan being dragged
        const draggedUnit = draggedItem as Unit | Spell | Titan;
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
                "relative group aspect-3/4 rounded-lg border-2 transition-all flex flex-col items-center justify-center w-full",
                "md:w-[clamp(60px,6vw,80px)] lg:w-[clamp(64px,5vw,96px)]",
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
                    className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-none"
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
                    <span className="text-[9px] md:text-xs font-bold uppercase tracking-wide md:tracking-widest">
                        {isTitanSlot ? "Titan" : `Incant. ${slot.index + 1}`}
                    </span>
                </div>
            )}

            {/* Filled State - Renders BEHIND the draggable wrapper hit area but visually matches */}
            {slot.unit && (
                <div className={cn("flex flex-col w-full h-full overflow-hidden rounded text-left pointer-events-none", isDragging && "opacity-0")}>
                    {/* Image Area */}
                    <div className="relative flex-1 bg-slate-800 overflow-hidden">
                        <GameImage 
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
                                {slot.unit.rank ?? 'N/A'}
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
    draggedItem?: Unit | Spellcaster | Spell | Titan | null;
    onSelect?: (item: Unit | Spellcaster | Spell | Titan) => void;
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
    const isValidTarget = draggedItem && 'spellcaster_id' in draggedItem;

    return (
        <div 
            ref={setNodeRef}
            onClick={() => {
                if (spellcaster && onSelect) {
                    onSelect(spellcaster);
                }
            }}
            className={cn(
                "relative group aspect-3/4 rounded-lg border-2 transition-all flex flex-col items-center justify-center shadow-lg w-full",
                "md:w-[clamp(72px,8vw,100px)] lg:w-[clamp(80px,6vw,120px)]",
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
                    className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-none"
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
                        <GameImage 
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


