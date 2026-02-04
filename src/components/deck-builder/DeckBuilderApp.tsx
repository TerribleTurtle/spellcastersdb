"use client";

import { useState } from "react";
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragOverlay, 
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core";
import { Unit, Hero as Spellcaster } from "@/types/api";
import { useDeckBuilder } from "@/hooks/useDeckBuilder";
import { UnitBrowser } from "./UnitBrowser";
import { CardInspector } from "./CardInspector";
import { ForgeControls } from "./ForgeControls";
import { ActiveDeckTray } from "./ActiveDeckTray";

interface DeckBuilderAppProps {
  units: Unit[];
  spellcasters: Spellcaster[];
}

export function DeckBuilderApp({ units, spellcasters }: DeckBuilderAppProps) {
  const { 
    deck, 
    setSlot, 
    clearSlot, 
    clearDeck, 
    setSpellcaster, 
    stats
  } = useDeckBuilder();

  // Selected Unit for Inspector
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  // Dragging Item for Overlay
  const [activeDragUnit, setActiveDragUnit] = useState<Unit | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    // We stored the full unit object in data.unit in UnitBrowser
    const current = event.active.data.current;
    if (current && typeof current === 'object' && 'unit' in current) {
         setActiveDragUnit(current.unit as Unit);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragUnit(null);
    const { active, over } = event;

    if (!over) return;

    // Identified by `slot-{index}`
    if (!over.id.toString().startsWith("slot-")) return;

    const slotIndex = over.data.current?.index;
    const unit = active.data.current?.unit as Unit;

    if (slotIndex !== undefined && unit) {
        // useDeckBuilder handles validation, but we can also prevent dropping here visually if needed
        // For now, just try to set it.
        setSlot(slotIndex, unit);
    }
  };

  return (
    <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
    >
        <div className="h-[calc(100vh-64px)] flex flex-col md:grid md:grid-rows-[1fr_auto]">
            {/* Top Area: 3 Columns */}
            <div className="row-span-1 min-h-0 flex flex-col md:grid md:grid-cols-12 border-b border-white/10 bg-surface-main">
                {/* Left: Unit Browser (3 Cols) */}
                <div className="md:col-span-3 h-1/2 md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
                    <UnitBrowser 
                        units={units} 
                        onSelectUnit={setSelectedUnit} 
                    />
                </div>

                {/* Center: Inspector (6 Cols) */}
                <div className="md:col-span-6 h-1/2 md:h-full overflow-hidden flex flex-col">
                    <CardInspector 
                        unit={selectedUnit} 
                        onAddSlot={(idx) => selectedUnit && setSlot(idx, selectedUnit)}
                    />
                </div>

                {/* Right: Controls (3 Cols) */}
                <div className="md:col-span-3 hidden md:block border-l border-white/10 h-full overflow-y-auto">
                    {/* Spellcaster Select would go here properly, for now passing mock select */}
                    <ForgeControls 
                        spellcaster={deck.spellcaster} 
                        stats={stats} 
                        onClear={clearDeck}
                    />
                    {/* Temp Spellcaster Picker for MVP */}
                    <div className="p-4 border-t border-white/10">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Change Spellcaster</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {spellcasters.map(sc => (
                                <button 
                                    key={sc.hero_id}
                                    onClick={() => setSpellcaster(sc)}
                                    className={`text-[10px] p-1 border rounded ${deck.spellcaster?.hero_id === sc.hero_id ? 'border-brand-primary bg-brand-primary/20' : 'border-white/10'}`}
                                >
                                    {sc.name.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Area: Deck Tray */}
            <div className="h-auto bg-surface-main z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                <ActiveDeckTray 
                    slots={deck.slots} 
                    onRemoveSlot={clearSlot} 
                />
            </div>
        </div>

        {/* Drag Overlay for Visual Feedback */}
        <DragOverlay>
            {activeDragUnit ? (
                 <div className="w-24 h-32 bg-surface-card border-2 border-brand-primary rounded-lg shadow-2xl opacity-90 flex items-center justify-center">
                    <span className="text-xs font-bold text-center p-1">{activeDragUnit.name}</span>
                 </div>
            ) : null}
        </DragOverlay>
    </DndContext>
  );
}
