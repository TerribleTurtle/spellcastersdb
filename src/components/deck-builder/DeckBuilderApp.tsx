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
import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Unit, Spellcaster } from "@/types/api";
import { useDeckBuilder } from "@/hooks/useDeckBuilder";
import { UnitBrowser } from "./UnitBrowser";
import { CardInspector } from "./CardInspector";
import { ForgeControls } from "./ForgeControls";
import { ActiveDeckTray } from "./ActiveDeckTray";
import { decodeDeck } from "@/lib/encoding";
import { cn, getCardImageUrl } from "@/lib/utils";
import { Deck, DeckSlot } from "@/types/deck"; 
import { AlertTriangle } from "lucide-react";

const INITIAL_SLOTS: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot] = [
  { index: 0, unit: null, allowedTypes: ['UNIT'] },
  { index: 1, unit: null, allowedTypes: ['UNIT'] },
  { index: 2, unit: null, allowedTypes: ['UNIT'] },
  { index: 3, unit: null, allowedTypes: ['UNIT'] },
  { index: 4, unit: null, allowedTypes: ['TITAN'] },
];

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
  
  // Ref to track drag state for event handlers without causing re-renders
  const isDraggingRef = useRef(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // PASSING DATA FOR HYDRATION
  const { 
      deck, 
      setSlot, 
      clearSlot, 
      clearDeck, 
      setSpellcaster,
      removeSpellcaster, // New
      setDeckState,
      moveSlot,
      isEmpty,
      stats,
      validation,
      isInitialized,
      lastError
  } = useDeckBuilder(units, spellcasters);

  // URL Import Logic
  useEffect(() => {
    // Only run if deck logic is initialized to avoid premature overwrite
    if (!isInitialized) return;

    const deckHash = searchParams.get('d');
    if (!deckHash) return;

    const decoded = decodeDeck(deckHash);
    if (!decoded) return;

    // Reconstruct Deck Object from IDs using FRESH TEMPLATE
    const newDeck: Deck = {
        spellcaster: spellcasters.find(s => s.hero_id === decoded.spellcasterId) || null,
        slots: INITIAL_SLOTS.map(s => ({ ...s })) as [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot]
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

  // Mobile Navigation State
  const [activeMobileTab, setActiveMobileTab] = useState<'BROWSER' | 'INSPECTOR' | 'FORGE'>('BROWSER');

  const handleSelectItem = useCallback((item: Unit | Spellcaster) => {
    // Prevent selection if we are currently dragging (fixes mobile drag triggering inspector)
    if (isDraggingRef.current) return;

    setSelectedItem(item);
    // Auto-switch to inspector on mobile
    setActiveMobileTab('INSPECTOR');
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { 
        activationConstraint: { 
            delay: 250, 
            tolerance: 5 
        } 
    })
  );

  // Quick Add Logic
  const [lastQuickAdd, setLastQuickAdd] = useState<string | null>(null);

  const handleQuickAdd = useCallback((item: Unit | Spellcaster) => {
      // 1. If Spellcaster -> Set
      if ('hero_id' in item) {
          setSpellcaster(item as Spellcaster);
          setLastQuickAdd(`${item.name} set as Commander`);
          setTimeout(() => setLastQuickAdd(null), 2000);
          return;
      }

      // 2. If Unit -> Find Empty Slot
      const unit = item as Unit;
      // Note: We need to access the LATEST deck state here. 
      // Since this function is passed to UnitBrowser memoized, deck needs to be dependency
      // But passing deck as dependency breaks memoization of UnitBrowser potentially if deck changes often (it does)
      // HOWEVER, UnitBrowser only re-renders if props change.
      // Ideally handleQuickAdd shouldn't change often. 
      // For now, let's keep it simple. If perf is still bad we can optimize this further.
      // Just accessing deck directly here is fine as long as we put it in dependency array or use functional updates if possible.
      // But setSlot relies on index.
      
      // Actually, to truly fix UnitBrowser memoization, we need stable handlers.
      // We can't easily make this stable without Ref or Reducer logic but let's see.
      // For now, let's just make handleSelectItem stable which was the main culprit.
      // handleQuickAdd is less frequent (double tap).
      
      const emptySlot = deck.slots.find(s => s.index < 4 && !s.unit);
      
      if (emptySlot) {
          setSlot(emptySlot.index, unit);
          setLastQuickAdd(`Added ${unit.name}`);
          setTimeout(() => setLastQuickAdd(null), 2000);
          return;
      }

      // 3. Check Titan Slot
      if (unit.category === 'Titan' && !deck.slots[4].unit) {
           setSlot(4, unit);
           setLastQuickAdd(`Added ${unit.name} to Titan Slot`);
           setTimeout(() => setLastQuickAdd(null), 2000);
           return;
      }

      // 4. Deck Full
      setLastQuickAdd(`Deck Full!`);
      setTimeout(() => setLastQuickAdd(null), 2000);
  }, [deck, setSlot, setSpellcaster]);

  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true;
    const current = event.active.data.current;
    
    // Check if dragging from a slot
    if (current?.type === 'slot') {
        // Slot drag data: { type: 'slot', index: number, unit: Unit }
        setActiveDragItem(current.unit);
        // Do NOT select item on drag start from slot (prevents jumping context)
        return;
    }

    // Check if dragging from spellcaster slot
    if (current?.type === 'spellcaster-slot') {
        setActiveDragItem(current.spellcaster);
        return;
    }

    // Strict type check before casting
    if (current?.item && ('entity_id' in current.item || 'hero_id' in current.item)) {
         const item = current.item as Unit | Spellcaster;
         setActiveDragItem(item);
         // handleSelectItem(item); // Removed to prevent inspector overlap on drag
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    isDraggingRef.current = false;
    const item = activeDragItem;
    setActiveDragItem(null);
    const { over, active } = event;

    // --- CASE 1: SLOT SOURCE ---
    if (active.data.current?.type === 'slot') {
        const sourceIndex = active.data.current.index as number;
        
        // Fix: If dropped on Spellcaster, CANCEL the drop (snap back) instead of removing
        if (over && (over.id === 'spellcaster-zone' || over.id === 'spellcaster-zone-forge')) {
            return;
        }

        // Dropped outside or invalid target -> REMOVE
        if (!over || !over.id.toString().startsWith("slot-")) {
             // Basic "Drag to Remove" logic
             clearSlot(sourceIndex as 0|1|2|3|4);
             return;
        }

        // Dropped on another slot -> SWAP/MOVE
        const targetIndex = over.data.current?.index as number;
        
        if (sourceIndex === targetIndex) return; // Same slot, do nothing
        
        // Logic for swapping is handled inside useDeckBuilder's moveSlot? 
        // Actually moveSlot needs to handle the swap logic carefully if validation matters.
        // Assuming moveSlot handles plain swaps for now.
        if (targetIndex !== undefined) {
             moveSlot(sourceIndex, targetIndex);
        }
        return;
    }

    // --- CASE 2: SPELLCASTER SLOT SOURCE ---
    if (active.data.current?.type === 'spellcaster-slot') {
         // Dropped outside -> REMOVE
         if (!over || over.id !== "spellcaster-zone") {
             removeSpellcaster();
         }
         return;
    }

    // --- CASE 3: BROWSER SOURCE ---
    if (!over || !item) return;

    // Check if it's a Spellcaster being dropped
    if ('hero_id' in item) {
        // Accept drops on either spellcaster zone
        if (over.id === 'spellcaster-zone' || over.id === 'spellcaster-zone-forge') {
             setSpellcaster(item as Spellcaster);
        }
        return;
    }

    // It's a Unit -> Slot
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
        id="deck-builder-dnd"
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
        autoScroll={false} // Disable auto-scroll to prevent runaway scrolling
    >
        <div className="h-full flex flex-col md:grid md:grid-rows-[1fr_auto]">
            {/* Mobile Tab Navigation */}
            <div className="md:hidden flex bg-surface-main border-b border-white/10 shrink-0">
                {[
                    { id: 'BROWSER', label: 'Vault', icon: <div className="w-1.5 h-1.5 rounded-full border border-current" /> },
                    { id: 'INSPECTOR', label: 'Inspector', icon: <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> },
                    { id: 'FORGE', label: 'Forge', icon: <AlertTriangle size={14} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveMobileTab(tab.id as 'BROWSER' | 'INSPECTOR' | 'FORGE')}
                        className={cn(
                            "flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-2",
                            activeMobileTab === tab.id 
                                ? "text-brand-accent border-brand-accent bg-white/5" 
                                : "text-gray-500 border-transparent hover:text-gray-300"
                        )}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Top Area: 3 Columns (Desktop) / Tabbed (Mobile) */}
            <div className="row-span-1 min-h-0 flex-1 flex flex-col md:grid md:grid-cols-12 xl:grid-cols-16 border-b border-white/10 bg-surface-main overflow-hidden">
                {/* Left: Unit Browser (3 Cols) */}
                <div className={cn(
                    "md:col-span-3 xl:col-span-4 h-full overflow-hidden md:border-r border-white/10",
                    // Keep visible if active tab is BROWSER OR if we are currently dragging (to prevent unmount)
                    (activeMobileTab === 'BROWSER' || activeDragItem) ? "block" : "hidden md:block"
                )}>
                    <UnitBrowser 
                        items={browserItems} 
                        onSelectItem={handleSelectItem}
                        onQuickAdd={handleQuickAdd}
                    />
                </div>

                {/* Center: Inspector (6 Cols) */}
                <div className={cn(
                    "md:col-span-6 xl:col-span-8 h-full overflow-hidden flex flex-col",
                    activeMobileTab !== 'INSPECTOR' && "hidden md:block"
                )}>
                    <CardInspector 
                        item={selectedItem} 
                         onBack={() => setActiveMobileTab('BROWSER')}
                         onClose={() => setSelectedItem(null)}
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
                <div className={cn(
                    "md:col-span-3 xl:col-span-4 h-full overflow-y-auto border-l border-white/10",
                    activeMobileTab !== 'FORGE' && "hidden md:block"
                )}>
                    <ForgeControls 
                        stats={stats}
                        validation={validation}
                        onClear={clearDeck}
                        deck={deck} // Pass deck for encoding
                    />
                </div>
            </div>

            {/* Bottom Area: Deck Tray */}
            <div className="h-auto bg-surface-main z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                <ActiveDeckTray 
                    slots={deck.slots} 
                    spellcaster={deck.spellcaster}
                    onSelect={handleSelectItem}
                    draggedItem={activeDragItem}
                />
            </div>

            {/* Quick Add Toast */}
            {lastQuickAdd && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-60 bg-brand-primary text-white px-4 py-2 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none whitespace-nowrap">
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-xs font-bold">{lastQuickAdd}</span>
                    </div>
                </div>
            )}

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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={getCardImageUrl(activeDragItem)} 
                            alt={activeDragItem.name} 
                            className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                    </div>
                    {/* Banner */}
                    <div className="h-6 min-h-6 bg-surface-main/95 border-t border-brand-primary/30 flex items-center justify-center px-1">
                        <span className="text-[10px] font-bold text-gray-200 text-center leading-tight truncate w-full">
                            {activeDragItem.name}
                        </span>
                    </div>
                 </div>
            ) : null}
        </DragOverlay>

        {/* Singleton Error Toast */}
        {lastError && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-2xl border border-red-400/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={18} />
                    <span className="font-bold text-sm">{lastError}</span>
                </div>
            </div>
        )}
    </DndContext>
  );
}
