
import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDeckStore } from "@/store/index";
import { useTeamBuilder } from "@/features/team-builder/hooks/useTeamBuilder";
import { useAccordionState } from "@/hooks/useAccordionState";
import { useToast } from "@/hooks/useToast";
import { selectIsTeamSaved, selectIsExistingTeam } from "@/store/selectors";
import { Deck } from "@/types/deck";
import { copyToClipboard } from "@/lib/clipboard";
import { INITIAL_DECK } from "@/services/api/persistence"; 
import { isDeckEmpty } from "@/services/utils/deck-utils";
import { v4 as uuidv4 } from "uuid";

const TRAY_EXPANDED_HEIGHT = 180;
const TRAY_COLLAPSED_HEIGHT = 48;

export function useTeamEditor() {
    const {
        activeSlot,
        setActiveSlot,
        teamName,
        teamDecks,
    } = useTeamBuilder();

    const { setTeamDecks, setTeamName, openCommandCenter } = useDeckStore(
        useShallow(state => ({
            setTeamDecks: state.setTeamDecks,
            setTeamName: state.setTeamName,
            openCommandCenter: state.openCommandCenter,
        }))
    );

    // Responsive State
    const [allowMultiple, setAllowMultiple] = useState(() => {
        // Default to true on server to avoid hydration mismatch if possible, 
        // OR default to false and accept it corrects after mount.
        // Actually, for "Desktop" teams, we probably want it to FEEL like desktop immediately.
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1280;
        }
        return false;
    });

    useEffect(() => {
        const checkWidth = () => setAllowMultiple(window.innerWidth >= 1280);
        // checkWidth(); // Initialized in state now, but double check doesn't hurt, removing to avoid flicker if state is already right
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    // Accordion State
    const accordion = useAccordionState(3, 0, allowMultiple);
    
    // Auto-select Slot 1 on mount if none selected, OR sync accordion to active slot
    // Auto-select Slot 1 on mount if none selected, OR sync accordion to active slot
    useEffect(() => {
        if (activeSlot === null) {
            setActiveSlot(0);
            // safe to just set one here
            const newState = [true, false, false];
            accordion.setExpandedState(newState);
        } else {
             // Sync accordion to match active slot on mount/change
             accordion.setExpandedState(prev => {
                 const newState = [...prev];
                 // Always ensure active is open
                 newState[activeSlot] = true;
                 
                 // If NOT allowMultiple (Mobile/Narrow), close others to enforce accordion style
                 if (!allowMultiple) {
                     for(let i=0; i<newState.length; i++) {
                         if (i !== activeSlot) newState[i] = false;
                     }
                 }
                 return newState;
             });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSlot, allowMultiple]);

    // Footer Height Calculation
    const footerHeight = accordion.expandedState.reduce((acc, expanded) => acc + (expanded ? TRAY_EXPANDED_HEIGHT : TRAY_COLLAPSED_HEIGHT), 0);

    // Actions & State
    const { showToast } = useToast();
    const { 
        clearDeck, 
        saveTeam, 
        saveTeamAsCopy,
        activeTeamId, 
        importDeckToLibrary, 
        isTeamSaved, 
        isExistingTeam,
        clearTeam 
    } = useDeckStore(
        useShallow(state => ({
            clearDeck: state.clearDeck,
            saveTeam: state.saveTeam,
            saveTeamAsCopy: state.saveTeamAsCopy,
            activeTeamId: state.activeTeamId,
            importDeckToLibrary: state.importDeckToLibrary,
            isTeamSaved: selectIsTeamSaved(state),
            isExistingTeam: selectIsExistingTeam(state),
            clearTeam: state.clearTeam
        }))
    );

    // Modals & Temp State
    const [slotToClear, setSlotToClear] = useState<number | null>(null);
    const [showUnsavedTeamModal, setShowUnsavedTeamModal] = useState(false);
    const [deckToExport, setDeckToExport] = useState<Deck | null>(null);

    // Handlers
    const handleRename = (index: number, name: string) => {
        if (!teamDecks) return;
        const newDecks = [...teamDecks] as [Deck, Deck, Deck];
        newDecks[index] = { ...newDecks[index], name };
        setTeamDecks(newDecks);
    };

    const handleTeamSave = () => {
        const targetId = activeTeamId || uuidv4();
        saveTeam(targetId, teamName, activeSlot ?? undefined, undefined); 
        showToast("Team saved successfully", "success");
    };

    const handleTeamClear = () => {
        if (isTeamSaved) {
            clearTeam();
        } else {
            setShowUnsavedTeamModal(true);
        }
    };

    const performSlotClear = (idx: number) => {
        if (!teamDecks) return;
        if (activeSlot === idx) {
            clearDeck();
        } else {
            const newDecks = [...teamDecks] as [Deck, Deck, Deck];
            newDecks[idx] = { ...INITIAL_DECK, id: uuidv4(), name: "New Deck" };
            setTeamDecks(newDecks);
        }
    };

    const handleSlotClear = (idx: number) => {
        const deck = teamDecks?.[idx];
        if (!deck) return;
        const isEmpty = isDeckEmpty(deck);
        
        if (isEmpty) {
            if (activeSlot === idx) {
                clearDeck(); 
            } else if (teamDecks) {
                const newDecks = [...teamDecks] as [Deck, Deck, Deck];
                newDecks[idx] = { ...INITIAL_DECK, id: uuidv4(), name: "New Deck" };
                setTeamDecks(newDecks);
            }
        } else {
           if (isTeamSaved) {
               performSlotClear(idx);
           } else {
               setSlotToClear(idx);
           }
        }
    };

    const handleTeamShare = async () => {
        if (!teamDecks) return;
        const { encodeTeam } = await import("@/services/utils/encoding");
        const hash = encodeTeam(teamDecks, teamName);
        const url = `${window.location.origin}${window.location.pathname}?team=${hash}`;
    
        const success = await copyToClipboard(url);
        if (success) {
            showToast("Team Link Copied!", "success");
        }
    };

    return {
        // State
        activeSlot,
        setActiveSlot,
        teamName,
        setTeamName,
        teamDecks,
        activeTeamId,
        isTeamSaved,
        isExistingTeam,
        saveTeamAsCopy,
        footerHeight,
        
        // Accordion
        accordion,

        // Modals
        showUnsavedTeamModal, setShowUnsavedTeamModal,
        slotToClear, setSlotToClear,
        deckToExport, setDeckToExport,

        // Actions
        showToast,
        handleRename,
        handleTeamSave,
        handleTeamClear,
        handleSlotClear,
        performSlotClear,
        handleTeamShare,
        importDeckToLibrary,
        openCommandCenter,
        clearTeam
    };
}
