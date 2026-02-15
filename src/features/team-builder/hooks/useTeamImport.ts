import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Deck, Team } from "@/types/deck";
import { useTeamImportAutoResolve } from "./useTeamImportAutoResolve";

interface UseTeamImportProps {
    viewingTeamData: Deck[] | null;


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

    // State for Save Modal
    const [showSaveModal, setShowSaveModal] = useState(false);

    const { showConflictModal } = useTeamImportAutoResolve({ isEmpty, hasChanges });

    const handleSave = useCallback(() => {
        setShowSaveModal(true);
    }, []);

    const performSave = useCallback((name: string) => {
        const existing = savedTeams.find(t => t.name === name);
        const idToUse = existing ? existing.id : uuidv4();

        // 4. Save Logic
        if (viewingTeamData) {
            // If we are viewing a "Link" or "Import", and saving, we overwrite/create based on ID.
            // But here we are saving by NAME.
            // Logic:
            // 1. If existing found -> Overwrite (SaveTeamModal confirmed this)
            // 2. If no existing -> Create New
            setActiveSlot(null);
            
            // If importing data, regenerate IDs for the new copy
            const newIds = viewingTeamData.map(() => uuidv4());
            loadTeamFromData(viewingTeamData, newIds);
            
            saveTeam(idToUse || uuidv4(), name);
            setViewingTeam(null);
            setViewSummary(false);
            setActiveSlot(0);
        } else {
            // Just saving the current workspace
            saveTeam(idToUse || uuidv4(), name);
            setActiveSlot(0);
            setViewSummary(false);
        }
        setShowSaveModal(false);
    }, [viewingTeamData, savedTeams, loadTeamFromData, saveTeam, setViewingTeam, setViewSummary, setActiveSlot]);

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
        performSave,
        showSaveModal,
        setShowSaveModal,
        handleImportCancel,
        handleImportConfirm,
        handleImportSaveAndOverwrite,
        showConflictModal
    };
}
