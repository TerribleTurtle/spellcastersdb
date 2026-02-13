"use client";

import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ChevronUp, ChevronsDown, Save, Edit2, Trash2, Share2, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

import { UnifiedEntity, Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { useTeamBuilder } from "@/components/deck-builder/hooks/domain/useTeamBuilder";

import { useDeckEditorUI } from "@/components/deck-builder/hooks/ui/useDeckEditorUI";
import { UnitBrowser } from "../../features/browser/UnitBrowser";
import { DeckDrawer } from "../../features/overlays/DeckDrawer";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { SaveDeckModal } from "@/components/modals/SaveDeckModal";

import { useDeckStore } from "@/store/index";
import { Deck } from "@/types/deck";
import { useToast } from "@/hooks/useToast";
import { v4 as uuidv4 } from "uuid";
import { INITIAL_DECK } from "@/services/data/persistence";
import { isDeckEmpty } from "@/services/deck-utils";

const TRAY_EXPANDED_HEIGHT = 180;
const TRAY_COLLAPSED_HEIGHT = 48;

interface TeamEditorLayoutProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  pendingExternalImport?: Deck | null;
  onClearPendingImport?: () => void;
  onImportSolo?: (deck: Deck) => void;
}

import { useAccordionState } from "@/hooks/useAccordionState";

// ... existing imports

