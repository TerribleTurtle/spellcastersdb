export const DECK_EDITOR_TABS = {
  BROWSER: "BROWSER",
  INSPECTOR: "INSPECTOR",
  FORGE: "FORGE",
} as const;

export type DeckEditorTab = keyof typeof DECK_EDITOR_TABS;
