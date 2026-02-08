import { useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import { Deck, DeckStats } from "@/types/deck";
import { Team } from "@/hooks/useTeamBuilder";
import { Trash2, Link as LinkIcon, Check, Save, Layers, Users, User, MoreHorizontal, ArrowRight, AlertCircle, GripVertical } from "lucide-react";
import { cn, getCardImageUrl } from "@/lib/utils";
import Image from "next/image";
import { encodeDeck, encodeTeam } from "@/lib/encoding";
import { validateDeck } from "@/lib/deck-validation";
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    TouchSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

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
    onSetMode?: (mode: 'SOLO' | 'TEAM') => void;
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
    children
}: ForgeControlsProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
        activationConstraint: {
            distance: 8, // Avoid accidental drags when clicking
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
        if (isTeamMode && savedListTab === 'TEAMS') {
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
  const [confirmSave, setConfirmSave] = useState<{ name: string; existingId: string; type: 'COLLISION' | 'UPDATE'; onSuccess?: () => void } | null>(null);
  const [savedListTab, setSavedListTab] = useState<'TEAMS' | 'SOLO'>('TEAMS');
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
        const hash = encodeTeam(teamDecks as [Deck, Deck, Deck], teamName || "Untitled Team");
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
   const [pendingAction, setPendingAction] = useState<{ type: 'LOAD_TEAM' | 'LOAD_DECK' | 'IMPORT'; action: () => void } | null>(null);

   const handleSafeLoadTeam = (id: string) => {
       const action = () => onLoadTeam?.(id);
       
       if (teamHasChanges) {
           setPendingAction({ type: 'LOAD_TEAM', action });
       } else {
           action();
       }
   };

   const handleSafeLoadDeck = (id: string) => {
       const action = () => onLoad(id);

       // In Solo Mode, check hasChanges
       if (hasChanges) {
           setPendingAction({ type: 'LOAD_DECK', action });
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
       const isSlotNotEmpty = deck.spellcaster || deck.slots.some(s => s.unit);
       
       if (teamHasChanges && isSlotNotEmpty) {
           setPendingAction({ type: 'IMPORT', action });
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
             setSavedListTab('TEAMS');
             setJustSaved(true);
             setTimeout(() => setJustSaved(false), 2000);
             onSuccess?.();
             return;
        }

        const nameToSave = (deck.name || "").trim();
        const collision = savedDecks.find(d => 
            (d.name || "").toLowerCase() === nameToSave.toLowerCase() && 
            d.id !== deck.id
        );

        if (collision) {
            setConfirmSave({ name: nameToSave, existingId: collision.id!, type: 'COLLISION', onSuccess });
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
            ? (isTeamClean ? "Close Team" : (activeTeamId ? "Update Team" : "Save Team")) 
            : ((isDeckClean || isNewClean) ? "Close Deck" : (deck.id ? "Update Deck" : "Save Deck"));

   return (
    <div className="h-full bg-surface-main border-l border-white/10 flex flex-col w-full animate-in fade-in slide-in-from-left-4 duration-200">
       
       {/* TOP: Fixed Header Section */}
        <div className="flex-1 border-b border-white/10 flex flex-col min-h-0">
            <div className="shrink-0 p-3 border-b border-white/10 space-y-3 bg-surface-main">
                 {/* Mode Toggle */}
                 <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 flex-1">
                     <button
                        onClick={() => onSetMode?.('SOLO')}
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
                        onClick={() => onSetMode?.('TEAM')}
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
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Team Name</span>
                            <input 
                                type="text" 
                                value={teamName || ''}
                                onChange={(e) => onRenameTeam?.(e.target.value.slice(0, 50))} 
                                placeholder="Name your team..."
                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm font-bold text-brand-primary placeholder:text-gray-600 focus:outline-none focus:border-brand-primary/50 transition-colors"
                            />
                        </div>
                    )}

                    {/* Deck Name */}
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                            {isTeamMode 
                                ? (activeTeamId ? "Editing Team" : "New Team Name")
                                : (deck.id ? "Editing Deck" : "New Deck Name")
                            }
                        </span>
                         <input 
                            type="text" 
                            value={deck.name || ''}
                            onChange={(e) => onRename(e.target.value.slice(0, 50))} 
                            placeholder={deck.spellcaster ? `${deck.spellcaster.name} Deck` : "Name your deck..."}
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
                         {justSaved ? <Check size={14} /> : (isTeamClean || isDeckClean || isNewClean) ? <ArrowRight size={14} className="rotate-180" /> : <Save size={14} />}
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
                            {copied ? "Copied" : (isTeamMode ? "Share Team" : "Share Deck")}
                         </button>
                </div>
            </div>

            {/* Main Content Wrapper */}
            <div className="flex-1 min-h-0 flex flex-col">
                {children && (
                    <div className="shrink-0 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                        {children}
                    </div>
                )}

            {/* Saved Lists Tabs */}
            {isTeamMode && (
                <div className="shrink-0 px-3 py-2 border-b border-white/5 flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                    <button 
                        onClick={() => setSavedListTab('TEAMS')}
                        className={cn("transition-colors", savedListTab === 'TEAMS' ? "text-brand-primary border-b border-brand-primary" : "text-gray-500 hover:text-gray-300")}
                    >
                        Teams ({savedTeams.length})
                    </button>
                    <button 
                        onClick={() => setSavedListTab('SOLO')}
                        className={cn("transition-colors", savedListTab === 'SOLO' ? "text-brand-primary border-b border-brand-primary" : "text-gray-500 hover:text-gray-300")}
                    >
                        Solo Decks ({savedDecks.length})
                    </button>
                </div>
            )}

           <div className="flex-1 overflow-y-auto p-2">
             <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
             >
               <div className="space-y-1">
                {(isTeamMode && savedListTab === 'TEAMS') ? (
                        savedTeams.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-xs">
                            <p className="mb-2">No saved teams.</p>
                            <span className="text-[10px] text-gray-700 block mb-2">Build your team and save it below.</span>
                        </div>
                        ) : (
                        <SortableContext 
                            items={savedTeams.map(t => t.id!)}
                            strategy={verticalListSortingStrategy}
                        >
                            {savedTeams.map(t => (
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
                ) : (
                    savedDecks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-xs">
                            <p className="mb-2">No saved decks.</p>
                            <span className="text-[10px] text-gray-700 block mb-2">Decks are saved in your browser&apos;s local storage.</span>
                        </div>
                    ) : (
                        <SortableContext 
                            items={savedDecks.map(d => d.id!)}
                            strategy={verticalListSortingStrategy}
                        >
                            {savedDecks.map(d => (
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
                    )
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
            onOverwrite={() => performSave(confirmSave.name, confirmSave.onSuccess)}
            onCopy={() => {
                if (confirmSave.type === 'UPDATE') {
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

function UnsavedChangesModal({ 
    type, 
    onConfirm, 
    onCancel,
    onSaveAndContinue,
    isNew
}: { 
    type: 'LOAD_TEAM' | 'LOAD_DECK' | 'IMPORT';
    onConfirm: () => void; 
    onCancel: () => void;
    onSaveAndContinue: () => void;
    isNew: boolean;
}) {
    const title = type === 'IMPORT' ? "Overwrite Slot?" : "Unsaved Changes";
    const description = type === 'IMPORT' 
        ? "Importing this deck will overwrite the current slot. You have unsaved changes in your team that will be affected."
        : `You have unsaved changes. Loading a new ${type === 'LOAD_TEAM' ? 'team' : 'deck'} will discard them.`;

    const confirmLabel = type === 'IMPORT' 
        ? "Overwrite" 
        : (isNew ? "Discard Changes" : "Discard & Load");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface-card border border-white/10 rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-4">
                <div className="space-y-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center mb-2">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {description}
                    </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                     {!isNew && (
                         <button 
                            onClick={onSaveAndContinue}
                            className="w-full py-2.5 rounded bg-brand-primary text-white hover:bg-brand-primary/80 font-bold shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={16} /> 
                            Update & Continue
                        </button>
                     )}

                    <button 
                        onClick={onConfirm}
                        className={cn(
                            "w-full py-2.5 rounded font-bold transition-all flex items-center justify-center gap-2",
                            isNew 
                                ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20" 
                                : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
                        )}
                    >
                        <Trash2 size={16} /> 
                        {confirmLabel}
                    </button>

                    <button 
                        onClick={onCancel}
                        className="w-full py-2.5 rounded text-gray-400 hover:text-white hover:bg-white/5 font-bold transition-all text-xs uppercase tracking-wider mt-1"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

function ConfirmationModal({ 
    name, 
    type,
    onOverwrite, 
    onCopy, 
    onCancel 
}: { 
    name: string; 
    type: 'COLLISION' | 'UPDATE';
    onOverwrite: () => void; 
    onCopy: () => void; 
    onCancel: () => void;
}) {
    const isUpdate = type === 'UPDATE';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface-card border border-white/10 rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-4">
                <div className="space-y-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center mb-2">
                        <Save size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                        {isUpdate ? "Save Changes?" : "Deck Already Exists"}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {isUpdate ? (
                            <>To deck <span className="text-white font-bold">&quot;{name}&quot;</span></>
                        ) : (
                            <>A deck named <span className="text-white font-bold">&quot;{name}&quot;</span> already exists.</>
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                    <button 
                        onClick={onOverwrite}
                        className="w-full py-2.5 rounded bg-brand-primary text-white hover:bg-brand-primary/80 font-bold shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={16} /> 
                        {isUpdate ? "Overwrite Existing" : "Overwrite"}
                    </button>
                    
                    <button 
                        onClick={onCopy}
                        className="w-full py-2.5 rounded bg-surface-main border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-bold transition-all flex items-center justify-center gap-2"
                    >
                       <Layers size={16} /> 
                       {isUpdate ? "Save as New Copy" : "Save as Copy"}
                    </button>

                    <button 
                        onClick={onCancel}
                        className="w-full py-2.5 rounded text-gray-400 hover:text-white hover:bg-white/5 font-bold transition-all text-xs uppercase tracking-wider mt-1"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

function TeamRow({ team, onLoad, onDelete, onDuplicate }: { team: Team, onLoad: () => void, onDelete: () => void, onDuplicate?: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: team.id! });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div 
            ref={setNodeRef}
            style={style}
            onClick={onLoad}
            {...attributes} 
            {...listeners}
            className={cn(
                "group flex flex-col p-2 rounded border bg-surface-card border-white/5 hover:border-white/20 hover:bg-white/5 transition-all relative overflow-visible gap-2 cursor-grab active:cursor-grabbing touch-none select-none",
                isDragging && "opacity-50 border-brand-primary cursor-grabbing"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <div 
                        className="p-1 text-gray-600 hover:text-gray-400 -ml-1 transition-colors"
                    >
                        <GripVertical size={14} />
                    </div>
                    <div className="font-bold text-gray-200 text-sm truncate">{team.name}</div>
                </div>
                <div className="flex gap-1 shrink-0 items-center">
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onLoad();
                        }}
                        className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase rounded hover:bg-brand-primary hover:text-white transition-colors"
                    >
                        Load
                    </button>
                    <ItemMenu 
                        onDuplicate={onDuplicate} 
                        onDelete={onDelete}
                        type="TEAM"
                        onCopyLink={async () => {
                            const hash = encodeTeam(team.decks);
                            const url = `${window.location.origin}${window.location.pathname}?team=${hash}`;
                            await copyToClipboard(url);
                        }}
                    />
                </div>
            </div>
            <div className="flex -space-x-1.5 overflow-hidden">
                {team.decks.map((d, i) => (
                    d.spellcaster && (
                        <div key={i} className="w-8 h-8 rounded-full border border-surface-card bg-black/50 overflow-hidden ring-2 ring-surface-card shrink-0 relative">
                            <Image src={getCardImageUrl(d.spellcaster)} alt="" fill className="object-cover" />
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

// ... (existing imports)

function DeckRow({ deck, isActive, isTeamMode, onLoad, onDelete, onDuplicate }: { 
    deck: Deck, 
    isActive: boolean, 
    isTeamMode: boolean,
    onLoad: () => void,
    onDelete: () => void,
    onDuplicate: () => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: deck.id! });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    const { isValid, errors } = validateDeck(deck);

    return (
        <div 
            ref={setNodeRef}
            style={style}
            onClick={onLoad}
            {...attributes} 
            {...listeners}
            className={cn(
                "group flex items-center p-2 rounded cursor-grab active:cursor-grabbing touch-none select-none border transition-all relative overflow-visible",
                isActive 
                    ? "bg-brand-primary/10 border-brand-primary/50" 
                    : "bg-surface-card border-white/5 hover:border-white/20 hover:bg-white/5",
                isDragging && "opacity-50 border-brand-primary cursor-grabbing"
            )}
        >
            <div 
                className="p-1 text-gray-600 hover:text-gray-400 -ml-1 mr-1 transition-colors"
            >
                <GripVertical size={14} />
            </div>

            {/* Content Container - Grid for better layout */}
            <div className="flex-1 grid grid-rows-[auto_1fr] gap-1 min-w-0">
                
                {/* Top Row: Name + Menu */}
                <div className="flex items-center justify-between gap-2">
                    <div className={cn(
                        "font-bold truncate text-sm",
                        isActive ? "text-brand-primary" : "text-gray-200"
                    )}>
                        {deck.name}
                    </div>
                </div>

                {/* Bottom Row: Avatar + Units + Actions */}
                <div className="flex items-center gap-3">
                    {/* Avatar with Badge */}
                    <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black shadow-sm">
                            {deck.spellcaster ? (
                                <Image src={getCardImageUrl(deck.spellcaster)} alt="" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold text-[10px]">?</div>
                            )}
                        </div>
                        <div className={cn(
                            "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-surface-card flex items-center justify-center",
                            isValid ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        )} title={isValid ? "Valid Deck" : errors[0]}>
                            {isValid ? <Check size={6} strokeWidth={4} /> : <AlertCircle size={6} strokeWidth={4} />}
                        </div>
                    </div>

                    {/* Units Preview (Small) */}
                    {!isTeamMode && (
                        <div className="flex items-center -space-x-1 hover:space-x-0 transition-all overflow-hidden">
                            {deck.slots.slice(0, 4).map((s, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-black/50 border border-white/10 overflow-hidden shrink-0 relative z-0 hover:z-10 transition-all">
                                   {s.unit &&  (
                                       <Image src={getCardImageUrl(s.unit)} alt="" fill className="object-cover opacity-80" />
                                   )}
                                </div>
                            ))}
                            {/* Titan */}
                            <div className="w-6 h-6 rounded-full bg-brand-accent/10 border border-brand-accent/30 overflow-hidden shrink-0 relative z-0 hover:z-10 ml-1">
                                {deck.slots[4].unit && (
                                    <Image src={getCardImageUrl(deck.slots[4].unit)} alt="" fill className="object-cover opacity-80" />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grow" />

                     {/* Actions */}
                     <div className="flex items-center gap-1 shrink-0">
                     {isTeamMode && (
                         <button className="flex items-center gap-1 px-1.5 py-0.5 bg-brand-primary text-white text-[9px] font-bold uppercase rounded shadow-lg hover:bg-brand-primary/80 transition-colors">
                            Import <ArrowRight size={8} />
                         </button>
                     )}
                         <ItemMenu 
                            onDuplicate={onDuplicate}
                            onDelete={onDelete}
                            onCopyLink={async () => {
                                const hash = encodeDeck(deck);
                                const url = `${window.location.origin}${window.location.pathname}?d=${hash}`;
                                await copyToClipboard(url);
                            }}
                            type="DECK"
                         />
                     </div>
                </div>
            </div>
        </div>
    );
}

function ItemMenu({ 
    onDuplicate, 
    onDelete, 
    onCopyLink,
    type
}: { 
    onDuplicate?: () => void, 
    onDelete: () => void, 
    onCopyLink?: () => void,
    type: 'DECK' | 'TEAM'
}) {
    const [showMenu, setShowMenu] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    
    // Derived labels
    const duplicateLabel = type === 'TEAM' ? "Duplicate Team" : "Duplicate Deck";
    const shareLabel = type === 'TEAM' ? "Share Team" : "Share Deck";

    // Close on scroll/resize/click outside
    useEffect(() => {
        if (!showMenu) return;
        const handleScroll = () => setShowMenu(false);
        const handleResize = () => setShowMenu(false);
        const handleClick = (e: MouseEvent) => {
             // If click is outside button and outside menu (handled by portal stopPropagation)
             if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
                 setShowMenu(false);
             }
        };

        window.addEventListener('scroll', handleScroll, { capture: true });
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClick);
        
        return () => {
             window.removeEventListener('scroll', handleScroll, { capture: true });
             window.removeEventListener('resize', handleResize);
             document.removeEventListener('mousedown', handleClick);
        };
    }, [showMenu]);

    // Handle Delete Click - If we have a custom modal, use it. Otherwise, assume parent handles confirmation?
    // Actually, the request is to make the POPUP better. So we should show a modal ON TOP of everything.
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!showMenu && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
             setMenuPos({ 
                top: rect.bottom + 4, 
                left: rect.right - 128 + 20 
            });
        }
        setShowMenu(!showMenu);
    };

    return (
        <>
             <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
             >
                <MoreHorizontal size={16} />
             </button>
             
             {showMenu && typeof document !== 'undefined' && createPortal(
                 <div 
                     className="fixed w-48 bg-surface-card border border-brand-primary/30 rounded-lg shadow-xl overflow-hidden flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100"
                    style={{ 
                        top: menuPos.top, 
                        left: Math.max(10, Math.min(window.innerWidth - 200, menuPos.left)),
                        zIndex: 9999
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                 >
                     {onDuplicate && (
                         <button
                            type="button"
                            onClick={(e) => { 
                                e.preventDefault();
                                e.stopPropagation(); 
                                onDuplicate(); 
                                setShowMenu(false); 
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                         >
                            <Layers size={14} /> 
                            <span>{duplicateLabel}</span>
                         </button>
                     )}
                     
                     {onCopyLink && (
                         <button
                            type="button"
                            onClick={(e) => { 
                                e.preventDefault();
                                e.stopPropagation(); 
                                onCopyLink();
                                setShowMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                         >

                            <LinkIcon size={14} /> 
                            <span>{shareLabel}</span>
                         </button>
                     )}
                     
                     <div className="h-px bg-white/5 my-1" />
                     
                     <button
                        type="button"
                        onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation(); 
                            // Close menu, open modal
                            setShowMenu(false);
                            setShowDeleteConfirm(true);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                     >
                        <Trash2 size={14} /> 
                        <span>Delete</span>
                     </button>
                 </div>,
                 document.body
             )}

             {showDeleteConfirm && createPortal(
                 <DeleteConfirmationModal 
                    type={type}
                    onConfirm={() => {
                        onDelete();
                        setShowDeleteConfirm(false);
                    }}
                    onCancel={() => setShowDeleteConfirm(false)}
                 />,
                 document.body
             )}
        </>
    );
}

function DeleteConfirmationModal({ 
    type, 
    onConfirm, 
    onCancel 
}: { 
    type: 'DECK' | 'TEAM';
    onConfirm: () => void; 
    onCancel: () => void; 
}) {
    return (
        <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={(e) => {
                e.stopPropagation();
                onCancel();
            }}
        >
            <div 
                className="bg-surface-card border border-white/10 rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="space-y-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-2">
                        <Trash2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                        Delete {type === 'TEAM' ? 'Team' : 'Deck'}?
                    </h3>
                    <p className="text-sm text-gray-400">
                        Are you sure you want to delete this {type === 'TEAM' ? 'team' : 'deck'}? This action cannot be undone.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                        onClick={onCancel}
                        className="w-full py-2.5 rounded bg-surface-main border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-bold transition-all text-xs uppercase tracking-wider"
                    >
                        Cancel
                    </button>
                    
                    <button 
                        onClick={onConfirm}
                        className="w-full py-2.5 rounded bg-red-500 text-white hover:bg-red-600 font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} /> 
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