export function TeamEditorLayout({ 
    units, 
    spellcasters, 
}: TeamEditorLayoutProps) {
  const { openCommandCenter, openInspector: originalOpenInspector } = useDeckStore();
  
  // Debug wrapper
  const openInspector = (item: UnifiedEntity, pos?: { x: number; y: number }) => {
      originalOpenInspector(item, pos);
  };
  
  const {
    activeSlot,
    setActiveSlot,
    teamName,
    teamDecks,
  } = useTeamBuilder();

  // State for expanded trays
  const { 
    expandedState, 
    toggle: toggleDeck, 
    collapseAll, 
    expandAll, 
    areAllCollapsed 
  } = useAccordionState(3, 0);

  const [deckToClear, setDeckToClear] = useState<number | null>(null);
  const [deckToExport, setDeckToExport] = useState<Deck | null>(null);

  // Auto-select Slot 1 if none selected
  // Optimization: This should ideally be done in the store/hook initialization to avoid effect
  // For now, we keep it but ensure it doesn't cause loops
  useEffect(() => {
    if (activeSlot === null) {
        // We only set this ONCE on mount if null
        setActiveSlot(0);
    }
    
    // Desktop: Default to Expand All
    if (window.innerWidth >= 768) {
        expandAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount
  
// toggleDeck, collapseAll, expandAll, areAllCollapsed removed (now from hook)
  
  // Renaming Handler
  const { setTeamDecks } = useDeckStore(); // Need access to setter
  const handleRename = (index: number, name: string) => {
      if (!teamDecks) return;
      const newDecks = [...teamDecks] as [Deck, Deck, Deck];
      newDecks[index] = { ...newDecks[index], name };
      setTeamDecks(newDecks);
  };
  
  const footerHeight = expandedState.reduce((acc, expanded) => acc + (expanded ? TRAY_EXPANDED_HEIGHT : TRAY_COLLAPSED_HEIGHT), 0);

  const { showToast } = useToast();
  const { clearDeck, saveTeam, activeTeamId, importDeckToLibrary } = useDeckStore(
      useShallow(state => ({
          clearDeck: state.clearDeck,
          saveTeam: state.saveTeam,
          activeTeamId: state.activeTeamId,
          importDeckToLibrary: state.importDeckToLibrary
      }))
  );

  const handleTeamSave = () => {
      const targetId = activeTeamId || uuidv4();
      saveTeam(targetId, teamName, activeSlot ?? undefined, undefined); 
      showToast("Team saved successfully", "success");
  };

  const handleTeamShare = async () => {
    if (!teamDecks) return;
    const { encodeTeam } = await import("@/services/encoding");
    const hash = encodeTeam(teamDecks, teamName);
    const url = `${window.location.origin}${window.location.pathname}?team=${hash}`;

    const success = await copyToClipboard(url);
    if (success) {
        showToast("Team Link Copied!", "success");
    }
  };




  const {
    browserItems,
    handleQuickAdd,
  } = useDeckEditorUI(units, spellcasters);

  return (
    <>
    <div className="h-full flex flex-col relative bg-surface-main overflow-hidden md:grid md:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_840px] md:grid-rows-[auto_1fr]">
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-surface-main z-20 md:col-span-2">
        <div className="flex items-center gap-2">
           {/* Team Name Input */}
           <div className="relative group flex items-center gap-2 shrink mr-2 min-w-0">
              <input 
                 value={teamName || ""}
                 onChange={(e) => useDeckStore.getState().setTeamName(e.target.value)}
                 style={{ width: `${Math.max((teamName || "").length, 14) + 4}ch` }}
                 className="bg-transparent border-b-2 border-transparent hover:border-white/20 focus:border-brand-primary transition-all text-xl md:text-2xl font-black text-white uppercase tracking-wider focus:outline-none py-1 truncate min-w-[200px]"
                 placeholder="UNTITLED TEAM"
              />
              <Edit2 size={14} className="text-gray-500 shrink-0" />
           </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
            {/* Library */}


            {/* Save Team Button */}
            <button
                onClick={handleTeamSave}
                className={cn(
                    "flex items-center gap-2 p-2 md:px-3 md:py-1.5 rounded-lg transition-all border",
                    !!activeTeamId
                        ? "bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20"
                        : "bg-brand-primary/10 text-brand-primary border-brand-primary/50 hover:border-brand-primary hover:bg-brand-primary/20"
                )}
                title={!!activeTeamId ? "Team Saved" : "Save Team"}
            >
                {!!activeTeamId ? <Check size={18} className="md:w-3.5 md:h-3.5" /> : <Save size={18} className="md:w-3.5 md:h-3.5" />}
                <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">{!!activeTeamId ? "Saved" : "Save Team"}</span>
            </button>

             {/* Share Team */}
             <button 
                  onClick={handleTeamShare}
                  className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded transition-colors"
                  title="Share Team"
             >
                 <Share2 size={18} />
             </button>



            {/* Clear Team Button */}
             <button 
                   onClick={() => useDeckStore.getState().clearTeam()}
                   className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                   title="Clear Team"
              >
                  <Trash2 size={18} />
              </button>

            {/* Collapse/Expand All Control - HIDDEN (Drawers forced expanded on Desktop) */}
            <button 
                onClick={areAllCollapsed ? expandAll : collapseAll}
                className="ml-2 p-1.5 text-xs font-bold text-brand-secondary hover:text-white uppercase tracking-wider border border-white/10 rounded items-center gap-1 hidden"
                title={areAllCollapsed ? "Expand All Decks" : "Collapse All Decks"}
            >
                {areAllCollapsed ? <ChevronUp size={14} /> : <ChevronsDown size={14} />}
                {areAllCollapsed ? "Expand" : "Collapse"}
            </button>
             {/* Mobile Icon Only */}
             <button 
                onClick={areAllCollapsed ? expandAll : collapseAll}
                className="p-2 text-gray-400 hover:text-white md:hidden"
            >
                {areAllCollapsed ? <ChevronUp size={18} /> : <ChevronsDown size={18} />}
            </button>
        </div>
      </div>

      {/* Main Content: Vault */}
      <section 
        aria-label="Unit Library"
        className="flex-1 overflow-hidden relative transition-[padding] duration-300 ease-in-out md:col-start-1 md:row-start-2 md:pb-0! md:border-r md:border-white/10"
        style={{ paddingBottom: `${footerHeight}px` }}
      > 
          <UnitBrowser
            items={browserItems}
            onSelectItem={openInspector}
            onQuickAdd={handleQuickAdd}
          />
      </section>

      {/* Stacked Decks Container */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col justify-end pointer-events-none pb-[max(0px,env(safe-area-inset-bottom))] md:static md:col-start-2 md:row-start-2 md:h-full md:pb-32 md:justify-start md:border-l md:border-white/10 md:bg-surface-main/50 md:pointer-events-auto md:overflow-y-auto">
          {teamDecks?.map((deck, idx) => (
             <DeckDrawer
                key={idx}
                deck={deck}
                onSelect={openInspector}
                variant="static"
                slotIndex={idx} // Connects to Store
                isExpanded={expandedState[idx]}
                onToggle={(val) => {
                    toggleDeck(idx, val);
                    if(val) setActiveSlot(idx); 
                }}
                onRename={(name) => handleRename(idx, name)}
                onImport={() => {
                    setActiveSlot(idx);
                    useDeckStore.getState().setIsImporting(true);
                    openCommandCenter();
                }}
                onSave={handleTeamSave}
                isSaved={!!activeTeamId}
                onShare={handleTeamShare}
                onExportToSolo={() => {
                   setDeckToExport(deck);
                }}
                hideGlobalActions={true}
                onClear={() => {
                     // Smart Clear Logic for Slot
                     const isEmpty = isDeckEmpty(deck);
                     
                     if (isEmpty) {
                         if (activeSlot === idx) {
                             clearDeck(); 
                         } else {
                             const newDecks = [...teamDecks] as [Deck, Deck, Deck];
                             newDecks[idx] = { ...INITIAL_DECK, id: uuidv4(), name: "New Deck" };
                             setTeamDecks(newDecks);
                         }
                     } else {
                        setDeckToClear(idx);
                     }
                }}
                className="border-b-0 first:border-t-0 border-t border-brand-primary/20 shadow-lg pointer-events-auto" 
             />
          ))}
      </div>
      

    </div>

    {deckToClear !== null && (
        <DeleteConfirmationModal
            title={`Clear Slot ${deckToClear + 1}?`}
            description={
                <>
                    Are you sure you want to clear <span className="text-white font-bold">{teamDecks?.[deckToClear]?.name || "this deck"}</span>?
                    <br/><br/>
                    This action cannot be undone.
                </>
            }
            confirmText="Clear Deck"
            onCancel={() => setDeckToClear(null)}
            onConfirm={() => {
                if (teamDecks) {
                    if (activeSlot === deckToClear) {
                        clearDeck();
                    } else {
                        const newDecks = [...teamDecks] as [Deck, Deck, Deck];
                        newDecks[deckToClear] = { ...INITIAL_DECK, id: uuidv4(), name: "New Deck" };
                        setTeamDecks(newDecks);
                    }
                }
                setDeckToClear(null);
            }}
        />
    )}
    
    {deckToExport && (
        <SaveDeckModal 
            deck={deckToExport}
            isOpen={!!deckToExport}
            onClose={() => setDeckToExport(null)}
            onSave={(newName) => {
                importDeckToLibrary({ ...deckToExport, name: newName });
                showToast(`"${newName}" saved to Solo Library`, "success");
                setDeckToExport(null);
            }}
        />
    )}
    </>
  );
}
