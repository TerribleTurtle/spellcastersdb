"use client";

import React from "react";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { useDeckBuilder } from "@/features/deck-builder/hooks/domain/useDeckBuilder";
import { useDeckEditorUI } from "@/features/deck-builder/hooks/ui/useDeckEditorUI";

import { SoloOverview } from "@/features/deck-builder/overlays/SoloOverview";
import { useDeckStore } from "@/store/index";
import { selectIsSaved, selectIsExistingDeck } from "@/store/selectors";
import { useToast } from "@/hooks/useToast";
import { Deck } from "@/types/deck";
import { UnsavedChangesModal } from "@/components/modals/UnsavedChangesModal";
import { Edit2, Save, Check, Share2, Eraser, RefreshCw, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { encodeDeck } from "@/services/utils/encoding";
import { copyToClipboard } from "@/lib/clipboard";
import { BrowserItem } from "@/types/browser";
import { SoloEditorDesktop } from "./SoloEditorDesktop";
import { SoloEditorMobile } from "./SoloEditorMobile";
import { LibraryButton } from "@/components/ui/LibraryButton";

interface SoloEditorLayoutProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  onImportSolo?: (deck: Deck) => void;
}

export function SoloEditorLayout({ units, spellcasters }: SoloEditorLayoutProps) {
  const { 
 
    setDeckName, 
    openCommandCenter, 
    mode, 
    setMode,
    pendingSwapCard,
    setPendingSwapCard 
  } = useDeckStore();
  const { currentDeck } = useDeckBuilder();

  // Manage drawer state locally to allow toggling, but default to open
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);
  const [showUnsavedModal, setShowUnsavedModal] = React.useState(false);
  
  // Footer height calculation for padding
  const footerHeight = isDrawerOpen ? 180 : 48;

  // Computed state for UI logic
  const isEmptyDeck = !currentDeck.spellcaster && currentDeck.slots.every(s => !s.unit);

  const {
    viewSummary,
    browserItems,
    handleQuickAdd,
    handleSelectItem,
    closeSummary,
  } = useDeckEditorUI(units, spellcasters);

  const viewingDeckData = useDeckStore(state => state.viewingDeckData);
  const viewingDeckId = useDeckStore(state => state.viewingDeckId);
  const setDeck = useDeckStore(state => state.setDeck);
  const setViewingDeck = useDeckStore(state => state.setViewingDeck);
  const saveDeck = useDeckStore(state => state.saveDeck);
  const saveAsCopy = useDeckStore(state => state.saveAsCopy);
  const clearDeck = useDeckStore(state => state.clearDeck);
  const isSaved = useDeckStore(selectIsSaved);
  const isExistingDeck = useDeckStore(selectIsExistingDeck);
  
  const { showToast } = useToast();

  // --- Actions ---

  const handleSave = () => {
      saveDeck();
      if (isExistingDeck) {
        showToast("Deck updated successfully", "success");
      } else {
        showToast("Deck saved to library", "success");
      }
  };

  const handleSaveCopy = () => {
    saveAsCopy();
    showToast("Deck copied successfully", "success");
  };

  const handleClear = () => {
       if (isSaved) {
           clearDeck();
       } else {
           setShowUnsavedModal(true);
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
    <div className="h-full flex flex-col relative bg-surface-main overflow-hidden xl:grid xl:grid-cols-[1fr_640px] xl:grid-rows-[auto_1fr]">
      
      {/* Shared Header (Desktop Only) */}
      <div id="deck-editor-header" className="hidden xl:flex h-14 border-b border-white/10 items-center justify-between px-4 shrink-0 bg-surface-main z-20 xl:col-span-2">
          {/* Deck Name Input */}
          <div className="relative group flex items-center gap-1.5 shrink mr-2 min-w-0 max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
               <input 
                  value={currentDeck?.name || ""}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-transparent hover:border-white/20 focus:border-brand-primary transition-all text-lg md:text-xl font-black text-white uppercase tracking-wider focus:outline-none py-0.5 truncate placeholder:text-gray-600"
                  placeholder="UNTITLED DECK"
               />
               <Edit2 size={12} className="text-gray-500 shrink-0 group-hover:text-white transition-colors" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
             
              {/* Library / Command Center */}
              <LibraryButton
                  onClick={openCommandCenter}
                  data-testid="header-library-btn"
                  className="mr-2"
              />

              {/* Mode Switcher */}
              <div className="flex items-center bg-black/20 p-1 rounded-lg border border-white/5 mr-2">
                  <button
                      onClick={() => setMode("SOLO")}
                      className={cn(
                          "px-3 py-1 text-xs font-bold uppercase rounded transition-all",
                          mode === "SOLO" 
                              ? "bg-brand-primary text-white shadow-sm" 
                              : "text-gray-400 hover:text-gray-300"
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
                              : "text-gray-400 hover:text-gray-300"
                      )}
                  >
                      Team
                  </button>
              </div>

              {/* Save */}
              <button
                  onClick={handleSave}
                  disabled={isEmptyDeck && !isSaved}
                  data-testid="toolbar-save-btn"
                  className={cn(
                      "flex items-center gap-2 p-2 md:px-3 md:py-1.5 rounded-lg transition-all border",
                      isEmptyDeck && !isSaved
                        ? "opacity-50 cursor-not-allowed bg-gray-800 border-white/5 text-gray-500"
                        : isSaved 
                            ? "bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20"
                            : "bg-brand-primary/10 text-brand-primary border-brand-primary/50 hover:bg-brand-primary/20 hover:border-brand-primary"
                  )}
                  title={isEmptyDeck ? "Deck is empty" : isSaved ? "Deck Saved" : isExistingDeck ? "Update Existing Deck" : "Save to Library"}
              >
                  {isSaved ? (
                    <Check size={18} className="md:w-3.5 md:h-3.5" />
                  ) : isExistingDeck ? (
                    <RefreshCw size={18} className="md:w-3.5 md:h-3.5" />
                  ) : (
                    <Save size={18} className="md:w-3.5 md:h-3.5" />
                  )}
                  <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                    {isSaved ? "Saved" : isExistingDeck ? "Update" : "Save to Library"}
                  </span>
              </button>

              {/* Save Copy (Only existing decks) */}
              {isExistingDeck && (
                  <button
                      onClick={handleSaveCopy}
                      className="flex items-center gap-2 p-2 md:px-3 md:py-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/20"
                      title="Save as Copy"
                  >
                      <Copy size={18} className="md:w-3.5 md:h-3.5" />
                      <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                        Save Copy
                      </span>
                  </button>
              )}

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
                  <Eraser size={18} />
              </button>


          </div>
      </div>

      <SoloEditorDesktop
          currentDeck={currentDeck}
          browserItems={browserItems as BrowserItem[]}
          onSelectItem={handleSelectItem}
          onQuickAdd={handleQuickAdd}
          onDeckNameChange={setDeckName}
          isSaved={isSaved}
          onSave={handleSave}
          onClear={handleClear}
          onShare={handleShare}
          onOpenLibrary={openCommandCenter}
          footerHeight={footerHeight}
          pendingSwapCard={pendingSwapCard}
          onCancelSwap={() => setPendingSwapCard(null)}
      />

      <SoloEditorMobile
          currentDeck={currentDeck}
          browserItems={browserItems as BrowserItem[]}
          onSelectItem={handleSelectItem}
          onQuickAdd={handleQuickAdd}
          onDeckNameChange={setDeckName}
          isSaved={isSaved}
          onSave={handleSave}
          onClear={handleClear}
          onShare={handleShare}
          onOpenLibrary={openCommandCenter}
          isDrawerOpen={isDrawerOpen}
          onToggleDrawer={setIsDrawerOpen}
          footerHeight={footerHeight}
          pendingSwapCard={pendingSwapCard}
          onCancelSwap={() => setPendingSwapCard(null)}
      />

    </div>

      {/* Solo Overview Overlay */}
      {viewSummary && (
        <div
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={closeSummary}
        >
          <div
            className="w-full max-w-6xl h-auto max-h-[90vh] bg-surface-main rounded-xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col shrink-0"
            onClick={(e) => e.stopPropagation()}
            style={{ height: 'auto' }}
          >
            <SoloOverview
              deck={viewingDeckData || currentDeck}
              isReadOnly={!!viewingDeckData}
              existingId={viewingDeckData ? viewingDeckId : (isSaved ? currentDeck.spellcaster?.spellcaster_id : null)} 
              onEdit={() => {
                  if (viewingDeckData) {
                      setDeck(viewingDeckData);
                      setViewingDeck(null); // Clear viewing state
                  }
                  closeSummary();
              }}
              onBack={() => {
                  setViewingDeck(null);
                  closeSummary();
              }}
            />
          </div>
        </div>
      )}
    
    <UnsavedChangesModal 
        isOpen={showUnsavedModal}
        title="Clear Deck?"
        description="You have unsaved changes in this deck. Do you want to return to save them, or clear anyway?"
        onCancel={() => setShowUnsavedModal(false)}
        onDiscard={() => {
            clearDeck();
            setShowUnsavedModal(false);
        }}
    />
    </>
  );
}
