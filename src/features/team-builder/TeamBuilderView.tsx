"use client";

import { Deck } from "@/types/deck";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

import { useTeamBuilder } from "@/features/team-builder/hooks/useTeamBuilder";

import { TeamEditorLayout } from "@/features/deck-builder/ui/layouts/TeamEditorLayout";
import { TeamOverview } from "@/features/team-builder/components/TeamOverview";
import { ImportConflictModal } from "@/components/modals/ImportConflictModal";

interface TeamBuilderViewProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  onImportSolo?: (deck: Deck) => void;
}

export function TeamBuilderView({
  units,
  spellcasters,
  onImportSolo,
}: TeamBuilderViewProps) {
  const {
      // State
      teamDecks,
      viewingTeamData,
      existingId,
      isReadOnly,
      showSummary,

      showConflictModal,
      
      // Data
      viewingTeamName,
      teamName,
      
      // Handlers
      handleBack,
      handleSave,
      handleEditDeck,
      handleImportCancel,
      handleImportConfirm,
      handleImportSaveAndOverwrite,
  } = useTeamBuilder();

  return (
    <>
      <TeamEditorLayout
        units={units}
        spellcasters={spellcasters}
        onImportSolo={onImportSolo}
      />
      
      {/* Import Conflict Modal */}
      {showConflictModal && (
          <ImportConflictModal
            onCancel={handleImportCancel}
            onConfirm={handleImportConfirm}
            onSaveAndImport={handleImportSaveAndOverwrite}
          />
        )}

      {/* Team Overview Overlay */}
      {(showSummary || viewingTeamData) && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => { if (!viewingTeamData && handleBack) handleBack(); }}
          role="presentation"
        >
           <div className="w-full max-w-6xl h-auto max-h-[90vh] bg-surface-main rounded-xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col shrink-0"
            onClick={(e) => e.stopPropagation()}
            style={{ height: 'auto' }}
           >
               <TeamOverview
                   decks={(viewingTeamData as [Deck, Deck, Deck]) || teamDecks!}
                   existingId={existingId}
                   isReadOnly={isReadOnly}
                   onBack={handleBack}
                   onSave={handleSave}
                   onEditDeck={handleEditDeck}
                   teamName={viewingTeamName || (teamName || "")}
               />
           </div>
        </div>
      )}
    </>
  );
}
