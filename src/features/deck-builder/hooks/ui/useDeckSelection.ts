import { useState, useCallback } from "react";
import { UnifiedEntity } from "@/types/api";
import { DECK_EDITOR_TABS, DeckEditorTab } from "../../constants";

export type SelectableItem = UnifiedEntity;

export function useDeckSelection(setActiveMobileTab: (tab: DeckEditorTab) => void) {
  const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);

  const handleSelectItem = useCallback((item: SelectableItem) => {
    setSelectedItem(item);
    setActiveMobileTab(DECK_EDITOR_TABS.INSPECTOR);
  }, [setActiveMobileTab]);

  const closeInspector = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return {
    selectedItem,
    setSelectedItem,
    handleSelectItem,
    closeInspector
  };
}
