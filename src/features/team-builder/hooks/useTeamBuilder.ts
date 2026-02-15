import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useShallow } from "zustand/react/shallow";
import { useDeckStore } from "@/store/index";
import { useTeamImport } from "./useTeamImport";
import { selectIsEmpty, selectHasChanges } from "@/store/selectors";


export function useTeamBuilder() {
  // 1. Reactive State (Re-renders on change)
  const state = useDeckStore(
    useShallow((s) => ({
      teamDecks: s.teamDecks,
      activeSlot: s.activeSlot,
      teamName: s.teamName,
      activeTeamId: s.activeTeamId,
      savedTeams: s.savedTeams,
      viewSummary: s.viewSummary,
      viewingTeamData: s.viewingTeamData,
      viewingTeamName: s.viewingTeamName,
      viewingTeamId: s.viewingTeamId,
      isReadOnly: s.isReadOnly,
    }))
  );

  // 2. Stable Actions (Function references)
  const actions = useDeckStore(
    useShallow((s) => ({
      setActiveSlot: s.setActiveSlot,
      setTeamName: s.setTeamName,
      setActiveTeamId: s.setActiveTeamId,
      setTeamDecks: s.setTeamDecks,
      saveTeam: s.saveTeam,
      loadTeam: s.loadTeam,
      deleteTeam: s.deleteTeam,
      deleteTeams: s.deleteTeams,
      duplicateTeam: s.duplicateTeam,
      importSoloDeckToTeam: s.importSoloDeckToTeam,
      loadTeamFromData: s.loadTeamFromData,
      clearTeam: s.clearTeam,
      exportTeamSlotToSolo: s.exportTeamSlotToSolo,
      
      // UI Actions
      setViewSummary: s.setViewSummary,
      setViewingTeam: s.setViewingTeam,
      setPendingImport: s.setPendingImport,
      resolvePendingImport: s.resolvePendingImport,
      renameSavedTeam: s.renameSavedTeam,
      
      // Granular Actions
      setTeamSlot: s.setTeamSlot,
      clearTeamSlot: s.clearTeamSlot,
      setTeamSpellcaster: s.setTeamSpellcaster,
      removeTeamSpellcaster: s.removeTeamSpellcaster,
      swapTeamSlots: s.swapTeamSlots,
      quickAddToTeam: s.quickAddToTeam,
      moveCardBetweenDecks: s.moveCardBetweenDecks,
      moveSpellcasterBetweenDecks: s.moveSpellcasterBetweenDecks,
    }))
  );

  const {
      teamDecks,
      viewSummary,
      viewingTeamData,
  } = state;

  const {
      setActiveSlot,
      saveTeam,
      loadTeamFromData,
      setViewSummary,
      setViewingTeam,
      setPendingImport,
      resolvePendingImport,
      
      // New Actions
      setTeamSlot,
      clearTeamSlot,
      setTeamSpellcaster,
      removeTeamSpellcaster,
      swapTeamSlots,
      quickAddToTeam,
      moveCardBetweenDecks,
      moveSpellcasterBetweenDecks,
  } = actions;

  // --- Dependencies (Direct Selectors) ---
  const isEmpty = useDeckStore(selectIsEmpty);
  const hasChanges = useDeckStore(selectHasChanges);

  // --- Extracted Import Logic ---
  const {
    handleSave,
    performSave,
    showSaveModal,
    setShowSaveModal,
    handleImportCancel,
    handleImportConfirm,
    handleImportSaveAndOverwrite,
    showConflictModal
  } = useTeamImport({
    viewingTeamData,

    loadTeamFromData,
    saveTeam,
    setViewingTeam,
    setViewSummary,
    setActiveSlot,
    setPendingImport,
    resolvePendingImport,
    isEmpty,
    hasChanges,
    savedTeams: state.savedTeams
  });

  // --- UI Handlers ---
  
  const handleBack = useCallback(() => {
    setViewSummary(false);
    setViewingTeam(null);
  }, [setViewSummary, setViewingTeam]);

  const handleEditDeck = useCallback((idx: number, forceDiscard: boolean = false) => {
    if (viewingTeamData) {
      if (hasChanges && !forceDiscard) {
          return false; // Halted
      }
      const newIds = viewingTeamData.map(() => uuidv4());
      loadTeamFromData(viewingTeamData, newIds);
      setViewingTeam(null);
    }
    setActiveSlot(idx);
    setViewSummary(false);
    return true;
  }, [viewingTeamData, loadTeamFromData, setViewingTeam, setActiveSlot, setViewSummary, hasChanges]);

  return {
    ...state,
    ...actions,
    existingId: state.viewingTeamId,
    isReadOnly: !!viewingTeamData || state.isReadOnly,
    showSummary: viewSummary && teamDecks,
    showConflictModal,
    hasChanges, // Exposed for UI modals
    
    // Handlers
    handleBack,
    handleSave,
    performSave,
    showSaveModal,
    setShowSaveModal,
    handleEditDeck,
    handleImportCancel,
    handleImportConfirm,
    handleImportSaveAndOverwrite,

    // Expose granular actions
    setTeamSlot,
    clearTeamSlot,
    setTeamSpellcaster,
    removeTeamSpellcaster,
    swapTeamSlots,
    quickAddToTeam,
    moveCardBetweenDecks,
    moveSpellcasterBetweenDecks,
  };
}
