import { useState } from "react";
import { useDeckBuilder } from "../domain/useDeckBuilder";
import { Deck } from "@/types/deck";
import { v4 as uuidv4 } from "uuid";
import { useEphemeralState } from "@/hooks/useEphemeralState";

export type SavedListTab = "TEAMS" | "SOLO";

interface UseDeckPersistenceProps {
  onClear: () => void;
  onImportSolo?: (deck: Deck) => void;
}

export function useDeckPersistence({ onClear, onImportSolo }: UseDeckPersistenceProps) {
  const {
    // Solo State & Actions
    currentDeck: deck,
    savedDecks,
    saveDeck,
    saveAsCopy,
    loadDeck,
    hasChanges,
    
    // Team State & Actions
    loadTeam,
    saveTeam,
    activeTeamId,
    clearTeam,
    
    // UI Slice
    mode,
  } = useDeckBuilder();

  const isTeamMode = mode === "TEAM";
  const teamHasChanges = true; // Placeholder as per original

  // --- Local State ---
  const [savedListTab, setSavedListTab] = useState<SavedListTab>("TEAMS");
  const { isActive: justSaved, trigger: triggerSaved } = useEphemeralState(2000);
  
  const [confirmSave, setConfirmSave] = useState<{
    name: string;
    existingId: string;
    type: "COLLISION" | "UPDATE";
    onSuccess?: () => void;
  } | null>(null);

  const [pendingAction, setPendingAction] = useState<{
    type: "LOAD_TEAM" | "LOAD_DECK" | "IMPORT";
    action: () => void;
  } | null>(null);

  // --- Derived State ---
  const savedDecksList = savedDecks || [];
  const isTeamClean = !!(isTeamMode && activeTeamId && !teamHasChanges);
  const isDeckClean = !!(!isTeamMode && deck.id && hasChanges === false);
  const isNewClean = !!(!isTeamMode && !deck.id && hasChanges === false);

  const saveLabel = justSaved
    ? "Saved"
    : isTeamMode
      ? isTeamClean
        ? "Close Team"
        : activeTeamId
          ? "Update Team"
          : "Save Team"
        : isDeckClean
          ? "Close Deck"
          : isNewClean
          ? "Save Deck" 
          : deck.id
          ? "Update Deck"
          : "Save Deck";

  // --- Handlers ---

  const performSave = (name: string, onSuccess?: () => void) => {
    saveDeck(name);
    triggerSaved();
    if (onSuccess) {
      onSuccess();
    } else {
      onClear();
    }
    setConfirmSave(null);
  };

  const performSaveAsCopy = (name: string, onSuccess?: () => void) => {
    if (saveAsCopy) {
      saveAsCopy(name);
      triggerSaved();
      if (onSuccess) {
        onSuccess();
      } else {
        onClear();
      }
      setConfirmSave(null);
    }
  };

  const handleSave = (onSuccess?: () => void) => {
    // 1. Close/Clear if clean
    if (isTeamClean) {
        if (clearTeam) clearTeam();
        else onClear();
        onSuccess?.();
        return;
    }

    if (isDeckClean || isNewClean) {
      onClear();
      onSuccess?.();
      return;
    }

    // 2. Team Save
    if (isTeamMode) {
      saveTeam?.(uuidv4());
      setSavedListTab("TEAMS");
      triggerSaved();
      onSuccess?.();
      return;
    }

    // 3. Deck Save (Collision Check)
    const nameToSave = (deck.name || "").trim();
    const collision = savedDecksList.find(
      (d) =>
        (d.name || "").toLowerCase() === nameToSave.toLowerCase() &&
        d.id !== deck.id
    );

    if (collision) {
      setConfirmSave({
        name: nameToSave,
        existingId: collision.id!,
        type: "COLLISION",
        onSuccess,
      });
      return;
    }

    performSave(nameToSave, onSuccess || (() => {}));
  };

  // Safe Load Handlers
  const handleSafeLoadTeam = (id: string) => {
    const action = () => loadTeam?.(id);
    if (teamHasChanges) {
      setPendingAction({ type: "LOAD_TEAM", action });
    } else {
      action();
    }
  };

  const handleSafeLoadDeck = (id: string) => {
    const action = () => loadDeck(id);
    if (hasChanges) {
      setPendingAction({ type: "LOAD_DECK", action });
    } else {
      action();
    }
  };

  const handleSafeImportSolo = (d: Deck) => {
    const action = () => {
      if (onImportSolo) onImportSolo(d);
    };
    const isSlotNotEmpty = deck.spellcaster || deck.slots.some((s) => s.unit);

    if (teamHasChanges && isSlotNotEmpty) {
      setPendingAction({ type: "IMPORT", action });
    } else {
      action();
    }
  };

  return {
    // State
    savedListTab,
    setSavedListTab,
    justSaved,
    confirmSave,
    setConfirmSave,
    pendingAction,
    setPendingAction,
    saveLabel,
    isTeamClean,
    isDeckClean,
    isNewClean,

    // Actions
    handleSave,
    performSave,
    performSaveAsCopy,
    handleSafeLoadTeam,
    handleSafeLoadDeck,
    handleSafeImportSolo,
    
    // Passthrough
    activeTeamId
  };
}
