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
}

export function TeamOverview({
  decks,
  onEditDeck,
  onBack,
  isReadOnly,
  onSave,
  existingId,
}: TeamOverviewProps) {
  const openInspector = useDeckStore((state) => state.openInspector);
  const closeInspector = useDeckStore((state) => state.closeInspector);

  return (
    <div className="h-full flex flex-col bg-surface-main overflow-hidden">
      {/* TeamHeader removed - Unified into Global Navbar */}

      {/* Main Content - Scrollable List of Horizontal Decks */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 bg-black/20">
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
