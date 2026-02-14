import { useCallback } from "react";
import { UnifiedEntity } from "@/types/api";
import { DECK_EDITOR_TABS, DeckEditorTab } from "../../constants";
import { useShallow } from "zustand/react/shallow";
import { useDeckStore } from "@/store/index";

export type SelectableItem = UnifiedEntity;

export function useDeckSelection(setActiveMobileTab: (tab: DeckEditorTab) => void) {
  // Use Global Store instead of Local State
  const { inspectedCard, openInspector, closeInspector } = useDeckStore(
    useShallow((state) => ({
      inspectedCard: state.inspectedCard,
      openInspector: state.openInspector,
      closeInspector: state.closeInspector,
    }))
  );

  const handleSelectItem = useCallback((item: SelectableItem) => {
    openInspector(item);
    setActiveMobileTab(DECK_EDITOR_TABS.INSPECTOR);
  }, [openInspector, setActiveMobileTab]);

  return {
    selectedItem: inspectedCard,
    setSelectedItem: openInspector, // Alias for compatibility/completeness
    handleSelectItem,
    closeInspector
  };
}
