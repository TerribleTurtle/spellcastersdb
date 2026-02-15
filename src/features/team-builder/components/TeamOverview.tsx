import { Deck } from "@/types/deck";
import { TeamActionButtons } from "./TeamActionButtons";
import { TeamDeckRow } from "./TeamDeckRow";
import { useDeckStore } from "@/store/index";

interface TeamOverviewProps {
  decks: [Deck, Deck, Deck];
  onEditDeck: (index: number) => void;
  onBack?: () => void;
  isReadOnly?: boolean;
  onSave?: () => void;
  existingId?: string | null;
  teamName?: string | null;
}

export function TeamOverview({
  decks,
  onEditDeck,
  onBack,
  isReadOnly,
  onSave,

  existingId,
  teamName,
}: TeamOverviewProps) {
  const openInspector = useDeckStore((state) => state.openInspector);
  const closeInspector = useDeckStore((state) => state.closeInspector);

  return (
    <div className="h-auto w-full flex flex-col bg-surface-main rounded-xl">
      {/* TeamHeader removed - Unified into Global Navbar */}
      {/* UPDATE: Added Back for Mobile Context in Overlay */}
      {teamName && (
        <div className="shrink-0 p-4 pb-2 text-center border-b border-white/5">
             <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-wider line-clamp-2 max-w-xs md:max-w-xl mx-auto">
                {teamName}
             </h2>
        </div>
      )}

      {/* Main Content - Scrollable List of Horizontal Decks */}
      <div className="overflow-y-auto p-2 md:p-4 space-y-2 bg-black/20 shrink-0">
        <div className="max-w-5xl mx-auto w-full space-y-2">
          {decks.map((deck, index) => (
            <TeamDeckRow
              key={index}
              index={index}
              deck={deck}
              onEdit={() => onEditDeck(index)}
              isReadOnly={isReadOnly}
              onInspect={(item, pos) => openInspector(item, pos, { isReadOnly: true })}
              onStopInspect={closeInspector}
            />
          ))}
        </div>
      </div>

      <TeamActionButtons
        onBack={onBack}
        isReadOnly={isReadOnly}
        onSave={onSave}
        existingId={existingId}
        onEditDeck={onEditDeck}
      />
    </div>
  );
}
