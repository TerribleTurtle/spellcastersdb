"use client";

import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragOverlay, 
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors,
  MeasuringStrategy 
} from "@dnd-kit/core";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Unit, Spellcaster, Spell, Titan } from "@/types/api";
import { useDeckBuilder, STORAGE_KEY_SAVED } from "@/hooks/useDeckBuilder";
import { UnitBrowser } from "./UnitBrowser";
import { CardInspector } from "./CardInspector";
import { ForgeControls } from "./ForgeControls";
import { ActiveDeckTray } from "./ActiveDeckTray";
import { SoloOverview } from "./SoloOverview"; // Added import
import { cn, getCardImageUrl } from "@/lib/utils";
import { Deck } from "@/types/deck"; 
import { Team } from "@/hooks/useTeamBuilder";
import { AlertTriangle, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { validateDeck } from "@/lib/deck-validation";
import { GameImage } from "@/components/ui/GameImage";



interface DeckEditorProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  storageKey: string;
  isTeamMode: boolean;
  onExitTeamMode?: () => void;
  teamSlotIndex?: number | null;
  
  teamName?: string;
  onRenameTeam?: (name: string) => void;
  onSaveTeam?: (deck: Deck) => void;
  activeTeamId?: string | null;

  savedDecksFromApp?: Deck[]; // Optional if we want to pass it down or load it inside
  teamDecks?: [Deck, Deck, Deck] | null;
  onSwitchTeamSlot?: (index: number) => void;
  onSetMode?: (mode: 'SOLO' | 'TEAM') => void;
  savedTeams?: Team[];
  onLoadTeam?: (id: string) => void;
  onDeleteTeam?: (id: string) => void;
  teamHasChanges?: boolean;
  onClearTeam?: () => void;
  onDuplicateTeam?: (id: string) => void;
  onImportSolo?: (deck: Deck) => void;
  onReorderDecks?: (decks: Deck[]) => void;
  onReorderTeams?: (teams: Team[]) => void;
  pendingExternalImport?: Deck | null;
  onClearPendingImport?: () => void;
}


