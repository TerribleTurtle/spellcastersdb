"use client";

import { useRouter } from "next/navigation";
import { useDeckBuilder } from "@/features/deck-builder/hooks/domain/useDeckBuilder";
import { useDeckStore } from "@/store/index";
import { SoloOverview } from "./SoloOverview";

export function SoloInspectOverlay() {
  const router = useRouter();
  const deckBuilder = useDeckBuilder();
  const {
    viewingDeckData,
    setViewingDeck,
    viewingDeckId,
  } = useDeckStore();

  if (!viewingDeckData) return null;

  return (
    <div
      className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
      onClick={() => setViewingDeck(null)}
    >
      <div
        className="w-full max-w-6xl h-auto max-h-[90vh] bg-surface-main rounded-xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col shrink-0"
        onClick={(e) => e.stopPropagation()}
        style={{ height: 'auto' }}
      >
        <SoloOverview
          deck={viewingDeckData}
          isReadOnly={true}
          existingId={viewingDeckId}
          onBack={() => {
            setViewingDeck(null);
          }}
          onSave={(deckToSave) => {
            deckBuilder.importDecks([deckToSave || viewingDeckData]);
            setViewingDeck(null);
          }}
          onEdit={() => {
            if (viewingDeckId) {
              deckBuilder.loadDeck(viewingDeckId);
              setViewingDeck(null);
              const url = new URL(window.location.href);
              url.searchParams.delete("d");
              router.replace(url.pathname + url.search);
            } else {
              deckBuilder.setDeckState(viewingDeckData);
              setViewingDeck(null);
              const url = new URL(window.location.href);
              url.searchParams.delete("d");
              router.replace(url.pathname + url.search);
            }
          }}
        />
      </div>
    </div>
  );
}
