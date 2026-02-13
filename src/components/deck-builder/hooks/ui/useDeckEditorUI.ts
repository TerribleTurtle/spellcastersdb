"use client";

import { useState, useCallback, useMemo } from "react";
import { Unit, Spellcaster, Spell, Titan } from "@/types/api";
import { useDeckBuilder } from "@/components/deck-builder/hooks/domain/useDeckBuilder";
import { useToast } from "@/hooks/useToast";
import { DECK_EDITOR_TABS, DeckEditorTab } from "@/components/deck-builder/ui/constants";
import { ENTITY_CATEGORY } from "@/services/config/constants";
import { EntityCategory } from "@/types/enums";

export type SelectableItem = Unit | Spellcaster | Spell | Titan;

export function useDeckEditorUI(
  units: SelectableItem[],
  spellcasters: Spellcaster[]
) {
  const { quickAdd } = useDeckBuilder();
  const { toasts, showToast } = useToast();

  // Mobile Tab State
  const [activeMobileTab, setActiveMobileTab] = useState<DeckEditorTab>(
    DECK_EDITOR_TABS.BROWSER
  );

  // Selection State
  const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);

  // Summary Overlay State (Used by Solo, maybe Team later)
  const [viewSummary, setViewSummary] = useState(false);

  // --- Handlers ---

  const handleQuickAdd = useCallback(
    (item: SelectableItem) => {
      const message = quickAdd(item);
      if (message) {
        showToast(message);
      }
    },
    [quickAdd, showToast]
  );

  const handleSelectItem = useCallback((item: SelectableItem) => {
    setSelectedItem(item);
    setActiveMobileTab(DECK_EDITOR_TABS.INSPECTOR);
  }, []);

  const closeInspector = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const backToBrowser = useCallback(() => {
    setActiveMobileTab(DECK_EDITOR_TABS.BROWSER);
  }, []);

  const openSummary = useCallback(() => setViewSummary(true), []);
  const closeSummary = useCallback(() => setViewSummary(false), []);

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
    setSelectedItem,
    handleQuickAdd,
    handleSelectItem,
    closeInspector,
    backToBrowser,
    openSummary,
    closeSummary,
  };
}
