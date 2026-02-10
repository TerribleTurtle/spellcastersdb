import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ArrowRight,
  Check,
  Link as LinkIcon,
  Save,
  User,
  Users,
} from "lucide-react";

import { Team } from "@/hooks/useTeamBuilder";
import { copyToClipboard } from "@/lib/clipboard";
import { encodeDeck, encodeTeam } from "@/lib/encoding";
import { cn } from "@/lib/utils";
import { Deck, DeckStats } from "@/types/deck";
import { UnsavedChangesModal } from "@/components/modals/UnsavedChangesModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { DeckRow } from "./DeckRow";
import { TeamRow } from "./TeamRow";

interface ForgeControlsProps {
  stats: DeckStats;
  validation: {
    isValid: boolean;
    errors: string[];
    reminder: string | null;
  };
  onClear: () => void;
  deck: Deck;
  savedDecks: Deck[];
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (name: string) => void;
  onDuplicate: (id: string) => void;
  isTeamMode?: boolean;
  onSetMode?: (mode: "SOLO" | "TEAM") => void;
  onImportSolo?: (deck: Deck) => void;
  savedTeams?: Team[];
  onLoadTeam?: (id: string) => void;
  onDeleteTeam?: (id: string) => void;
  teamName?: string;
  onRenameTeam?: (name: string) => void;
  onDuplicateTeam?: (id: string) => void;
  onReorderDecks?: (decks: Deck[]) => void;
  onReorderTeams?: (teams: Team[]) => void;

  onSaveAsCopy?: (name?: string) => void;
  onSaveTeam?: (deck?: Deck) => void;
  activeTeamId?: string | null;
  teamHasChanges?: boolean;
  hasChanges?: boolean;
  onClearTeam?: () => void;
  teamDecks?: [Deck, Deck, Deck] | null; // For sharing
  children?: React.ReactNode;
}

