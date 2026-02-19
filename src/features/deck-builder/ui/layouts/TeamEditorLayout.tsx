"use client";

import { useMemo, useState } from "react";

import {
  Check,
  ChevronUp,
  ChevronsDown,
  Copy,
  Edit2,
  PlusCircle,
  Save,
  Share2,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { ExportDeckModal } from "@/components/modals/ExportDeckModal";
import { SaveTeamModal } from "@/components/modals/SaveTeamModal";
import { UnsavedChangesModal } from "@/components/modals/UnsavedChangesModal";
import { LibraryButton } from "@/components/ui/LibraryButton";
import { UnitBrowser } from "@/features/deck-builder/browser/UnitBrowser";
import { useDeckEditorUI } from "@/features/deck-builder/hooks/ui/useDeckEditorUI";
import { useTeamEditor } from "@/features/deck-builder/hooks/ui/useTeamEditor";
import { MobileContextBar } from "@/features/deck-builder/ui/mobile/MobileContextBar";
import { MobileHeader } from "@/features/deck-builder/ui/mobile/MobileHeader";
import { SwapModeBanner } from "@/features/deck-builder/ui/overlays/SwapModeBanner";
import { InspectorPanel } from "@/features/shared/inspector/InspectorPanel";
import { TeamDeckEditorRow } from "@/features/team-builder/components/TeamDeckEditorRow";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { useDeckStore } from "@/store/index";
import { Spell, Spellcaster, Titan, UnifiedEntity, Unit } from "@/types/api";
import { BrowserItem, ItemUsageState } from "@/types/browser";
import { Deck } from "@/types/deck";

import { DeckBuilderShell } from "./DeckBuilderShell";

interface TeamEditorLayoutProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  pendingExternalImport?: Deck | null;
  onClearPendingImport?: () => void;
  onImportSolo?: (deck: Deck) => void;
}

