"use client";

import { ImportConflictModal } from "@/components/modals/ImportConflictModal";
import { useDeckBuilder } from "@/features/deck-builder/hooks/domain/useDeckBuilder";
import { useImportLogic } from "@/features/deck-builder/hooks/domain/useImportLogic";
import { SoloInspectOverlay } from "@/features/deck-builder/overlays/SoloInspectOverlay";
import { SoloEditorLayout } from "@/features/deck-builder/ui/layouts/SoloEditorLayout";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { Deck } from "@/types/deck";

interface SoloBuilderViewProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
  onImportSolo?: (deck: Deck) => void;
}

export function SoloBuilderView({
  units,
  spellcasters,
  onImportSolo,
}: SoloBuilderViewProps) {
  const deckBuilder = useDeckBuilder();

  const { setPendingImport, resolvePendingImport, showConflictModal } =
    useImportLogic({
      isEmpty: deckBuilder.isEmpty,
      hasChanges: deckBuilder.hasChanges,
    });

  return (
    <>
      <SoloEditorLayout
        units={units}
        spellcasters={spellcasters}
        onImportSolo={onImportSolo}
      />

      {/* Import Conflict Modal */}
      {showConflictModal && (
        <ImportConflictModal
          onCancel={() => setPendingImport(null)}
          onConfirm={() => resolvePendingImport("OVERWRITE")}
          onSaveAndImport={() => resolvePendingImport("SAVE_AND_OVERWRITE")}
        />
      )}

      <SoloInspectOverlay />
    </>
  );
}
