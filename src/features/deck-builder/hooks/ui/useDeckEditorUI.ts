import { useCallback, useMemo } from "react";
import { Spellcaster, Unit, Spell, Titan } from "@/types/api";
import { useDeckBuilder } from "@/features/deck-builder/hooks/domain/useDeckBuilder";
import { useToast } from "@/hooks/useToast";
import { ENTITY_CATEGORY } from "@/services/config/constants";
import { EntityCategory } from "@/types/enums";
import { useDeckEditorNavigation } from "./useDeckEditorNavigation";
import { useDeckSelection, SelectableItem } from "./useDeckSelection";
import { useDeckStore } from "@/store/index";

export type { SelectableItem };

export function useDeckEditorUI(
  units: SelectableItem[],
  spellcasters: Spellcaster[]
) {
  const { mode, quickAdd, setSlot, setTeamSlot, activeSlot } = useDeckBuilder();
  const pendingSwapCard = useDeckStore(state => state.pendingSwapCard);
  const setPendingSwapCard = useDeckStore(state => state.setPendingSwapCard);
  
  const { toasts, showToast } = useToast();

  // Navigation Logic
  const {
    activeMobileTab,
    setActiveMobileTab,
    viewSummary,
    backToBrowser,
    openSummary,
    closeSummary
  } = useDeckEditorNavigation();

  // Selection Logic
  const {
    selectedItem,
    // setSelectedItem, // No longer exposed/needed directly, or aliased
    handleSelectItem: baseHandleSelectItem, 
    closeInspector
  } = useDeckSelection(setActiveMobileTab);

  // --- Handlers ---

  const handleQuickAdd = useCallback(
    (item: SelectableItem) => {
      const message = quickAdd(item);
      if (message) {
        // Corrective Action #18: Swap Workflow
        // If Deck Full, trigger Swap Mode
        if (message.includes("Full") || message.includes("Limit Reached")) {
            setPendingSwapCard(item);
            showToast("Deck Full. Select a slot to replace.", "info");
            return false;
        }

        // Generic Error
        const isError = message.includes("Cannot") || message.includes("Already");
        showToast(message, isError ? "destructive" : "default");
        return false;
      }
      return true;
    },
    [quickAdd, showToast, setPendingSwapCard]
  );
  
  const handleSelectItem = useCallback((item: SelectableItem | undefined, pos?: { x: number; y: number }, slotIndex?: number) => {
      // Corrective Action #18: Swap Workflow Execution
      if (pendingSwapCard && slotIndex !== undefined && slotIndex >= 0) {
           // Perform Swap
           if (mode === "TEAM") {
                if (activeSlot !== null) {
                    setTeamSlot(activeSlot, slotIndex, pendingSwapCard as Unit | Spell | Titan);
                }
           } else {
                setSlot(slotIndex, pendingSwapCard as Unit | Spell | Titan); 
           }
           
           
           setPendingSwapCard(null);
           const targetName = item ? item.name : "Empty Slot";
           showToast(`Swapped ${pendingSwapCard.name} with ${targetName}`, "success");
           return;
      }
      
      // Standard Behavior: Open Inspector
      if (item) {
          baseHandleSelectItem(item);
      }

  }, [pendingSwapCard, mode, activeSlot, setTeamSlot, setSlot, setPendingSwapCard, showToast, baseHandleSelectItem]);

  // --- Computed ---

  const lastQuickAdd = toasts[toasts.length - 1]?.message || null;

  const browserItems = useMemo(
    () => [
      ...spellcasters.map((h) => ({ ...h, category: ENTITY_CATEGORY.Spellcaster as EntityCategory.Spellcaster })),
      ...units,
    ],
    [spellcasters, units]
  );

  return {
    // State
    activeMobileTab,
    selectedItem,
    lastQuickAdd,
    viewSummary,
    browserItems,
    
    // Actions
    setActiveMobileTab,
    // setSelectedItem,
    handleQuickAdd,
    handleSelectItem,
    closeInspector,
    backToBrowser,
    openSummary,
    closeSummary,
  };
}
