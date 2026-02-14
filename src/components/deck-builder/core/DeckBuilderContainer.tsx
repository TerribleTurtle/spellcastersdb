"use client";

import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { useUrlSync } from "@/features/deck-builder/hooks/persistence/useUrlSync";
import { DeckBuilderView } from "./DeckBuilderView";
import { useDeckSync } from "@/features/deck-builder/hooks/persistence/useDeckSync";
import { useToast } from "@/hooks/useToast";

interface DeckBuilderContainerProps {
  units: (Unit | Spell | Titan)[];
  spellcasters: Spellcaster[];
}

export function DeckBuilderContainer({ units, spellcasters }: DeckBuilderContainerProps) {
  const { toasts, showToast } = useToast();
  
  // URL & State Sync Hook (Now self-contained)
  useUrlSync({
      units,
      spellcasters,
      onError: (msg) => showToast(msg, "error"),
  });

  // Sync Store Side-Effects
  useDeckSync();

  return (
    <>
      <DeckBuilderView 
        units={units} 
        spellcasters={spellcasters}
      />
      
      {/* Global Toast for Import Failures */}
      {toasts.length > 0 && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-60 pointer-events-none flex flex-col gap-2">
            {toasts.map((toast) => (
              <div key={toast.id} className="bg-red-500 text-white px-4 py-2 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-xs font-bold">{toast.message}</span>
                </div>
              </div>
            ))}
         </div>
      )}
    </>
  );
}
