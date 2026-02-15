export const DECK_THEMES = {
  0: {
    badge: "bg-red-950 text-red-100 border-red-800",
    drawer: "bg-red-500/10",
    border: "border-red-500 shadow-[0_-4px_20px_rgba(239,68,68,0.25)]", 
    textData: "DECK 1",
    deckName: "DECK 1",
    activeOverlay: "bg-red-500/10",
    activeHeader: "bg-red-500/20",
    activeDot: "bg-red-400"
  },
  1: {
    badge: "bg-green-950 text-green-100 border-green-800",
    drawer: "bg-green-500/10",
    border: "border-green-500 shadow-[0_-4px_20px_rgba(34,197,94,0.25)]", // Green-500
    textData: "DECK 2",
    deckName: "DECK 2", 
    activeOverlay: "bg-green-500/10",
    activeHeader: "bg-green-500/20",
    activeDot: "bg-green-400"
  },
  2: {
    badge: "bg-blue-950 text-blue-100 border-blue-800",
    drawer: "bg-blue-500/10",
    border: "border-blue-500 shadow-[0_-4px_20px_rgba(59,130,246,0.25)]", // Blue-500
    textData: "DECK 3",
    deckName: "DECK 3",
    activeOverlay: "bg-blue-500/10",
    activeHeader: "bg-blue-500/20",
    activeDot: "bg-blue-400"
  }
} as const;

export type DeckThemeIndex = keyof typeof DECK_THEMES;
