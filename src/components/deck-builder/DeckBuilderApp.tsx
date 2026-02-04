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

  // Selected Item for Inspector
  const [selectedItem, setSelectedItem] = useState<Unit | Spellcaster | null>(null);
  // Dragging Item for Overlay
  const [activeDragItem, setActiveDragItem] = useState<Unit | Spellcaster | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const current = event.active.data.current;
    if (current && typeof current === 'object' && 'item' in current) {
         setActiveDragItem(current.item as Unit | Spellcaster);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const item = activeDragItem;
    setActiveDragItem(null);
    const { over } = event;

    if (!over || !item) return;

    // Check if it's a Spellcaster being dropped
    // Simplistic Logic: If it's a Hero, allowed anywhere -> Set as Deck Spellcaster
    // If it's a Unit -> Slot logic
    if ('hero_id' in item) {
        // It's a hero
        setSpellcaster(item as Spellcaster);
        return;
    }

    // It's a Unit
    if (!over.id.toString().startsWith("slot-")) return;

    const slotIndex = over.data.current?.index;

    if (slotIndex !== undefined) {
        setSlot(slotIndex, item as Unit);
    }
  };

  // Merge Data for Browser
  const browserItems = [
      ...spellcasters.map(h => ({ ...h, category: 'Spellcaster' as const })), // Add mock category for filter
      ...units
  ];

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
                        items={browserItems} 
                        onSelectItem={setSelectedItem} 
                    />
                </div>

                {/* Center: Inspector (6 Cols) */}
                <div className="md:col-span-6 h-1/2 md:h-full overflow-hidden flex flex-col">
                    <CardInspector 
                        item={selectedItem} 
                        onAddSlot={(idx) => {
                            if (selectedItem && !('hero_id' in selectedItem)) {
                                setSlot(idx, selectedItem as Unit);
                            }
                        }}
                        onSetSpellcaster={() => {
                            if (selectedItem && 'hero_id' in selectedItem) {
                                setSpellcaster(selectedItem as Spellcaster);
                            }
                        }}
                    />
                </div>

                {/* Right: Controls (3 Cols) */}
                <div className="md:col-span-3 hidden md:block border-l border-white/10 h-full overflow-y-auto">
                    <ForgeControls 
                        spellcaster={deck.spellcaster} 
                        stats={stats} 
                        onClear={clearDeck}
                    />
                    {/* Spellcaster quick pick removed in favor of Browser + Inspector flow */}
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
            {activeDragItem ? (
                 <div className="w-32 h-auto aspect-3/4 bg-surface-card border-2 border-brand-primary rounded-lg shadow-2xl opacity-90 flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-center p-1">{activeDragItem.name}</span>
                 </div>
            ) : null}
        </DragOverlay>
    </DndContext>
  );
}
