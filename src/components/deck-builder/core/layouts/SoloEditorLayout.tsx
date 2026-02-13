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


import { InspectorPanel } from "@/components/deck-builder/features/inspector/InspectorPanel";

export function SoloEditorLayout({ units, spellcasters }: SoloEditorLayoutProps) {
  const { openInspector, setDeckName, openCommandCenter } = useDeckStore();
  const {
    currentDeck,
  } = useDeckBuilder();

  // Manage drawer state locally to allow toggling, but default to open
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);
  const [showClearModal, setShowClearModal] = React.useState(false);
  
  // Footer height calculation for padding
  // On Desktop, the drawer is in the grid, so we might not need padding BOTTOM on the main area
  // But we need to ensure the grid rows are sized correctly.
  
  // For mobile (non-xl), we still need padding bottom if drawer is fixed.
  // DeckDrawer is fixed on mobile.
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
    {/* Grid Layout:
        Mobile: Flex Column (standard).
        Desktop (XL): Grid with 2 columns.
        Row 1: Header (Col Span 2)
        Row 2: Content
            Col 1: Browser
            Col 2: Inspector (Top) + Drawer (Bottom)
    */}
    <div className="h-full flex flex-col relative bg-surface-main overflow-hidden xl:grid xl:grid-cols-[1fr_640px] xl:grid-rows-[auto_1fr]">
      {/* Secondary Header (Solo) */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-surface-main z-20 xl:col-span-2">
          {/* Deck Name Input */}
          <div className="relative group flex items-center gap-1.5 shrink mr-2 min-w-0">
               <input 
                  value={currentDeck?.name || ""}
                  onChange={(e) => setDeckName(e.target.value)}
                  style={{ width: `${Math.max((currentDeck?.name || "").length, 12) + 2}ch` }}
                  className="bg-transparent border-b-2 border-transparent hover:border-white/20 focus:border-brand-primary transition-all text-lg md:text-xl font-black text-white uppercase tracking-wider focus:outline-none py-0.5 truncate min-w-[150px]"
                  placeholder="UNTITLED DECK"
               />
               <Edit2 size={12} className="text-gray-500 shrink-0" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
             
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

      {/* Left Column: Vault / Browser */}
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

      {/* Right Column: Inspector (Top) + Drawer (Bottom) */}
      <div className="hidden xl:flex xl:col-start-2 xl:row-start-2 xl:flex-col xl:h-full xl:overflow-hidden bg-surface-main/30">
          
          {/* Inspector fills remaining space */}
          <div className="flex-1 overflow-hidden min-h-0">
             <InspectorPanel className="h-full border-l border-white/10" />
          </div>

          {/* Drawer fixed at bottom of column */}
          <div className="shrink-0">
            <DeckDrawer 
                deck={currentDeck}
                onSelect={openInspector}
                variant="static" // Use static variant for layout flow
                isExpanded={true} // Always expanded on Desktop
                onToggle={() => {}} 
                onRename={setDeckName}
                isSaved={isSaved}
                onSave={handleSave}
                onClear={handleClear}
                onLibraryOpen={openCommandCenter}
                onShare={handleShare}
                hideGlobalActions={true}
                className="w-full border-l border-white/10 border-t-0 bg-surface-main/50 shadow-none!"
            />
          </div>
      </div>

      {/* Mobile Drawer (Absolute/Fixed) - Only visible on small screens due to css classes inside DeckDrawer or parent container logic? 
          Wait, DeckDrawer logic handles its own hiding/positioning often.
          But here we are rendering it TWICE for different layouts? 
          No, the previous implementation had conditional rendering or CSS classes.
          The DeckDrawer component handles 'variant="fixed"' for mobile. 
          Let's verify if we need a separate Mobile instance or if CSS handles the "hidden xl:flex" vs "xl:hidden".
      */}
      {/* Mobile Instance Only */}
      <div className="xl:hidden">
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
         />
      </div>

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

