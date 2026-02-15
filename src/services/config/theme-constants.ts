export const DECK_THEMES = {
  0: {
    // Deck 1: Brand Primary (Purple)
    badge: "bg-brand-primary text-primary-foreground border-brand-primary",
    drawer: "bg-brand-primary/5",
    border: "border-brand-primary shadow-[0_-4px_20px_rgba(147,51,234,0.25)]", 
    textData: "DECK 1",
    deckName: "DECK 1",
    activeOverlay: "bg-brand-primary/10",
    activeHeader: "bg-brand-primary/20",
    activeDot: "bg-brand-primary"
  },
  1: {
    // Deck 2: Brand Accent (Cyan) - Swapped from Pink
    badge: "bg-brand-accent text-accent-foreground border-brand-accent",
    drawer: "bg-brand-accent/5",
    border: "border-brand-accent shadow-[0_-4px_20px_rgba(34,211,238,0.25)]", 
    textData: "DECK 2",
    deckName: "DECK 2", 
    activeOverlay: "bg-brand-accent/10",
    activeHeader: "bg-brand-accent/20",
    activeDot: "bg-brand-accent"
  },
  2: {
    // Deck 3: Brand Secondary (Pink) - Swapped from Cyan
    badge: "bg-brand-secondary text-secondary-foreground border-brand-secondary",
    drawer: "bg-brand-secondary/5",
    border: "border-brand-secondary shadow-[0_-4px_20px_rgba(219,39,119,0.25)]", 
    textData: "DECK 3",
    deckName: "DECK 3",
    activeOverlay: "bg-brand-secondary/10",
    activeHeader: "bg-brand-secondary/20",
    activeDot: "bg-brand-secondary"
  }
} as const;

export type DeckThemeIndex = keyof typeof DECK_THEMES;
