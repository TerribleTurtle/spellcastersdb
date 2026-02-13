"use client";

import React from "react";



import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { useDeckBuilder } from "@/components/deck-builder/hooks/domain/useDeckBuilder";
import { useDeckEditorUI } from "@/components/deck-builder/hooks/ui/useDeckEditorUI";
import { UnitBrowser } from "@/components/deck-builder/features/browser/UnitBrowser";
import { SoloOverview } from "@/components/deck-builder/features/overlays/SoloOverview";
import { DeckDrawer } from "@/components/deck-builder/features/overlays/DeckDrawer";
import { useDeckStore } from "@/store/index";
import { selectIsSaved } from "@/store/selectors";
import { useToast } from "@/hooks/useToast";
import { Deck } from "@/types/deck";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { Edit2, Save, Check, Share2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { encodeDeck } from "@/services/encoding";
import { copyToClipboard } from "@/lib/clipboard";

interface SoloEditorLayoutProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  // onSetMode removed
  onImportSolo?: (deck: Deck) => void;
}

export function SoloEditorLayout({ units, spellcasters }: SoloEditorLayoutProps) {
  const { openInspector, setDeckName, openCommandCenter } = useDeckStore();
  const {
    currentDeck,
  } = useDeckBuilder();

  // Manage drawer state locally to allow toggling, but default to open
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);
  const [showClearModal, setShowClearModal] = React.useState(false);
  
  const footerHeight = isDrawerOpen ? 180 : 48;



  const {
    viewSummary,
    browserItems,
    handleQuickAdd,
    closeSummary,
  } = useDeckEditorUI(units, spellcasters);


  const saveDeck = useDeckStore(state => state.saveDeck);
  const clearDeck = useDeckStore(state => state.clearDeck);
  const isSaved = useDeckStore(selectIsSaved);
  
  const { showToast } = useToast();

  const handleSave = () => {
      saveDeck();
      showToast("Deck saved successfully", "success");
  };

  const handleClear = () => {
       if (isSaved) {
           clearDeck();
       } else {
           setShowClearModal(true);
       }
  };

  const handleShare = async () => {
    const hash = encodeDeck(currentDeck);
    const url = `${window.location.origin}${window.location.pathname}?d=${hash}`;

    const success = await copyToClipboard(url);
    if (success) {
      showToast("Deck Link Copied!", "success");
    }
  };

  return (
    <>
    <div className="h-full flex flex-col relative bg-surface-main overflow-hidden xl:grid xl:grid-cols-[1fr_840px] xl:grid-rows-[auto_1fr]">
      {/* Secondary Header (Solo) */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-surface-main z-20 xl:col-span-2">
          {/* Deck Name Input */}
          <div className="relative group flex items-center gap-2 shrink mr-2 min-w-0">
               <input 
                  value={currentDeck?.name || ""}
                  onChange={(e) => setDeckName(e.target.value)}
                  style={{ width: `${Math.max((currentDeck?.name || "").length, 14) + 4}ch` }}
                  className="bg-transparent border-b-2 border-transparent hover:border-white/20 focus:border-brand-primary transition-all text-xl md:text-2xl font-black text-white uppercase tracking-wider focus:outline-none py-1 truncate min-w-[200px]"
                  placeholder="UNTITLED DECK"
               />
               <Edit2 size={14} className="text-gray-500 shrink-0" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
             {/* Library */}

             
              {/* Save */}
              <button
                  onClick={handleSave}
                  className={cn(
                      "flex items-center gap-2 p-2 md:px-3 md:py-1.5 rounded-lg transition-all border",
                      isSaved 
                        ? "bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20"
                        : "bg-brand-primary/10 text-brand-primary border-brand-primary/50 hover:bg-brand-primary/20 hover:border-brand-primary"
                  )}
                  title={isSaved ? "Deck Saved" : "Save Deck"}
              >
                  {isSaved ? <Check size={18} className="md:w-3.5 md:h-3.5" /> : <Save size={18} className="md:w-3.5 md:h-3.5" />}
                  <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">{isSaved ? "Saved" : "Save"}</span>
              </button>

              {/* Share */}
              <button 
                   onClick={handleShare}
                   className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded transition-colors"
                   title="Share"
              >
                  <Share2 size={18} />
              </button>

              {/* Clear */}
              <button 
                   onClick={handleClear}
                   className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                   title="Clear Deck"
              >
                  <Trash2 size={18} />
              </button>
          </div>
      </div>

      {/* Main Content: Vault */}
      <section 
        aria-label="Unit Library"
        className="flex-1 overflow-hidden relative transition-[padding] duration-300 ease-in-out xl:col-start-1 xl:row-start-2 xl:pb-0! xl:border-r xl:border-white/10"
        style={{ paddingBottom: `${footerHeight}px` }}
      >
          <UnitBrowser
            items={browserItems}
            onSelectItem={openInspector}
            onQuickAdd={handleQuickAdd}
          />
      </section>

      {/* Deck Drawer */}
      <DeckDrawer 
        deck={currentDeck}
        onSelect={openInspector}
        variant="fixed"
        isExpanded={isDrawerOpen}
        onToggle={setIsDrawerOpen}
        onRename={setDeckName}
        isSaved={isSaved}
        onSave={handleSave}
        onClear={handleClear}
        onLibraryOpen={openCommandCenter}
        onShare={handleShare}
        hideGlobalActions={true}
        className="xl:col-start-2 xl:row-start-2 xl:static xl:w-full xl:h-full xl:border-l xl:border-t-0 xl:bg-surface-main/50"
      />

    </div>

      {/* Solo Overview Overlay */}
      {viewSummary && (
        <div
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={closeSummary}
        >
          <div
            className="w-full max-w-6xl h-full max-h-[90vh] bg-surface-main rounded-xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SoloOverview
              deck={currentDeck}
              onEdit={closeSummary}
              onBack={closeSummary}
            />
          </div>
        </div>
      )}
    {showClearModal && (
        <DeleteConfirmationModal 
            title="Clear Deck?"
            description={
                <>
                    Are you sure you want to clear <span className="text-white font-bold">{currentDeck?.name || "this deck"}</span>?
                    <br/><br/>
                    Unsaved changes will be lost.
                </>
            }
            confirmText="Clear Deck"
            onCancel={() => setShowClearModal(false)}
            onConfirm={() => {
                clearDeck();
                setShowClearModal(false);
            }}
        />
    )}
    </>
  );
}
