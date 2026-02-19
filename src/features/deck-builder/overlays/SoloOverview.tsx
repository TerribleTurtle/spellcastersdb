import { useState } from "react";
import { useEphemeralState } from "@/hooks/useEphemeralState";
import { useToast } from "@/hooks/useToast";

import {
  AlertCircle,
  CheckCircle2,
  Edit,
  Link as LinkIcon,
  Users,
} from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { copyToClipboard } from "@/lib/clipboard";
import { validateDeck } from "@/services/validation/deck-validation";
import { encodeDeck } from "@/services/utils/encoding";
import { cn } from "@/lib/utils";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { UnifiedEntity } from "@/types/api";
import { Deck } from "@/types/deck";
import { DeckOverview } from "@/features/shared/deck/ui/DeckOverview";
import { useDeckStore } from "@/store/index";
import { SaveDeckModal } from "@/components/modals/SaveDeckModal";
import { ImportConflictModal } from "@/components/modals/ImportConflictModal";

interface SoloOverviewProps {
  deck: Deck;
  onEdit: () => void;
  onCreateTeam?: (deck: Deck) => void;
  onBack?: () => void;
  isReadOnly?: boolean;
  onSave?: (deck?: Deck) => void;
  existingId?: string | null;
}

export function SoloOverview({
  deck,
  onEdit,
  onCreateTeam,
  onBack,
  isReadOnly,
  onSave,
  existingId,
}: SoloOverviewProps) {
  const { isActive: copied, trigger: triggerCopied } = useEphemeralState(2000);
  const { isValid, errors } = validateDeck(deck);
  const { showToast } = useToast();
  
  const openInspector = useDeckStore((state) => state.openInspector);
  const closeInspector = useDeckStore((state) => state.closeInspector);

  // Modal States
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const handleInspect = (item: UnifiedEntity, pos: { x: number; y: number }) => {
      openInspector(item, pos, { isReadOnly: true });
  };


  const handleEditSafe = () => {
      // If we are read-only (inspecting a link/saved deck), "Edit" means overwrite current workspace.
      if (isReadOnly) {
           const state = useDeckStore.getState();
           // Check if workspace is dirty
           // We can also check if it's empty to skip confirmation
           const hasChanges = state.currentDeck.slots.some(s => !!s.unit);
           
           if (hasChanges) {
               setShowEditConfirm(true);
               return;
           }
      }
      onEdit();
  };

  const handleSaveClick = () => {
      if (!onSave) return;
      setShowSaveModal(true);
  };

  const performSave = (name: string) => {
      if (!onSave) return;
      // Create a copy with the new name
      const deckToSave = { ...deck, name };
      onSave(deckToSave);
  };

  const handleShare = async () => {
    const hash = encodeDeck(deck);
    const url = `${window.location.origin}${window.location.pathname}?d=${hash}`;

    const success = await copyToClipboard(url);
    if (success) {
      triggerCopied();
      showToast("Deck link copied to clipboard.", "success");
    }
  };

  return (
    <>
      <div className="flex flex-col bg-surface-main h-auto rounded-xl w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center p-2 bg-surface-main z-10 gap-1 shrink-0 border-b border-border-subtle w-full relative">
          <div className="flex items-center gap-2 group text-center w-full px-4 justify-center">
              <h1 className="text-lg md:text-3xl font-black text-text-primary uppercase tracking-wider line-clamp-2 w-full text-center">
                {deck.name || "Untitled Deck"}
              </h1>
          </div>

          {/* Actions - Only Create Team remains here if present */}
          {onCreateTeam && (
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => onCreateTeam(deck)}
                data-testid="create-team-btn"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent text-text-primary hover:bg-brand-accent/90 transition-all text-[10px] font-bold uppercase tracking-wider shadow-lg"
              >
                <Users size={12} />
                Create Team
              </button>
            </div>
          )}
        </div>

        {/* Main Content - Centered Visual Display */}
        <div className="overflow-y-auto p-1 md:p-8 flex flex-col items-center bg-surface-dim shrink-0">
          <div className="flex flex-col items-center gap-2 max-w-5xl w-full">
            {/* Horizontal Deck Layout */}
            <div className="w-full bg-surface-card border border-border-default rounded-xl p-2 md:p-10 shadow-2xl relative overflow-hidden group">
              {/* Share Button - Absolute Top Right */}
               <button
                  onClick={handleShare}
                  data-testid="share-deck-btn"
                  className={cn(
                      "absolute top-2 right-2 z-20 p-2 rounded-full border transition-all shadow-lg",
                       copied
                      ? "bg-status-success text-brand-dark border-status-success-border"
                      : "bg-surface-inset border-border-default text-text-primary hover:bg-brand-primary hover:border-brand-primary hover:text-brand-dark"
                  )}
                  title="Share Deck"
               >
                  {copied ? <CheckCircle2 size={14} /> : <LinkIcon size={14} />}
               </button>

              {/* Validation Badge - Absolute Top Left */}
              <div
                className={cn(
                  "absolute top-2 left-2 z-20 flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg backdrop-blur-sm",
                  isValid
                    ? "bg-status-success text-brand-dark border-status-success-border"
                    : "bg-status-danger text-text-primary border-status-danger-border"
                )}
                title={isValid ? "Deck Valid" : errors.join("\n")}
                aria-label={isValid ? "Deck Valid" : "Deck Invalid"}
              >
                {isValid ? (
                  <CheckCircle2 size={16} strokeWidth={3} />
                ) : (
                  <AlertCircle size={16} strokeWidth={3} />
                )}
              </div>
              {/* Background Art (Optional: Uses Spellcaster Art) */}
              {deck.spellcaster && (
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <GameImage
                    src={getCardImageUrl(deck.spellcaster)}
                    alt={deck.spellcaster.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-surface-card via-surface-card/90 to-surface-card" />
                </div>
              )}

              <div className="relative z-10 w-full overflow-x-auto pb-4 flex justify-center">
                 <DeckOverview 
                    deck={deck} 
                    size="lg" 
                    onInspect={handleInspect}
                    onStopInspect={closeInspector}
                 />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-border-default flex justify-center bg-surface-main shrink-0 gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 border border-border-default text-text-muted font-bold uppercase tracking-widest rounded-lg hover:text-text-primary hover:bg-surface-card transition-all text-sm"
            >
              Close
            </button>
          )}

          {/* Case 1: Deck Exists -> Open */}
          {existingId ? (
            <button
              onClick={handleEditSafe}
              className="px-6 md:px-8 py-3 bg-brand-primary text-brand-dark font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-brand-primary/90 hover:scale-105 transition-all flex items-center gap-2 text-xs md:text-sm"
            >
              <Edit size={16} />
              Open from Collection
            </button>
          ) : (
            /* Case 2: New Deck -> Save OR Try */
            <>
              {isReadOnly && onSave && (
                <button
                  onClick={handleSaveClick}
                  data-testid="save-deck-btn"
                  className="px-6 md:px-8 py-3 bg-brand-primary text-brand-dark font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-brand-primary/90 hover:scale-105 transition-all flex items-center gap-2 text-xs md:text-sm"
                >
                  <Users size={16} />
                  Save
                </button>
              )}

              <button
                onClick={handleEditSafe}
                data-testid="edit-deck-btn"
                className={cn(
                  "px-6 md:px-10 py-3 font-black uppercase tracking-widest rounded-lg shadow-lg transition-all flex items-center gap-2 text-xs md:text-sm",
                  isReadOnly
                    ? "bg-surface-card text-text-secondary border border-border-default hover:bg-surface-hover hover:text-text-primary"
                    : "bg-brand-primary text-brand-dark hover:bg-brand-primary/90 hover:scale-105"
                )}
              >
                <Edit size={16} />
                {isReadOnly ? "Edit" : "Edit in Forge"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <SaveDeckModal
        deck={deck}
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={performSave}
        onOverwrite={performSave} 
      />

      {showEditConfirm && (
        <ImportConflictModal
            onCancel={() => setShowEditConfirm(false)}
            onConfirm={() => {
                setShowEditConfirm(false);
                onEdit();
            }}
            onSaveAndImport={() => {
                setShowEditConfirm(false);
                onEdit();
            }}
        />
      )}
    </>
  );
}
