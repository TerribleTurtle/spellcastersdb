"use client";

import { useState, useCallback } from "react";
import { DECK_EDITOR_TABS, DeckEditorTab } from "../../constants";

export function useDeckEditorNavigation() {
  const [activeMobileTab, setActiveMobileTab] = useState<DeckEditorTab>(
    DECK_EDITOR_TABS.BROWSER
  );
  const [viewSummary, setViewSummary] = useState(false);

  const backToBrowser = useCallback(() => {
    setActiveMobileTab(DECK_EDITOR_TABS.BROWSER);
  }, []);

  const openSummary = useCallback(() => setViewSummary(true), []);
  const closeSummary = useCallback(() => setViewSummary(false), []);

  return {
    activeMobileTab,
    setActiveMobileTab,
    viewSummary,
    backToBrowser,
    openSummary,
    closeSummary
  };
}
