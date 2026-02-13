import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Deck, Team } from "@/types/deck";
import { useTeamImportAutoResolve } from "./useTeamImportAutoResolve";

interface UseTeamImportProps {
    viewingTeamData: Deck[] | null;
    viewingTeamName: string | null;
    teamName: string;
    loadTeamFromData: (decks: Deck[], newIds: string[]) => void;
    saveTeam: (id: string, name: string) => void;
    setViewingTeam: (decks: Deck[] | null) => void;
    setViewSummary: (view: boolean) => void;
    setActiveSlot: (slot: number | null) => void;
    setPendingImport: (deck: Deck | null) => void;
    resolvePendingImport: (strategy: "OVERWRITE" | "SAVE_AND_OVERWRITE") => void;
    isEmpty: boolean;
    hasChanges: boolean;
    savedTeams: Team[];
}

export function useTeamImport({
    viewingTeamData,
    viewingTeamName,
    teamName,
    loadTeamFromData,
    saveTeam,
    setViewingTeam,
    setViewSummary,
    setActiveSlot,
    setPendingImport,
    resolvePendingImport,
    isEmpty,
    hasChanges,
    savedTeams
}: UseTeamImportProps) {

    const { showConflictModal } = useTeamImportAutoResolve({ isEmpty, hasChanges });

    const handleSave = useCallback(() => {
        let nameToSpec = viewingTeamName || teamName || "Untitled Team";

        // If checking for duplicates or naming
        // 1. Prompt for name
        const promptName = window.prompt("Enter a name for this team:", nameToSpec);
        if (promptName === null) return; // Users cancelled
        
        nameToSpec = promptName.trim() || "Untitled Team";

        // 2. Check for duplicates (requires savedTeams prop - added below)
        const existing = savedTeams.find(t => t.name === nameToSpec);
        
        // 3. Confirm overwrite
        if (existing) {
             if (!window.confirm(`A team named "${nameToSpec}" already exists. Overwrite it?`)) {
                 return;
             }
             // Use existing ID to overwrite
             if (viewingTeamData) {
                  // Import case: overwrite existing
                  const newIds = viewingTeamData.map(() => uuidv4());
                  loadTeamFromData(viewingTeamData, newIds);
                  saveTeam(existing.id || uuidv4(), nameToSpec);
                  setViewingTeam(null);
                  setViewSummary(false);
                  setActiveSlot(0);
                  return;
             } else {
                  // Regular save case: overwrite existing
                  saveTeam(existing.id || uuidv4(), nameToSpec);
                  setActiveSlot(0);
                  setViewSummary(false);
                  return;
             }
        }

        // 4. Save New
        if (viewingTeamData) {
            setActiveSlot(null);
            const newIds = viewingTeamData.map(() => uuidv4());
            loadTeamFromData(viewingTeamData, newIds);
            saveTeam(uuidv4(), nameToSpec);
            setViewingTeam(null);
            setViewSummary(false);
            setActiveSlot(0);
        } else {
            saveTeam(uuidv4(), nameToSpec);
            setActiveSlot(0);
            setViewSummary(false);
        }
    }, [
        viewingTeamData,
        viewingTeamName,
        teamName,
        savedTeams,
        loadTeamFromData,
        saveTeam,
        setViewingTeam,
        setViewSummary,
        setActiveSlot
    ]);

    const handleImportCancel = useCallback(() => {
        setPendingImport(null);
    }, [setPendingImport]);

    const handleImportConfirm = useCallback(() => {
        resolvePendingImport("OVERWRITE");
    }, [resolvePendingImport]);

    const handleImportSaveAndOverwrite = useCallback(() => {
        resolvePendingImport("SAVE_AND_OVERWRITE");
    }, [resolvePendingImport]);

    return {
        handleSave,
        handleImportCancel,
        handleImportConfirm,
        handleImportSaveAndOverwrite,
        showConflictModal
    };
}