export function ForgeControls({
  onClear,
  deck,
  savedDecks,
  onSave,
  onSaveAsCopy,
  onLoad,
  onDelete,
  onRename,

  onDuplicate,
  isTeamMode = false,
  onSetMode,
  onImportSolo,
  savedTeams = [],
  onLoadTeam,
  onDeleteTeam,
  teamName,
  onRenameTeam,
  onDuplicateTeam,

  onSaveTeam,
  activeTeamId,
  teamHasChanges,
  hasChanges = true, // Default to true to allow saving if not specified
  onClearTeam,
  teamDecks,
  onReorderDecks,
  onReorderTeams,
  children,
}: ForgeControlsProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (isTeamMode && savedListTab === "TEAMS") {
        const oldIndex = savedTeams.findIndex((t) => t.id === active.id);
        const newIndex = savedTeams.findIndex((t) => t.id === over.id);
        if (onReorderTeams) {
          onReorderTeams(arrayMove(savedTeams, oldIndex, newIndex));
        }
      } else {
        const oldIndex = savedDecks.findIndex((d) => d.id === active.id);
        const newIndex = savedDecks.findIndex((d) => d.id === over.id);
        if (onReorderDecks) {
          onReorderDecks(arrayMove(savedDecks, oldIndex, newIndex));
        }
      }
    }
  };
  // ... (state and handlers remain same)
  const [copied, setCopied] = useState(false);
  const [confirmSave, setConfirmSave] = useState<{
    name: string;
    existingId: string;
    type: "COLLISION" | "UPDATE";
    onSuccess?: () => void;
  } | null>(null);
  const [savedListTab, setSavedListTab] = useState<"TEAMS" | "SOLO">("TEAMS");
  const [justSaved, setJustSaved] = useState(false);

  // ... (handleShare, performSave, performSaveAsCopy, handleSave, saveLabel logic remains same)

  const handleShare = async () => {
    let url = window.location.href; // Default to current URL (works for Team Mode)

    if (!isTeamMode) {
      // Solo Mode
      const hash = encodeDeck(deck);
      url = `${window.location.origin}${window.location.pathname}?d=${hash}`;
    } else if (teamDecks) {
      // Team Mode
      // We need to inject the current deck into the teamDecks array for the active slot
      // because teamDecks might be stale compared to the editor state?
      // Actually, DeckBuilderApp passes down `team.teamDecks`.
      // Let's verify if `team.teamDecks` includes the current edits.
      // `useTeamBuilder` updates `teamDecks` state on every change.
      // So `teamDecks` passed here should be up to date.

      // V2 Encoding: Pass team name directly
      const hash = encodeTeam(
        teamDecks as [Deck, Deck, Deck],
        teamName || "Untitled Team"
      );
      url = `${window.location.origin}${window.location.pathname}?team=${hash}`;
    }

    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      console.error("Failed to copy URL");
      // Optional: Show error toast
      alert("Failed to copy URL. Please copy manually from address bar.");
    }
  };

  const performSave = (name: string, onSuccess?: () => void) => {
    onSave(name);
    setJustSaved(true);
    if (onSuccess) {
      onSuccess();
    } else {
      onClear();
    }
    setConfirmSave(null);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const performSaveAsCopy = (name: string, onSuccess?: () => void) => {
    if (onSaveAsCopy) {
      onSaveAsCopy(name);
      setJustSaved(true);
      if (onSuccess) {
        onSuccess();
      } else {
        onClear();
      }
      setConfirmSave(null);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  // --- Safe Load / Import Logic ---
  const [pendingAction, setPendingAction] = useState<{
    type: "LOAD_TEAM" | "LOAD_DECK" | "IMPORT";
    action: () => void;
  } | null>(null);

  const handleSafeLoadTeam = (id: string) => {
    const action = () => onLoadTeam?.(id);

    if (teamHasChanges) {
      setPendingAction({ type: "LOAD_TEAM", action });
    } else {
      action();
    }
  };

  const handleSafeLoadDeck = (id: string) => {
    const action = () => onLoad(id);

    // In Solo Mode, check hasChanges
    if (hasChanges) {
      setPendingAction({ type: "LOAD_DECK", action });
    } else {
      action();
    }
  };

  const handleSafeImportSolo = (d: Deck) => {
    const action = () => {
      if (onImportSolo) onImportSolo(d);
    };

    // In Team Mode, if team has changes, importing overwrites the active slot
    // and potentially discards unsaved work in that slot (or other slots if we reload).
    // However, importing IS a change. We only warn if the user has PREVIOUS unsaved changes
    // that might be blown away or if they interpret "Import" as "Open".
    // Sticking to "If dirty, warn" is safest for now.
    // Also checking if the current deck is not empty is a good heuristic for "Am I overwriting something?"
    const isSlotNotEmpty = deck.spellcaster || deck.slots.some((s) => s.unit);

    if (teamHasChanges && isSlotNotEmpty) {
      setPendingAction({ type: "IMPORT", action });
    } else {
      action();
    }
  };

  const isTeamClean = isTeamMode && activeTeamId && teamHasChanges === false;
  const isDeckClean = !isTeamMode && deck.id && hasChanges === false;
  const isNewClean = !isTeamMode && !deck.id && hasChanges === false; // Empty new deck

  const handleSave = (onSuccess?: () => void) => {
    // If clean (no changes), acts as "Close" / "Clear"
    if (isTeamClean) {
      if (onClearTeam) {
        onClearTeam();
      } else {
        onClear();
      }
      onSuccess?.();
      return;
    }

    if (isDeckClean || isNewClean) {
      onClear();
      onSuccess?.();
      return;
    }

    if (isTeamMode) {
      onSaveTeam?.(deck);
      setSavedListTab("TEAMS");
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      onSuccess?.();
      return;
    }

    const nameToSave = (deck.name || "").trim();
    const collision = savedDecks.find(
      (d) =>
        (d.name || "").toLowerCase() === nameToSave.toLowerCase() &&
        d.id !== deck.id
    );

    if (collision) {
      setConfirmSave({
        name: nameToSave,
        existingId: collision.id!,
        type: "COLLISION",
        onSuccess,
      });
      return;
    }

    // Fix: If updating an existing deck (has ID), we do NOT want to clear automatically.
    // We only clear if it's a new deck save (default behavior of performSave).
    if (deck.id) {
      // Update -> Persist (don't clear)
      // We pass a no-op onSuccess if none provided, to override performSave's default onClear
      performSave(nameToSave, onSuccess || (() => {}));
    } else {
      // New Save -> Clear (Default)
      performSave(nameToSave, onSuccess);
    }
  };

  const saveLabel = justSaved
    ? "Saved"
    : isTeamMode
      ? isTeamClean
        ? "Close Team"
        : activeTeamId
          ? "Update Team"
          : "Save Team"
      : isDeckClean || isNewClean
        ? "Close Deck"
        : deck.id
          ? "Update Deck"
          : "Save Deck";

  return (
    <div className="h-full bg-surface-main border-l border-white/10 flex flex-col w-full animate-in fade-in slide-in-from-left-4 duration-200">
      {/* TOP: Fixed Header Section */}
      <div className="flex-1 border-b border-white/10 flex flex-col min-h-0">
        <div className="shrink-0 p-3 border-b border-white/10 space-y-3 bg-surface-main">
          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 flex-1">
            <button
              onClick={() => onSetMode?.("SOLO")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                !isTeamMode
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              )}
            >
              <User size={12} />
              Solo
            </button>
            <button
              onClick={() => onSetMode?.("TEAM")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 md:py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                isTeamMode
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              )}
            >
              <Users size={12} />
              Team
            </button>
          </div>

          {/* Unified Name Inputs */}
          <div className="space-y-2">
            {/* Team Name */}
            {isTeamMode && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Team Name
                </span>
                <input
                  type="text"
                  value={teamName || ""}
                  onChange={(e) => onRenameTeam?.(e.target.value.slice(0, 50))}
                  placeholder="Name your team..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                      handleSave();
                    }
                  }}
                  className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm font-bold text-brand-primary placeholder:text-gray-600 focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
            )}

            {/* Deck Name */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                {isTeamMode
                  ? activeTeamId
                    ? "Editing Team"
                    : "New Team Name"
                  : deck.id
                    ? "Editing Deck"
                    : "New Deck Name"}
              </span>
              <input
                type="text"
                value={deck.name || ""}
                onChange={(e) => onRename(e.target.value.slice(0, 50))}
                placeholder={
                  deck.spellcaster
                    ? `${deck.spellcaster.name} Deck`
                    : "Name your deck..."
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                    handleSave();
                  }
                }}
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Top Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleSave()}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded border transition-all text-xs font-bold shadow-lg",
                justSaved
                  ? "bg-green-500 border-green-400 text-white"
                  : "bg-brand-primary border-brand-accent/50 text-white hover:bg-brand-primary/80"
              )}
            >
              {justSaved ? (
                <Check size={14} />
              ) : isTeamClean || isDeckClean || isNewClean ? (
                <ArrowRight size={14} className="rotate-180" />
              ) : (
                <Save size={14} />
              )}
              {saveLabel}
            </button>

            <button
              onClick={handleShare}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded border transition-all text-xs font-bold",
                copied
                  ? "bg-green-500/20 border-green-500/50 text-green-400"
                  : "bg-surface-card border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              {copied ? <Check size={14} /> : <LinkIcon size={14} />}
              {copied ? "Copied" : isTeamMode ? "Share Team" : "Share Deck"}
            </button>
          </div>
        </div>

        {/* Main Content Wrapper */}
        <div className="flex-1 min-h-0 flex flex-col">
          {children && (
            <div className="shrink-0 px-3 py-2 border-b border-white/5 bg-white/2">
              {children}
            </div>
          )}

          {/* Saved Lists Tabs */}
          {isTeamMode && (
            <div className="shrink-0 px-3 py-2 border-b border-white/5 flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              <button
                onClick={() => setSavedListTab("TEAMS")}
                className={cn(
                  "transition-colors",
                  savedListTab === "TEAMS"
                    ? "text-brand-primary border-b border-brand-primary"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                Teams ({savedTeams.length})
              </button>
              <button
                onClick={() => setSavedListTab("SOLO")}
                className={cn(
                  "transition-colors",
                  savedListTab === "SOLO"
                    ? "text-brand-primary border-b border-brand-primary"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                Solo Decks ({savedDecks.length})
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 overscroll-y-contain">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
              <div className="space-y-1">
                {isTeamMode && savedListTab === "TEAMS" ? (
                  savedTeams.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      <p className="mb-2">No saved teams.</p>
                      <span className="text-[10px] text-gray-700 block mb-2">
                        Build your team and save it below.
                      </span>
                    </div>
                  ) : (
                    <SortableContext
                      items={savedTeams.map((t) => t.id!)}
                      strategy={verticalListSortingStrategy}
                    >
                      {savedTeams.map((t) => (
                        <TeamRow
                          key={t.id}
                          team={t}
                          onLoad={() => handleSafeLoadTeam(t.id!)}
                          onDelete={() => onDeleteTeam?.(t.id!)}
                          onDuplicate={() => onDuplicateTeam?.(t.id!)}
                        />
                      ))}
                    </SortableContext>
                  )
                ) : savedDecks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    <p className="mb-2">No saved decks.</p>
                    <span className="text-[10px] text-gray-700 block mb-2">
                      Decks are saved in your browser&apos;s local storage.
                    </span>
                  </div>
                ) : (
                  <SortableContext
                    items={savedDecks.map((d) => d.id!)}
                    strategy={verticalListSortingStrategy}
                  >
                    {savedDecks.map((d) => (
                      <DeckRow
                        key={d.id}
                        deck={d}
                        isActive={deck.id === d.id}
                        isTeamMode={isTeamMode}
                        onLoad={() => {
                          if (isTeamMode) {
                            handleSafeImportSolo(d);
                          } else {
                            handleSafeLoadDeck(d.id!);
                          }
                        }}
                        onDelete={() => onDelete(d.id!)}
                        onDuplicate={() => onDuplicate(d.id!)}
                      />
                    ))}
                  </SortableContext>
                )}
              </div>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmSave && (
        <ConfirmationModal
          name={confirmSave.name}
          type={confirmSave.type}
          onOverwrite={() =>
            performSave(confirmSave.name, confirmSave.onSuccess)
          }
          onCopy={() => {
            if (confirmSave.type === "UPDATE") {
              performSaveAsCopy(confirmSave.name, confirmSave.onSuccess);
            } else {
              performSaveAsCopy(confirmSave.name, confirmSave.onSuccess);
            }
          }}
          onCancel={() => setConfirmSave(null)}
        />
      )}
      {/* Unsaved Changes Modal */}
      {pendingAction && (
        <UnsavedChangesModal
          type={pendingAction.type}
          onConfirm={() => {
            pendingAction.action();
            setPendingAction(null);
          }}
          onCancel={() => setPendingAction(null)}
          isNew={isTeamMode ? !activeTeamId : !deck.id}
          onSaveAndContinue={() => {
            // Close the unsaved modal first
            setPendingAction(null);
            // Then trigger save with pending action as callback
            handleSave(() => {
              pendingAction.action();
            });
          }}
        />
      )}
    </div>
  );
}

// End of file (components extracted)
