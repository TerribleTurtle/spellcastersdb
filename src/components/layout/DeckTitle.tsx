"use client";

import { useDeckStore } from "@/store/index";

export function DeckTitle() {
    const { currentDeck, mode, teamName } = useDeckStore();

    if (mode === "TEAM") {
        return (
            <div className="flex flex-col items-start animate-in fade-in duration-300">
                 <span className="text-xl font-bold tracking-wider text-text-primary truncate max-w-48 sm:max-w-md">
                    {teamName || "Untitled Team"}
                </span>
                 <span className="text-[10px] text-brand-accent font-bold tracking-widest uppercase">
                    Team Composition
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start animate-in fade-in duration-300">
             <span className="text-xl font-bold tracking-wider text-text-primary truncate max-w-[200px] sm:max-w-md">
                {currentDeck.name || "Untitled Deck"}
            </span>
             <span className="text-[10px] text-brand-primary font-bold tracking-widest uppercase">
                {currentDeck.spellcaster ? currentDeck.spellcaster.name : "Select Spellcaster"}
            </span>
        </div>
    );
}
