
import { Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { useEphemeralState } from "@/hooks/useEphemeralState";
import { useToast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
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

  /* SHARE LOGIC */
  const { isActive: copied, trigger: triggerCopied } = useEphemeralState(2000);
  const { showToast } = useToast();

  const handleShare = async () => {
    // Dynamic import to avoid circular dep issues if encoding depends on types not fully loaded, though usually fine.
    const { encodeTeam } = await import("@/services/utils/encoding");
    
    const hash = encodeTeam(decks, teamName || "Untitled Team");
    const url = `${window.location.origin}${window.location.pathname}?team=${hash}`;

    const success = await copyToClipboard(url);
    if (success) {
      triggerCopied();
      showToast("Team Link Copied!", "success");
    }
  };

  return (
    <div className="h-auto w-full flex flex-col bg-surface-main rounded-xl relative">
      {/* TeamHeader removed - Unified into Global Navbar */}
      {/* UPDATE: Added Back for Mobile Context in Overlay */}
     
      <div className="shrink-0 p-4 pb-2 text-center border-b border-white/5 relative">
             <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-wider line-clamp-2 max-w-xs md:max-w-xl mx-auto">
                {teamName || "Untitled Team"}
             </h2>

             {/* Share Button - Absolute Right */}
             <button
                onClick={handleShare}
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 right-4 z-20 p-2 rounded-full border transition-all shadow-lg",
                     copied
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-surface-card border-white/10 text-white hover:bg-brand-primary hover:border-brand-primary"
                )}
                title="Share Team"
             >
                {copied ? <CheckCircle2 size={16} /> : <LinkIcon size={16} />}
             </button>
      </div>

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
