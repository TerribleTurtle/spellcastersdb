import { useRef, useState } from "react";

import { BackupService } from "@/services/domain/BackupService";
import { monitoring } from "@/services/monitoring";
import { useDeckStore } from "@/store/index";

export function useCommandCenter() {
  const {
    commandCenterOpen,
    closeCommandCenter,
    mode,
    isImporting,

    // Store Actions
    savedDecks,
    savedTeams,
    deleteDecks,
    deleteTeams,
    importDecks,
    importTeams,
    clearSavedDecks,
    clearSavedTeams,
  } = useDeckStore();

  // Selection Mode State
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Import/Clear State
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle Selection Mode
  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      if (prev) {
        setSelectedIds(new Set()); // Clear on exit
      }
      return !prev;
    });
  };

  const toggleItemSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (mode === "TEAM") {
      setSelectedIds(new Set(savedTeams.map((t) => t.id!)));
    } else {
      setSelectedIds(new Set(savedDecks.map((d) => d.id!)));
    }
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Actions
  const handleMassDelete = () => {
    if (selectedIds.size === 0) return;

    if (
      confirm(`Are you sure you want to delete ${selectedIds.size} item(s)?`)
    ) {
      if (mode === "TEAM") {
        deleteTeams(Array.from(selectedIds));
      } else {
        deleteDecks(Array.from(selectedIds));
      }
      setSelectedIds(new Set());
    }
  };

  const handleExport = () => {
    const state = useDeckStore.getState();
    const backup = BackupService.generateBackup(state);
    BackupService.downloadBackup(
      backup,
      `spellcasters_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
  };

  const handleImportClick = () => {
    setShowImportConfirm(true);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await BackupService.parseBackupFile(file);

      // Import Decks
      if (data.decks && data.decks.length > 0) {
        importDecks(data.decks);
      }

      // Import Teams
      if (data.teams && data.teams.length > 0) {
        importTeams(data.teams);
      }

      alert(
        `Imported ${data.decks.length} decks and ${data.teams.length} teams.`
      );
    } catch (err) {
      monitoring.captureException(err, { operation: "importBackup" });
      alert("Failed to parse backup file.");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearData = () => {
    clearSavedDecks();
    clearSavedTeams();
    setShowClearDataConfirm(false);
  };

  return {
    // State
    commandCenterOpen,
    closeCommandCenter,
    mode,
    isImporting,
    selectionMode,
    selectedIds,
    showImportConfirm,
    setShowImportConfirm,
    showClearDataConfirm,
    setShowClearDataConfirm,
    fileInputRef,

    // Methods
    toggleSelectionMode,
    toggleItemSelection,
    selectAll,
    deselectAll,
    handleMassDelete,
    handleExport,
    handleImportClick,
    handleImportFile,
    handleClearData,
  };
}