export function DeckEditor({ 
    units, 
    spellcasters, 
    storageKey, 
    isTeamMode, 
    onExitTeamMode,
    teamSlotIndex,
    onCreateTeam,

    teamDecks,
    onSwitchTeamSlot,
    onSetMode,
    savedTeams,
    onLoadTeam,
    onDeleteTeam,
    teamName,
    onRenameTeam,
    onSaveTeam,
    activeTeamId,
    teamHasChanges,
    onClearTeam,
    onDuplicateTeam,
    onImportSolo,
    onReorderDecks,
    onReorderTeams,
    pendingExternalImport,
    onClearPendingImport,
    activeMobileTab = 'BROWSER',
    onSwitchMobileTab
}: DeckEditorProps & { 
    onCreateTeam?: (deck: Deck) => void;
    activeMobileTab?: 'BROWSER' | 'INSPECTOR' | 'FORGE';
    onSwitchMobileTab?: (tab: 'BROWSER' | 'INSPECTOR' | 'FORGE') => void;
}) {
    
  // Initialize Hook with specific key
  const { 
      deck, 
      setSlot, 
      clearSlot, 
      clearDeck, 
      setSpellcaster,
      removeSpellcaster,
      setDeckState,
      moveSlot,
      isEmpty,
      stats,
      validation,
      lastError,
      savedDecks,
      saveDeck,
      loadDeck,
      deleteDeck,
      setDeckName,
      reorderDecks,
      duplicateDeck,
      saveAsCopy,
      saveNow,
      hasChanges
  } = useDeckBuilder(units, spellcasters, storageKey, STORAGE_KEY_SAVED);

  // Used for both Solo and Team overviews
  const [viewSummary, setViewSummary] = useState(false);

  // Import Conflict State
  const [pendingImport, setPendingImport] = useState<Deck | null>(null);

  // Selected Item for Inspector
  const [selectedItem, setSelectedItem] = useState<Unit | Spellcaster | Spell | Titan | null>(null);
  // Dragging Item for Overlay
  const [activeDragItem, setActiveDragItem] = useState<Unit | Spellcaster | Spell | Titan | null>(null);
  
  // Ref to track drag state for event handlers without causing re-renders
  const isDraggingRef = useRef(false);

  // Ref to track clearing state to prevent race conditions with URL sync
  const isClearingRef = useRef(false);

  const router = useRouter();

  // Mobile Navigation State - LIFTED TO PARENT
  // const [activeMobileTab, setActiveMobileTab] = useState<'BROWSER' | 'INSPECTOR' | 'FORGE'>('BROWSER');
  
  // Helper to safely switch tab
  const handleSwitchTab = useCallback((tab: 'BROWSER' | 'INSPECTOR' | 'FORGE') => {
      onSwitchMobileTab?.(tab);
  }, [onSwitchMobileTab]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { 
        activationConstraint: { 
            delay: 150, 
            tolerance: 5 
        } 
    })
  );

  // Ref to track latest deck state for stable callbacks
  const deckRef = useRef(deck);
  useEffect(() => {
      deckRef.current = deck;
  }, [deck]);

  // Sync Deck to URL (Debounced) - REMOVED per user request
  // We no longer sync the URL while editing. URL is only for initial import.
  /*
  useEffect(() => {
     // ...
  }, [deck, isInitialized, isTeamMode]); 
  */ 





  // Handle External Import Trigger (from Preview Mode)
  useEffect(() => {
      if (!pendingExternalImport) return;

      // If workspace is empty OR has no unsaved changes, just load it
      if (isEmpty || !hasChanges) {
          setDeckState(pendingExternalImport);
          onClearPendingImport?.();
          return;
      }

      // Otherwise, trigger conflict modal
      // eslint-disable-next-line
      setPendingImport(pendingExternalImport);
      onClearPendingImport?.();

  }, [pendingExternalImport, isEmpty, hasChanges, setDeckState, onClearPendingImport]);



  // Handlers
  const handleSelectItem = useCallback((item: Unit | Spellcaster | Spell | Titan) => {
    if (isDraggingRef.current) return;
    setSelectedItem(item);
    handleSwitchTab('INSPECTOR');
  }, [handleSwitchTab]);

  // Quick Add Logic
  const [lastQuickAdd, setLastQuickAdd] = useState<string | null>(null);

  const handleQuickAdd = useCallback((item: Unit | Spellcaster | Spell | Titan) => {
      const currentDeck = deckRef.current;

      if ('spellcaster_id' in item) {       setSpellcaster(item as Spellcaster);
          setLastQuickAdd(`${item.name} set as Spellcaster`);
          setTimeout(() => setLastQuickAdd(null), 2000);
          return;
      }

      // It's a Unit, Spell, or Titan
      const entity = item as Unit | Spell | Titan;

      if (entity.category === 'Titan') {
           setSlot(4, entity);
           setLastQuickAdd(`Added ${entity.name} to Titan Slot`);
           setTimeout(() => setLastQuickAdd(null), 2000);
           return;
      }

      const emptySlot = currentDeck.slots.find(s => s.index < 4 && !s.unit);
      
      if (emptySlot) {
          setSlot(emptySlot.index, entity);
          setLastQuickAdd(`Added ${entity.name}`);
          setTimeout(() => setLastQuickAdd(null), 2000);
          return;
      }

      setLastQuickAdd(`Deck Full!`);
      setTimeout(() => setLastQuickAdd(null), 2000);
  }, [setSlot, setSpellcaster]);

  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true;
    const current = event.active.data.current;
    
    if (current?.type === 'slot') {
        setActiveDragItem(current.unit);
        return;
    }

    if (current?.type === 'spellcaster-slot') {
        setActiveDragItem(current.spellcaster);
        return;
    }

    if (current?.item && ('spellcaster_id' in current.item || 'entity_id' in current.item)) {
         const item = current.item as Unit | Spellcaster | Spell | Titan;
         setActiveDragItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    isDraggingRef.current = false;
    const item = activeDragItem;
    setActiveDragItem(null);
    const { over, active } = event;

    if (active.data.current?.type === 'slot') {
        const sourceIndex = active.data.current.index as number;
        
        if (over && (over.id === 'spellcaster-zone' || over.id === 'spellcaster-zone-forge')) {
            return;
        }

        if (!over || !over.id.toString().startsWith("slot-")) {
             clearSlot(sourceIndex as 0|1|2|3|4);
             return;
        }

        const targetIndex = over.data.current?.index as number;
        if (sourceIndex === targetIndex) return;
        
        if (targetIndex !== undefined) {
             moveSlot(sourceIndex, targetIndex);
        }
        return;
    }

    if (active.data.current?.type === 'spellcaster-slot') {
         if (!over || over.id !== "spellcaster-zone") {
             removeSpellcaster();
         }
         return;
    }

    if (!over || !item) return;

    if ('spellcaster_id' in item) {
        if (over.id === 'spellcaster-zone' || over.id === 'spellcaster-zone-forge') {
             setSpellcaster(item as Spellcaster);
        }
        return;
    }

    if (!over.id.toString().startsWith("slot-")) return;

    const slotIndex = over.data.current?.index;

    if (slotIndex !== undefined) {
        setSlot(slotIndex, item as Unit | Spell | Titan);
    }
  };

  const confirmImport = () => {
    if (pendingImport) {
        setDeckState(pendingImport);
        setPendingImport(null);
        router.replace('/deck-builder', { scroll: false });
    }
  };

  const saveAndImport = () => {
      saveDeck(deck.name || "");
      confirmImport();
  };

  const cancelImport = () => {
    setPendingImport(null);
    router.replace('/deck-builder', { scroll: false });
  };

  const handleClearDeck = useCallback(() => {
      isClearingRef.current = true;
      clearDeck();
      
      // Use router.replace to properly update useSearchParams and URL
      const url = new URL(window.location.href);
      url.searchParams.delete('d');
      router.replace(url.pathname + url.search);

      // Reset ref after a delay to allow the URL update to propagate
      setTimeout(() => {
          isClearingRef.current = false;
      }, 500);
  }, [clearDeck, router]);

  const browserItems = useMemo(() => [
      ...spellcasters.map(h => ({ ...h, category: 'Spellcaster' as const })),
      ...units
  ], [spellcasters, units]);

  return (
    <DndContext 
        id="deck-builder-dnd"
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
        autoScroll={false}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always
          }
        }}
        accessibility={{
            restoreFocus: false
        }}
    >
        <div className="h-dvh md:h-full flex flex-col md:grid md:grid-rows-[1fr_auto] overflow-hidden relative min-h-0 overscroll-none">

            
            {/* Mobile Tab Navigation */}
            <div className="md:hidden flex bg-surface-main border-b border-white/10 shrink-0">
                {[
                    { id: 'BROWSER', label: 'Vault', icon: <div className="w-1.5 h-1.5 rounded-full border border-current" /> },
                    { id: 'INSPECTOR', label: 'Inspector', icon: <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> },
                    { id: 'FORGE', label: 'Forge', icon: <AlertTriangle size={14} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleSwitchTab(tab.id as 'BROWSER' | 'INSPECTOR' | 'FORGE')}
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

            {/* Top Area */}
            <div className="row-span-1 min-h-0 flex-1 flex flex-col md:grid md:grid-cols-12 xl:grid-cols-16 border-b border-white/10 bg-surface-main overflow-hidden">
                {/* Unit Browser - Wider Side Panel */}
                <div className={cn(
                    "md:col-span-4 xl:col-span-5 h-full overflow-hidden md:border-r border-white/10",
                    (activeMobileTab === 'BROWSER' || activeDragItem) ? "block" : "hidden md:block"
                )}>
                    <UnitBrowser 
                        items={browserItems} 
                        onSelectItem={handleSelectItem}
                        onQuickAdd={handleQuickAdd}
                    />
                </div>

                {/* Inspector - Thinner Middle Panel */}
                <div className={cn(
                    "md:col-span-4 xl:col-span-6 h-full overflow-hidden flex flex-col",
                    activeMobileTab !== 'INSPECTOR' && "hidden md:block"
                )}>
                    <CardInspector 
                        item={selectedItem} 
                        currentDeck={deck}
                         onBack={() => handleSwitchTab('BROWSER')}
                         onClose={() => setSelectedItem(null)}
                        onAddSlot={(idx) => {
                            if (selectedItem && !('spellcaster_id' in selectedItem)) {
                                setSlot(idx, selectedItem as Unit);
                            }
                        }}
                        onSetSpellcaster={() => {
                            if (selectedItem && 'spellcaster_id' in selectedItem) {
                                setSpellcaster(selectedItem as Spellcaster);
                            }
                        }}
                    />
                </div>

                {/* Forge Controls - Wider Side Panel */}
                <div className={cn(
                    "md:col-span-4 xl:col-span-5 h-full overflow-hidden border-l border-white/10",
                    activeMobileTab !== 'FORGE' && "hidden md:block"
                )}>
                    <div className="h-full p-4 flex flex-col gap-4 overflow-hidden">
                        <ForgeControls 
                            stats={stats}
                            validation={validation}
                            onClear={handleClearDeck}
                            deck={deck}
                            savedDecks={savedDecks}
                            onSave={saveDeck}
                            onSaveAsCopy={saveAsCopy}
                            onLoad={loadDeck}
                            onDelete={deleteDeck}
                            onRename={setDeckName}
                            onDuplicate={duplicateDeck}
                            isTeamMode={isTeamMode}
                            onSetMode={onSetMode}
                            savedTeams={savedTeams}
                            onLoadTeam={onLoadTeam}
                            onDeleteTeam={onDeleteTeam}
                            // Team Editing Props
                            teamName={teamName}
                            onRenameTeam={onRenameTeam}
                            activeTeamId={activeTeamId}
                            onSaveTeam={() => {
                                saveNow();
                                onSaveTeam?.(deck);
                            }}
                            hasChanges={hasChanges}
                            teamHasChanges={teamHasChanges}
                            onClearTeam={onClearTeam}
                            onDuplicateTeam={onDuplicateTeam}
                            onImportSolo={onImportSolo}
                            onReorderDecks={onReorderDecks || reorderDecks}
                            onReorderTeams={onReorderTeams}
                            teamDecks={teamDecks}
                        >
                            {/* Actions Menu for Solo Decks (Import Logic) */}
                            {/* Mode Context / Switcher - Hidden in Solo Mode */}
                            {!isTeamMode ? (
                                <div className="w-full flex flex-col gap-2 p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">
                                     <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                                              Solo Deck
                                          </span>
                                          <button 
                                            disabled={!deck.spellcaster && deck.slots.every(s => !s.unit)}
                                            onClick={() => {
                                                setViewSummary(true);
                                            }}
                                            title={(!deck.spellcaster && deck.slots.every(s => !s.unit)) ? "Add cards to view overview" : "View Deck Overview"}
                                            className="text-[10px] font-bold uppercase tracking-widest text-white bg-brand-primary hover:bg-brand-primary/80 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                                          >
                                            {(!deck.spellcaster && deck.slots.every(s => !s.unit)) ? "Empty Deck" : "Deck Overview"}
                                          </button>
                                     </div>
                                </div>
                            ) : (
                                 <div className="w-full flex flex-col gap-2 p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">
                                     {/* Team Context Header */}
                                     <div className="flex items-center justify-between mb-2">
                                         <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                                             Team Loadout
                                         </span>
                                         {/* Done / View Summary Button */}
                                          <button 
                                            onClick={() => {
                                                if (onExitTeamMode) onExitTeamMode();
                                            }}
                                            className="text-[10px] font-bold uppercase tracking-widest text-white bg-brand-primary hover:bg-brand-primary/80 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                                          >
                                            <Users size={12} /> Team Overview
                                          </button>
                                     </div>
                                     
                                     {/* Slot Switcher */}
                                     <div className="flex gap-2">
                                         {[0, 1, 2].map(idx => {
                                             const isActive = teamSlotIndex === idx;
                                             const slotDeck = isActive ? deck : (teamDecks ? teamDecks[idx] : null);
                                             const validation = slotDeck ? validateDeck(slotDeck) : null;
                                             
                                             return (
                                                 <button
                                                     key={idx}
                                                     onClick={() => {
                                                         if (isActive) return;
                                                         if (hasChanges) saveNow();
                                                         if (onSwitchTeamSlot) onSwitchTeamSlot(idx);
                                                     }}
                                                     className={cn(
                                                         "flex-1 relative h-16 rounded border transition-all overflow-hidden text-left group",
                                                         isActive 
                                                             ? "border-brand-primary ring-1 ring-brand-primary shadow-lg shadow-brand-primary/20" 
                                                             : "border-white/10 hover:border-white/30 bg-black/20"
                                                     )}
                                                 >
                                                     {slotDeck?.spellcaster ? (
                                                         <div className="absolute inset-0">
                                                             <GameImage 
                                                                 src={getCardImageUrl(slotDeck.spellcaster)} 
                                                                 alt="" 
                                                                 fill
                                                                 className={cn(
                                                                     "object-cover object-top opacity-50 transition-opacity",
                                                                     isActive ? "opacity-100" : "group-hover:opacity-70"
                                                                 )}
                                                             />
                                                             <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent p-1">
                                                                 <div className="text-[9px] font-bold text-white truncate leading-tight">
                                                                     {slotDeck.name || "Untitled"}
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     ) : (
                                                         <div className="absolute inset-0 flex items-center justify-center bg-white/5 group-hover:bg-white/10">
                                                             <span className="text-[10px] font-bold text-gray-500 uppercase">Empty</span>
                                                         </div>
                                                     )}
                                                     
                                                     {/* Slot Number Badge */}
                                                     <div className="absolute top-0.5 left-0.5 bg-black/60 backdrop-blur-sm px-1 rounded text-[8px] font-mono text-gray-300">
                                                         {idx + 1}
                                                     </div>

                                                     {/* Validation Status Dot */}
                                                     {validation && (
                                                         <div className={cn(
                                                             "absolute top-0.5 right-0.5 w-3 h-3 rounded-full flex items-center justify-center border shadow-sm",
                                                              validation.isValid 
                                                                 ? "bg-green-500 border-green-400 text-white" 
                                                                 : "bg-red-500 border-red-400 text-white"
                                                         )} title={validation.isValid ? "Valid" : "Invalid"}>
                                                             {validation.isValid 
                                                                 ? <CheckCircle2 size={8} strokeWidth={3} /> 
                                                                 : <AlertCircle size={8} strokeWidth={3} />
                                                             }
                                                         </div>
                                                     )}
                                                 </button>
                                             );
                                         })}
                                     </div>
                                 </div>
                            )}
                        </ForgeControls>
                    </div>
                </div>
            </div>

            {/* Bottom Area: Deck Tray */}
            <div className="h-auto bg-surface-main z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] pb-[calc(env(safe-area-inset-bottom)+20px)]">
                     <ActiveDeckTray 
                        slots={deck.slots} 
                        spellcaster={deck.spellcaster}
                        onSelect={handleSelectItem} 
                        draggedItem={activeDragItem}
                        validation={validation}
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
                    <div className="bg-surface-card border border-brand-primary/50 rounded-lg p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">Unsaved Deck Changes</h3>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6">
                            You have an active deck in your workspace. Would you like to save it before loading the shared deck?
                        </p>
                        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                            <button 
                                onClick={cancelImport}
                                className="px-4 py-2 rounded text-sm font-bold text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmImport}
                                className="px-4 py-2 rounded text-sm font-bold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                            >
                                Discard & Load
                            </button>
                            <button 
                                onClick={saveAndImport}
                                className="px-6 py-2 rounded text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary/80 shadow-lg shadow-brand-primary/20 transition-all hover:scale-105"
                            >
                                Save & Load
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
            {activeDragItem ? (
                <div className="w-32 h-auto aspect-3/4 bg-surface-card border-2 border-brand-primary rounded-lg shadow-2xl overflow-hidden pointer-events-none flex flex-col">
                    <div className="relative flex-1 overflow-hidden bg-gray-800">
                        <GameImage 
                            src={getCardImageUrl(activeDragItem)} 
                            alt={activeDragItem.name} 
                            fill
                            className="object-cover object-top"
                        />
                    </div>
                    <div className="h-6 min-h-6 bg-surface-main/95 border-t border-brand-primary/30 flex items-center justify-center px-1">
                        <span className="text-[10px] font-bold text-gray-200 text-center leading-tight truncate w-full">
                            {activeDragItem.name}
                        </span>
                    </div>
                 </div>
            ) : null}
        </DragOverlay>

            {/* Solo Overview Overlay */}
            {!isTeamMode && viewSummary && (
                <div 
                    className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
                    onClick={() => setViewSummary(false)}
                >
                    <div 
                        className="w-full max-w-6xl h-full max-h-[90vh] bg-surface-main rounded-xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SoloOverview 
                            deck={deck}
                            onEdit={() => setViewSummary(false)}
                            onCreateTeam={onCreateTeam}
                            onBack={() => setViewSummary(false)}
                        />
                    </div>
                </div>
            )}

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
