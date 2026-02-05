"use client";

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
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Unit, Spellcaster } from "@/types/api";
import { useDeckBuilder } from "@/hooks/useDeckBuilder";
import { UnitBrowser } from "./UnitBrowser";
import { CardInspector } from "./CardInspector";
import { ForgeControls } from "./ForgeControls";
import { ActiveDeckTray } from "./ActiveDeckTray";
import { decodeDeck } from "@/lib/encoding";
import { getCardImageUrl } from "@/lib/utils";
import { Deck, DeckSlot } from "@/types/deck"; 
import { AlertTriangle } from "lucide-react";

interface DeckBuilderAppProps {
  units: Unit[];
  spellcasters: Spellcaster[];
}

export function DeckBuilderApp({ units, spellcasters }: DeckBuilderAppProps) {
  // Import Conflict State
  const [pendingImport, setPendingImport] = useState<Deck | null>(null);

  // Selected Item for Inspector
  const [selectedItem, setSelectedItem] = useState<Unit | Spellcaster | null>(null);
  // Dragging Item for Overlay
  const [activeDragItem, setActiveDragItem] = useState<Unit | Spellcaster | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // PASSING DATA FOR HYDRATION
  const { 
      deck, 
      setSlot, 
      clearSlot, 
      clearDeck, 
      setSpellcaster, 
      setDeckState,
      isEmpty,
      stats,
      isInitialized
  } = useDeckBuilder(units, spellcasters);

  // URL Import Logic
  useEffect(() => {
    // Only run if deck logic is initialized to avoid premature overwrite
    if (!isInitialized) return;

    const deckHash = searchParams.get('d');
    if (!deckHash) return;

    const decoded = decodeDeck(deckHash);
    if (!decoded) return;

    // Reconstruct Deck Object from IDs
    const newDeck: Deck = {
        spellcaster: spellcasters.find(s => s.hero_id === decoded.spellcasterId) || null,
        slots: deck.slots.map(s => s) as [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot] // Clone structure
    };

    // Fill slots
    decoded.slotIds.forEach((id, idx) => {
        if (idx > 4) return;
        if (id) {
            const unit = units.find(u => u.entity_id === id);
            if (unit) {
                newDeck.slots[idx] = { ...newDeck.slots[idx], unit };
            }
        }
    });
    
    // Check equality (naive check via IDs)
    const localIds = [
        deck.spellcaster?.hero_id, 
        ...deck.slots.map(s => s.unit?.entity_id)
    ];
    const importedIds = [decoded.spellcasterId, ...decoded.slotIds];
    
    // Simplistic equality check
    const isDifferent = localIds.some((id, i) => (id || null) !== (importedIds[i] || null));

    if (!isDifferent) {
        // Same deck, just clear param to clean URL
        router.replace('/deck-builder', { scroll: false });
        return;
    }

    if (isEmpty) {
        setDeckState(newDeck);
        router.replace('/deck-builder', { scroll: false });
    } else {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setPendingImport(newDeck);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isInitialized, isEmpty]); 

  const confirmImport = () => {
    if (pendingImport) {
        setDeckState(pendingImport);
        setPendingImport(null);
        router.replace('/deck-builder', { scroll: false });
    }
  };

  const cancelImport = () => {
    setPendingImport(null);
    router.replace('/deck-builder', { scroll: false });
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const current = event.active.data.current;
    if (current && typeof current === 'object' && 'item' in current) {
         const item = current.item as Unit | Spellcaster;
         setActiveDragItem(item);
         setSelectedItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const item = activeDragItem;
    setActiveDragItem(null);
    const { over } = event;

    if (!over || !item) return;

    // Check if it's a Spellcaster being dropped
    if ('hero_id' in item) {
        // If dropped on "spellcaster-zone" or anywhere really?
        // User asked for "drag to their slot in the top right".
        // Let's enforce the target ID.
        if (over.id === 'spellcaster-zone' || !over.id) { 
             // Allow loose dropping for now or strict? 
             // "allow selecting and changing a spellcater by draging them to theri slot"
             // Implies strict target. But earlier I considered "anywhere". 
             // Let's support both: Drop on "spellcaster-zone" specifically.
             if (over.id === 'spellcaster-zone') {
                 setSpellcaster(item as Spellcaster);
             }
        }
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
        <div className="h-[calc(100vh-128px)] flex flex-col md:grid md:grid-rows-[1fr_auto]">
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
                        deck={deck} // Pass deck for encoding
                    />
                </div>
            </div>

            {/* Bottom Area: Deck Tray */}
            <div className="h-auto bg-surface-main z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                <ActiveDeckTray 
                    slots={deck.slots} 
                    onRemoveSlot={clearSlot} 
                />
            </div>

            {/* Import Conflict Modal */}
            {pendingImport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface-card border border-brand-primary/50 rounded-lg p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-500">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Load Shared Deck?</h3>
                                <p className="text-sm text-gray-400">
                                    You have a non-empty deck in your local storage. Loading this link will overwrite your current changes.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={cancelImport}
                                className="px-4 py-2 rounded text-sm font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Keep My Deck
                            </button>
                            <button 
                                onClick={confirmImport}
                                className="px-4 py-2 rounded text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary/80 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-colors"
                            >
                                Load Shared Deck
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Drag Overlay for Visual Feedback */}
        <DragOverlay dropAnimation={null}>
            {activeDragItem ? (
                <div className="w-32 h-auto aspect-3/4 bg-surface-card border-2 border-brand-primary rounded-lg shadow-2xl overflow-hidden pointer-events-none flex flex-col">
                    <div className="relative flex-1 overflow-hidden bg-gray-800">
                        <img 
                            src={getCardImageUrl(activeDragItem)} 
                            alt={activeDragItem.name} 
                            className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                    </div>
                    {/* Banner */}
                    <div className="h-6 min-h-6 bg-surface-main/95 border-t border-brand-primary/30 flex items-center justify-center px-1">
                        <span className="text-[9px] font-bold text-gray-200 text-center leading-tight truncate w-full">
                            {activeDragItem.name}
                        </span>
                    </div>
                 </div>
            ) : null}
        </DragOverlay>
    </DndContext>
  );
}