export function TeamEditorLayout({
  units,
  spellcasters,
}: TeamEditorLayoutProps) {
  const {
    openInspector: originalOpenInspector,
    mode,
    setMode,
    pendingSwapCard,
    setPendingSwapCard,
    openCommandCenter,
  } = useDeckStore(
    useShallow((state) => ({
      openInspector: state.openInspector,
      mode: state.mode,
      setMode: state.setMode,
      pendingSwapCard: state.pendingSwapCard,
      setPendingSwapCard: state.setPendingSwapCard,
      openCommandCenter: state.openCommandCenter,
    }))
  );

  const openInspector = (
    item: UnifiedEntity,
    pos?: { x: number; y: number }
  ) => {
    originalOpenInspector(item, pos);
  };
  const { showToast } = useToast();

  const {
    activeSlot,
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
    showUnsavedTeamModal,
    setShowUnsavedTeamModal,
    slotToClear,
    setSlotToClear,
    deckToExport,
    setDeckToExport,
  } = useTeamEditor();

  const { expandedState, collapseAll, expandAll, areAllCollapsed } = accordion;

  const { browserItems, handleQuickAdd } = useDeckEditorUI(units, spellcasters);

  const isSwapMode = !!pendingSwapCard;

  // Modal State
  const [showSaveTeamModal, setShowSaveTeamModal] = useState(false);

  const handleSaveCopyClick = () => {
    setShowSaveTeamModal(true);
  };

  const handleConfirmSaveCopy = (newName: string) => {
    saveTeamAsCopy(newName);
    setShowSaveTeamModal(false);
    showToast("Team copied successfully", "success");
  };

  const itemStates = useMemo(() => {
    const states = new Map<string, ItemUsageState>();
    if (!teamDecks) return states;

    const getState = (id: string) => {
      if (!states.has(id)) {
        states.set(id, { isActive: false, memberOfDecks: [] });
      }
      return states.get(id)!;
    };

    teamDecks.forEach((deck, deckIndex) => {
      const processItem = (id: string) => {
        const state = getState(id);
        if (activeSlot === deckIndex) {
          state.isActive = true;
        } else {
          // Add badge for other decks
          if (!state.memberOfDecks.includes(deckIndex)) {
            state.memberOfDecks.push(deckIndex);
          }
        }
      };

      if (deck.spellcaster) processItem(deck.spellcaster.entity_id);
      deck.slots.forEach((s) => {
        if (s.unit) processItem(s.unit.entity_id);
      });
    });

    return states;
  }, [teamDecks, activeSlot]);

  return (
    <>
      <DeckBuilderShell
        mobileHeader={
          <div className="xl:hidden">
            <MobileHeader
              mode={mode}
              onSetMode={setMode}
              onShare={handleTeamShare}
              onClear={handleTeamClear}
              onOpenLibrary={openCommandCenter}
            />
            <MobileContextBar
              deckName={teamName || ""}
              onRename={setTeamName}
              isSaved={isTeamSaved}
              isExistingDeck={isExistingTeam}
              onSave={handleTeamSave}
              onSaveCopy={isExistingTeam ? handleSaveCopyClick : undefined}
              isEmptyDeck={
                teamDecks
                  ? teamDecks.every(
                      (d) => d.slots.every((s) => !s.unit) && !d.spellcaster
                    )
                  : true
              }
              canCollapse={true}
              areAllCollapsed={areAllCollapsed}
              onToggleCollapse={areAllCollapsed ? expandAll : collapseAll}
            />
          </div>
        }
        desktopHeader={
          <>
            <div className="flex items-center gap-2">
              {/* Team Name Input */}
              <div className="relative group flex items-center gap-2 shrink mr-2 min-w-0 max-w-[150px] md:max-w-none">
                <input
                  value={teamName || ""}
                  onChange={(e) => setTeamName(e.target.value)}
                  style={{
                    width: `${Math.max((teamName || "").length, 14) + 4}ch`,
                  }}
                  className="bg-transparent border-b-2 border-transparent hover:border-border-strong focus:border-brand-primary transition-all text-xl md:text-2xl font-black text-text-primary uppercase tracking-wider focus:outline-none py-1 truncate min-w-[50px] w-full"
                  placeholder="UNTITLED TEAM"
                />
                <Edit2 size={14} className="text-text-dimmed shrink-0" />
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {/* Library */}
              <LibraryButton
                onClick={() => openCommandCenter()}
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
                      : "text-text-dimmed hover:text-text-secondary"
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
                      : "text-text-dimmed hover:text-text-secondary"
                  )}
                >
                  Team
                </button>
              </div>

              {/* Save Team Button */}
              <button
                onClick={handleTeamSave}
                className={cn(
                  "flex items-center gap-2 p-2 md:px-3 md:py-1.5 rounded-lg transition-all border",
                  !!activeTeamId && isTeamSaved
                    ? "bg-status-success-muted text-status-success-text border-status-success-border hover:bg-status-success-border"
                    : "bg-brand-primary/10 text-brand-primary border-brand-primary/50 hover:border-brand-primary hover:bg-brand-primary/20"
                )}
                title={
                  !!activeTeamId && isTeamSaved
                    ? "Team Saved"
                    : isExistingTeam
                      ? "Update Team"
                      : "Save Team"
                }
              >
                {!!activeTeamId && isTeamSaved ? (
                  <Check size={18} className="md:w-3.5 md:h-3.5" />
                ) : isExistingTeam ? (
                  <Save size={18} className="md:w-3.5 md:h-3.5" />
                ) : (
                  <Save size={18} className="md:w-3.5 md:h-3.5" />
                )}
                <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                  {!!activeTeamId && isTeamSaved
                    ? "Saved"
                    : isExistingTeam
                      ? "Update"
                      : "Save Team"}
                </span>
              </button>

              {/* Save Copy (Only existing teams) */}
              {isExistingTeam && (
                <button
                  onClick={() => {
                    saveTeamAsCopy();
                    showToast("Team copied successfully", "success");
                  }}
                  className="flex items-center gap-2 p-2 md:px-3 md:py-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors border border-border-strong"
                  title="Save as Copy"
                >
                  <Copy size={18} className="md:w-3.5 md:h-3.5" />
                  <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">
                    Save Copy
                  </span>
                </button>
              )}

              {/* Share Team */}
              <button
                onClick={handleTeamShare}
                className="p-2 text-text-muted hover:text-brand-accent hover:bg-brand-accent/10 rounded transition-colors"
                title="Share Team"
              >
                <Share2 size={18} />
              </button>

              {/* New Team Button (Clear) */}
              <button
                onClick={handleTeamClear}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded transition-colors"
                title="New Team"
              >
                <PlusCircle size={18} />
              </button>

              {/* Collapse/Expand All (Desktop) - Moved to far right */}
              <div className="w-px h-6 bg-surface-hover mx-2" />
              <button
                onClick={areAllCollapsed ? expandAll : collapseAll}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded transition-colors"
                title={areAllCollapsed ? "Expand All" : "Collapse All"}
              >
                {areAllCollapsed ? (
                  <ChevronsDown size={18} />
                ) : (
                  <ChevronUp size={18} />
                )}
              </button>
            </div>
          </>
        }
        browser={
          /* Main Content: Vault */
          <section
            aria-label="Unit Library"
            className="flex-1 overflow-hidden relative transition-[padding] duration-300 ease-in-out xl:col-start-1 xl:row-start-2 xl:pb-0! xl:border-r xl:border-border-default"
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

            <div
              className={cn(
                "w-full h-full",
                isSwapMode &&
                  "opacity-40 grayscale pointer-events-none select-none"
              )}
            >
              <UnitBrowser
                items={browserItems as BrowserItem[]}
                onSelectItem={openInspector}
                onQuickAdd={handleQuickAdd}
                itemStates={itemStates}
              />
            </div>
          </section>
        }
        rightPanel={
          /* Right Column: Inspector (Top) + Stacked Decks (Bottom) */
          <div className="hidden xl:flex xl:col-start-2 xl:row-start-2 xl:flex-col xl:justify-between xl:gap-4 xl:h-full xl:overflow-hidden">
            {/* Inspector fills remaining space but shrink wraps */}
            <div className="flex-initial shrink min-h-0 max-h-full flex flex-col">
              <InspectorPanel className="h-auto max-h-full border border-border-default rounded-xl shadow-lg overflow-hidden" />
            </div>

            {/* Stacked Decks Container - Boxed at bottom of column */}
            <div className="shrink-0 flex flex-col border border-border-default rounded-xl shadow-lg overflow-hidden bg-surface-main/50">
              {teamDecks?.map((_, idx) => (
                <TeamDeckEditorRow
                  key={idx}
                  index={idx}
                  isExpanded={accordion.expandedState[idx]}
                  onToggle={accordion.toggle}
                  idSuffix="desktop"
                  hideGlobalActions
                  onExport={() => setDeckToExport(teamDecks[idx])}
                />
              ))}
            </div>
          </div>
        }
        mobileFooter={
          /* Mobile Stacked Decks Container (Fixed Bottom) */
          <div
            className={cn(
              "fixed bottom-0 left-0 right-0 z-40 flex flex-col justify-end pointer-events-none pb-[max(0px,env(safe-area-inset-bottom))]",
              "xl:hidden"
            )}
          >
            {teamDecks?.map((_, idx) => (
              <TeamDeckEditorRow
                key={idx}
                index={idx}
                isExpanded={expandedState[idx]}
                onToggle={accordion.toggle}
                idSuffix="mobile"
                hideGlobalActions
                onExport={() => setDeckToExport(teamDecks[idx])}
              />
            ))}
          </div>
        }
      >
        {/* Modals */}

        {/* Save Team Modal */}
        <SaveTeamModal
          isOpen={showSaveTeamModal}
          teamName={teamName}
          onClose={() => setShowSaveTeamModal(false)}
          onSave={handleConfirmSaveCopy}
        />

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
          title={`Clear Slot ${slotToClear !== null ? slotToClear + 1 : ""}?`}
          description={
            <>
              You have unsaved changes in this Team. Clearing{" "}
              <span className="text-text-primary font-bold">
                {teamDecks && slotToClear !== null
                  ? teamDecks[slotToClear].name
                  : "this deck"}
              </span>{" "}
              will impact the team.
              <br />
              Do you want to return to Save the Team before clearing this slot?
            </>
          }
          onCancel={() => setSlotToClear(null)}
          onDiscard={() => {
            if (slotToClear !== null) performSlotClear(slotToClear);
            setSlotToClear(null);
          }}
        />
      </DeckBuilderShell>

      {deckToExport && (
        <ExportDeckModal
          deck={deckToExport}
          isOpen={!!deckToExport}
          onClose={() => setDeckToExport(null)}
          onExport={(newName) => {
            importDeckToLibrary({ ...deckToExport, name: newName });
            showToast(`"${newName}" saved to Solo Library`, "success");
            setDeckToExport(null);
          }}
        />
      )}
    </>
  );
}
