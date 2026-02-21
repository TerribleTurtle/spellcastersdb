"use client";

import React from "react";

import {
  Check,
  Copy,
  Edit2,
  Eraser,
  RefreshCw,
  Save,
  Share2,
} from "lucide-react";

import { UnsavedChangesModal } from "@/components/modals/UnsavedChangesModal";
import { LibraryButton } from "@/components/ui/LibraryButton";
import { Button } from "@/components/ui/button";
import { useDeckBuilder } from "@/features/deck-builder/hooks/domain/useDeckBuilder";
import { useDeckEditorUI } from "@/features/deck-builder/hooks/ui/useDeckEditorUI";
import { SoloOverview } from "@/features/deck-builder/overlays/SoloOverview";
import { useToast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import { useDeckStore } from "@/store/index";
import { selectIsExistingDeck, selectIsSaved } from "@/store/selectors";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { BrowserItem } from "@/types/browser";
import { Deck } from "@/types/deck";

import { DeckBuilderShell } from "./DeckBuilderShell";
import { SoloEditorDesktop } from "./SoloEditorDesktop";
import { SoloEditorMobile } from "./SoloEditorMobile";

interface SoloEditorLayoutProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  onImportSolo?: (deck: Deck) => void;
}

export function SoloEditorLayout({
  units,
  spellcasters,
}: SoloEditorLayoutProps) {
  const {
    setDeckName,
    openCommandCenter,
    mode,
    setMode,
    pendingSwapCard,
    setPendingSwapCard,
  } = useDeckStore();
  const { currentDeck } = useDeckBuilder();

  // Manage drawer state locally to allow toggling, but default to open
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);
  const [showUnsavedModal, setShowUnsavedModal] = React.useState(false);

  // Footer height calculation for padding
  const footerHeight = isDrawerOpen ? 180 : 48;

  // Computed state for UI logic
  const isEmptyDeck =
    !currentDeck.spellcaster && currentDeck.slots.every((s) => !s.unit);

  const {
    viewSummary,
    browserItems,
    handleQuickAdd,
    handleSelectItem,
    closeSummary,
  } = useDeckEditorUI(units, spellcasters);

  const viewingDeckData = useDeckStore((state) => state.viewingDeckData);
  const viewingDeckId = useDeckStore((state) => state.viewingDeckId);
  const setDeck = useDeckStore((state) => state.setDeck);
  const setViewingDeck = useDeckStore((state) => state.setViewingDeck);
  const saveDeck = useDeckStore((state) => state.saveDeck);
  const saveAsCopy = useDeckStore((state) => state.saveAsCopy);
  const clearDeck = useDeckStore((state) => state.clearDeck);
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

  const [isSharing, setIsSharing] = React.useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const { createShortLink } =
        await import("@/services/sharing/create-short-link");
      const { url, isShortLink, rateLimited } = await createShortLink({
        deck: currentDeck,
      });

      const success = await copyToClipboard(url);
      if (success) {
        if (rateLimited) {
          showToast("Rate limit exceeded. Copied long URL instead.", "warning");
        } else if (isShortLink) {
          showToast("Deck Link Copied!", "success");
        } else {
          showToast("Copied long link (short link unavailable)", "warning");
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <DeckBuilderShell
      desktopHeader={
        <>
          {/* Deck Name Input */}
          <div className="relative group flex items-center gap-1.5 shrink mr-2 min-w-0 max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
            <input
              value={currentDeck?.name || ""}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full bg-transparent border-b-2 border-transparent hover:border-border-strong focus:border-brand-primary transition-all text-lg md:text-xl font-black text-text-primary uppercase tracking-wider focus:outline-none py-0.5 truncate placeholder:text-text-faint"
              placeholder="UNTITLED DECK"
            />
            <Edit2
              size={12}
              className="text-text-dimmed shrink-0 group-hover:text-text-primary transition-colors"
            />
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
            <div className="flex items-center bg-surface-dim p-1 rounded-lg border border-border-subtle mr-2">
              <button
                onClick={() => setMode("SOLO")}
                className={cn(
                  "px-3 py-1 text-xs font-bold uppercase rounded transition-all",
                  mode === "SOLO"
                    ? "bg-brand-primary text-brand-dark shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                Solo
              </button>
              <button
                onClick={() => setMode("TEAM")}
                className={cn(
                  "px-3 py-1 text-xs font-bold uppercase rounded transition-all",
                  mode === "TEAM"
                    ? "bg-brand-primary text-brand-dark shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
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
                  ? "opacity-50 cursor-not-allowed bg-surface-raised border-border-subtle text-text-dimmed"
                  : isSaved
                    ? "bg-status-success-muted text-status-success-text hover:bg-status-success-border"
                    : "bg-brand-primary/10 text-brand-primary border-brand-primary/50 hover:bg-brand-primary/20 hover:border-brand-primary"
              )}
              title={
                isEmptyDeck
                  ? "Deck is empty"
                  : isSaved
                    ? "Deck Saved"
                    : isExistingDeck
                      ? "Update Existing Deck"
                      : "Save to Library"
              }
            >
              {isSaved ? (
                <Check size={18} className="md:w-3.5 md:h-3.5" />
              ) : isExistingDeck ? (
                <RefreshCw size={18} className="md:w-3.5 md:h-3.5" />
              ) : (
                <Save size={18} className="md:w-3.5 md:h-3.5" />
              )}
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                {isSaved
                  ? "Saved"
                  : isExistingDeck
                    ? "Update"
                    : "Save to Library"}
              </span>
            </button>

            {/* Save Copy (Only existing decks) */}
            {isExistingDeck && (
              <button
                onClick={handleSaveCopy}
                className="flex items-center gap-2 p-2 md:px-3 md:py-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors border border-border-strong"
                title="Save as Copy"
              >
                <Copy size={18} className="md:w-3.5 md:h-3.5" />
                <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                  Save Copy
                </span>
              </button>
            )}

            {/* Share */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-text-muted hover:text-brand-accent hover:bg-brand-accent/10 rounded transition-colors h-[34px] w-[34px]"
              title="Share"
            >
              {isSharing ? (
                <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-current" />
              ) : (
                <Share2 size={18} />
              )}
            </Button>

            {/* Clear */}
            <button
              onClick={handleClear}
              className="p-2 text-text-muted hover:text-status-danger-text hover:bg-status-danger-muted rounded transition-colors"
              title="Clear Deck"
            >
              <Eraser size={18} />
            </button>
          </div>
        </>
      }
      browser={
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
      }
      rightPanel={null} // SoloEditorDesktop handles both columns via display: contents
      mobileFooter={
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
      }
    >
      {/* Solo Overview Overlay */}
      {viewSummary && (
        <div
          className="absolute inset-0 z-50 bg-surface-overlay backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={closeSummary}
        >
          <div
            className="w-full max-w-6xl h-auto max-h-[90vh] bg-surface-main rounded-xl border border-border-default shadow-2xl overflow-hidden relative flex flex-col shrink-0"
            onClick={(e) => e.stopPropagation()}
            style={{ height: "auto" }}
          >
            <SoloOverview
              deck={viewingDeckData || currentDeck}
              isReadOnly={!!viewingDeckData}
              existingId={
                viewingDeckData
                  ? viewingDeckId
                  : isSaved
                    ? currentDeck.spellcaster?.spellcaster_id
                    : null
              }
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
    </DeckBuilderShell>
  );
}
