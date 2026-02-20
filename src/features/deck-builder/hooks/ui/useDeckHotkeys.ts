import { useEffect, useRef } from "react";

import { v4 as uuidv4 } from "uuid";

import { useToast } from "@/hooks/useToast";
import { useDeckStore } from "@/store/index";
import { selectIsSaved } from "@/store/selectors";

export function useDeckHotkeys() {
  const store = useDeckStore();
  const isSaved = useDeckStore(selectIsSaved);
  const { showToast } = useToast();

  // Keep latest state in refs to avoid re-attaching listeners
  const stateRef = useRef({
    store,
    isSaved,
    showToast,
  });

  useEffect(() => {
    stateRef.current = { store, isSaved, showToast };
  }, [store, isSaved, showToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input/textarea is focused
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const { store, isSaved, showToast } = stateRef.current;
      const {
        mode,
        saveDeck,
        clearDeck,
        saveTeam,
        teamName,
        activeTeamId,
        activeSlot,
      } = store;

      // Save: Ctrl + S
      if (isCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();

        if (mode === "SOLO") {
          saveDeck();
          showToast("Deck saved successfully", "success");
        } else if (mode === "TEAM") {
          const targetId = activeTeamId || uuidv4();
          saveTeam(targetId, teamName, activeSlot ?? undefined, undefined);
          showToast("Team saved successfully", "success");
        }
      }

      // Clear: Ctrl + Shift + Delete/Backspace
      if (
        isCtrl &&
        e.shiftKey &&
        (e.key === "Delete" || e.key === "Backspace")
      ) {
        // Only support Global Clear in Solo for safety.
        // In Team, 'Clear' is ambiguous (Clear Team vs Clear Slot).
        if (mode === "SOLO") {
          e.preventDefault();
          if (isSaved) {
            clearDeck();
          } else {
            if (
              confirm(
                "Are you sure you want to clear this deck? Unsaved changes will be lost."
              )
            ) {
              clearDeck();
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // Empty dependency array = listener attaches ONCE
}
