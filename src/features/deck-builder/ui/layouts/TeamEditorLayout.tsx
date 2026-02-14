"use client";

import { ChevronUp, ChevronsDown, Save, Edit2, Share2, Check, Eraser, Copy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

import { UnifiedEntity, Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { BrowserItem } from "@/types/browser";

import { useDeckEditorUI } from "@/features/deck-builder/hooks/ui/useDeckEditorUI";
import { UnitBrowser } from "@/features/deck-builder/browser/UnitBrowser";
import { SaveDeckModal } from "@/components/modals/SaveDeckModal";
import { TeamDeckEditorRow } from "@/features/team-builder/components/TeamDeckEditorRow";
import { SwapModeBanner } from "@/features/deck-builder/ui/overlays/SwapModeBanner";

import { useDeckStore } from "@/store/index";
import { useShallow } from "zustand/react/shallow";
import { Deck } from "@/types/deck";
import { useToast } from "@/hooks/useToast";

interface TeamEditorLayoutProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  pendingExternalImport?: Deck | null;
  onClearPendingImport?: () => void;
  onImportSolo?: (deck: Deck) => void;
}

import { UnsavedChangesModal } from "@/components/modals/UnsavedChangesModal";

import { InspectorPanel } from "@/features/shared/inspector/InspectorPanel";
import { useTeamEditor } from "@/features/deck-builder/hooks/ui/useTeamEditor";

export function TeamEditorLayout({ 
    units, 
    spellcasters, 
}: TeamEditorLayoutProps) {
  const { openInspector: originalOpenInspector, mode, setMode, pendingSwapCard, setPendingSwapCard } = useDeckStore(useShallow(state => ({
      openInspector: state.openInspector,
      mode: state.mode,
      setMode: state.setMode,
      pendingSwapCard: state.pendingSwapCard,
      setPendingSwapCard: state.setPendingSwapCard
  })));
  
  // Debug wrapper
  const openInspector = (item: UnifiedEntity, pos?: { x: number; y: number }) => {
      originalOpenInspector(item, pos);
  };
  const { showToast } = useToast();
  
  const {
      teamName,
      setTeamName,
      teamDecks,
      handleTeamSave,
      handleTeamClear,
      performSlotClear,
      handleTeamShare,
      importDeckToLibrary,
      clearTeam,
      isTeamSaved,
      isExistingTeam,
      activeTeamId,
      saveTeamAsCopy,
      accordion,
      footerHeight,
      showUnsavedTeamModal, setShowUnsavedTeamModal,
      slotToClear, setSlotToClear,
      deckToExport, setDeckToExport
  } = useTeamEditor();

  const { 
      expandedState, 
      collapseAll, 
      expandAll, 
      areAllCollapsed 
  } = accordion;


  const {
    browserItems,
    handleQuickAdd,
  } = useDeckEditorUI(units, spellcasters);
  
  const isSwapMode = !!pendingSwapCard;

  return (
    <>
    {/* Grid Layout:
        Mobile: Flex Column (standard).
        Desktop (XL): Grid with 2 columns.
        Row 1: Header (Col Span 2)
        Row 2: Content
            Col 1: Browser
            Col 2: Inspector (Top) + Drawer Stack (Bottom)
    */}
    <div className="h-full flex flex-col relative bg-surface-main overflow-hidden xl:grid xl:grid-cols-[1fr_640px] xl:grid-rows-[auto_1fr]">
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-surface-main z-20 xl:col-span-2">
        <div className="flex items-center gap-2">
           {/* Team Name Input */}
           <div className="relative group flex items-center gap-2 shrink mr-2 min-w-0 max-w-[150px] md:max-w-none">
              <input 
                 value={teamName || ""}
                 onChange={(e) => setTeamName(e.target.value)}
                 style={{ width: `${Math.max((teamName || "").length, 14) + 4}ch` }}
                 className="bg-transparent border-b-2 border-transparent hover:border-white/20 focus:border-brand-primary transition-all text-xl md:text-2xl font-black text-white uppercase tracking-wider focus:outline-none py-1 truncate min-w-[50px] w-full"
                 placeholder="UNTITLED TEAM"
              />
               <Edit2 size={14} className="text-gray-500 shrink-0" />
           </div>
       </div>
        
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
            {/* Mode Switcher */}
            <div className="flex items-center bg-black/20 p-1 rounded-lg border border-white/5 mr-2">
                <button
                    onClick={() => setMode("SOLO")}
                    className={cn(
                        "px-3 py-1 text-xs font-bold uppercase rounded transition-all",
                        mode === "SOLO" 
                            ? "bg-brand-primary text-white shadow-sm" 
                            : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    Solo
                </button>
                <button
                    onClick={() => setMode("TEAM")}
                    className={cn(
                        "px-3 py-1 text-xs font-bold uppercase rounded transition-all",
                        mode === "TEAM" 
                            ? "bg-brand-primary text-white shadow-sm" 
                            : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    Team
                </button>
            </div>

            {/* Library */}


            {/* Save Team Button */}
            <button
                onClick={handleTeamSave}
                className={cn(
                    "flex items-center gap-2 p-2 md:px-3 md:py-1.5 rounded-lg transition-all border",
                    !!activeTeamId && isTeamSaved
                        ? "bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20"
                        : "bg-brand-primary/10 text-brand-primary border-brand-primary/50 hover:border-brand-primary hover:bg-brand-primary/20"
                )}
                title={!!activeTeamId && isTeamSaved ? "Team Saved" : isExistingTeam ? "Update Team" : "Save Team"}
            >
                {!!activeTeamId && isTeamSaved ? (
                     <Check size={18} className="md:w-3.5 md:h-3.5" />
                ) : isExistingTeam ? (
                     <RefreshCw size={18} className="md:w-3.5 md:h-3.5" />
                ) : (
                     <Save size={18} className="md:w-3.5 md:h-3.5" />
                )}
                <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                    {!!activeTeamId && isTeamSaved ? "Saved" : isExistingTeam ? "Update" : "Save Team"}
                </span>
            </button>

             {/* Save Copy (Only existing teams) */}
             {isExistingTeam && (
                  <button
                      onClick={() => {
                          saveTeamAsCopy();
                          showToast("Team copied successfully", "success");
                      }}
                      className="p-2 md:px-3 md:py-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors border border-white/5"
                      title="Save as Copy"
                  >
                      <Copy size={18} className="md:w-3.5 md:h-3.5" />
                      <span className="hidden md:inline ml-2 text-xs font-bold uppercase tracking-wider">
                        Save Copy
                      </span>
                  </button>
              )}

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
                   onClick={handleTeamClear}
                   className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                   title="Clear Team"
              >
                  <Eraser size={18} />
              </button>

             {/* Mobile Icon Only */}
             <button 
                onClick={areAllCollapsed ? expandAll : collapseAll}
                className="p-2 text-gray-400 hover:text-white"
            >
                {areAllCollapsed ? <ChevronUp size={18} /> : <ChevronsDown size={18} />}
            </button>
        </div>
      </div>

      {/* Main Content: Vault */}
      <section 
        aria-label="Unit Library"
        className="flex-1 overflow-hidden relative transition-[padding] duration-300 ease-in-out xl:col-start-1 xl:row-start-2 xl:pb-0! xl:border-r xl:border-white/10"
        style={{ paddingBottom: `${footerHeight}px` }}
      >
        {pendingSwapCard && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[90%] w-auto">
               <SwapModeBanner 
                  pendingCard={pendingSwapCard}
                  onCancel={() => setPendingSwapCard(null)}
               />
            </div>
        )}
        
        <div className={cn("w-full h-full", isSwapMode && "opacity-40 grayscale pointer-events-none select-none")}>
            <UnitBrowser
                items={browserItems as BrowserItem[]}
                onSelectItem={openInspector}
                onQuickAdd={handleQuickAdd}
            />
        </div>
      </section>

      {/* Right Column: Inspector (Top) + Stacked Decks (Bottom) */}
      <div className="hidden xl:flex xl:col-start-2 xl:row-start-2 xl:flex-col xl:justify-between xl:gap-4 xl:h-full xl:overflow-hidden">
          
           {/* Inspector fills remaining space but shrink wraps */}
           <div className="flex-initial shrink min-h-0 max-h-full flex flex-col">
                <InspectorPanel className="h-auto max-h-full border border-white/10 rounded-xl shadow-lg overflow-hidden" />
           </div>

           {/* Stacked Decks Container - Boxed at bottom of column */}
           <div className="shrink-0 flex flex-col border border-white/10 rounded-xl shadow-lg overflow-hidden bg-surface-main/50">
               {teamDecks?.map((_, idx) => (
                  <TeamDeckEditorRow
                    key={idx}
                    index={idx}
                    isExpanded={accordion.expandedState[idx]}
                    onToggle={accordion.toggle}
                    idSuffix="desktop"
                    hideGlobalActions
                  />
               ))}
           </div>
      </div>
      
      {/* Mobile Stacked Decks Container (Fixed Bottom) */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex flex-col justify-end pointer-events-none pb-[max(0px,env(safe-area-inset-bottom))]",
        "xl:hidden"
      )}>
          {teamDecks?.map((_, idx) => (
             <TeamDeckEditorRow
                key={idx}
                index={idx}
                isExpanded={expandedState[idx]}
                onToggle={accordion.toggle}
                idSuffix="mobile"
                hideGlobalActions
             />
          ))}
      </div>
      
      {/* Modals */}
      
      {/* Unsaved Changes for Clear TEAM */}
      <UnsavedChangesModal 
          isOpen={showUnsavedTeamModal}
          title="Clear Team?"
          description="You have unsaved changes in this team. Do you want to return to save them, or clear anyway?"
          onCancel={() => setShowUnsavedTeamModal(false)}
          onDiscard={() => {
               clearTeam();
               setShowUnsavedTeamModal(false);
          }}
      />
      
      {/* Unsaved Changes for Clear SLOT */}
      <UnsavedChangesModal 
          isOpen={slotToClear !== null}
          title={`Clear Slot ${slotToClear !== null ? slotToClear + 1 : ''}?`}
          description={
            <>
                You have unsaved changes in this Team. Clearing <span className="text-white font-bold">{teamDecks && slotToClear !== null ? teamDecks[slotToClear].name : "this deck"}</span> will impact the team.
                <br/>
                Do you want to return to Save the Team before clearing this slot?
            </>
          }
          onCancel={() => setSlotToClear(null)}
          onDiscard={() => {
               if (slotToClear !== null) performSlotClear(slotToClear);
               setSlotToClear(null);
          }}
      />

    </div>
    
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
