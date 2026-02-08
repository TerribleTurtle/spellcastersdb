"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Unit, Spellcaster } from "@/types/api";
import { Deck } from "@/types/deck";
import { STORAGE_KEY_CURRENT, STORAGE_KEY_SAVED, StoredDeck, useDeckBuilder } from "@/hooks/useDeckBuilder";
import { useTeamBuilder, TEAM_SLOT_KEYS, STORAGE_KEY_SAVED_TEAMS } from "@/hooks/useTeamBuilder";
import { TeamOverview } from "./TeamOverview";

import { DeckEditor } from "./DeckEditor";
import { SoloOverview } from "./SoloOverview";
import { decodeDeck } from "@/lib/encoding";

interface DeckBuilderAppProps {
  units: Unit[];
  spellcasters: Spellcaster[];
}

export function DeckBuilderApp({ units, spellcasters }: DeckBuilderAppProps) {
  // --- Team Builder Integration ---
  const [mode, setMode] = useState<'SOLO' | 'TEAM'>('SOLO');
  const [viewSummary, setViewSummary] = useState(false);
  const [viewingTeamData, setViewingTeamData] = useState<Deck[] | null>(null); // PURE VIEW MODE
  const [viewingTeamId, setViewingTeamId] = useState<string | null>(null); // If viewing a saved team
  const [viewingDeckData, setViewingDeckData] = useState<Deck | null>(null); // PURE VIEW MODE (SOLO)
  const [viewingDeckId, setViewingDeckId] = useState<string | null>(null); // If viewing a saved deck
  const [pendingImport, setPendingImport] = useState<Deck | null>(null); // passed to editor to trigger import
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'BROWSER' | 'INSPECTOR' | 'FORGE'>('BROWSER');
  const team = useTeamBuilder(units, spellcasters);

  const deckBuilder = useDeckBuilder(units, spellcasters, null, STORAGE_KEY_SAVED);
  
  const STORAGE_KEY_APP_STATE = 'spellcasters_app_state_v1';
  const hasHydratedState = useRef(false);


  // When switching to Team Mode, default to slot 0 if none active
  const handleSetMode = (newMode: 'SOLO' | 'TEAM') => {
      setMode(newMode);
      if (newMode === 'TEAM') {
          // Clean Solo params when entering Team Mode
          const url = new URL(window.location.href);
          url.searchParams.delete('d');
          router.replace(url.pathname + url.search);

          if (team.activeSlot === null) {
              team.enterEditMode(0);
          }
      }
      if (newMode === 'SOLO') {
        // Clean Team params when entering Solo Mode
        const url = new URL(window.location.href);
        url.searchParams.delete('team');
        url.searchParams.delete('tname');
        router.replace(url.pathname + url.search);

        setViewSummary(false);
      }
  };
  
  // Calculate specific storage key based on mode
  const isTeamMode = mode === 'TEAM';
  
  // If in Team Mode and editing a slot, use that slot's key. Otherwise (Solo) use default.
  // KEY FIX: We derive the key here, and pass it to DeckEditor. 
  // The DeckEditor will be keyed by this value, forcing a remount on change.
  const activeStorageKey = isTeamMode && team.activeSlot !== null 
      ? TEAM_SLOT_KEYS[team.activeSlot] 
      : STORAGE_KEY_CURRENT;

  const router = useRouter(); 
  const searchParams = useSearchParams();

  // URL Import Logic - TEAM PARAMETERS
  const hasCheckedUrlRef = useRef(false);
  useEffect(() => {
    // Priority 0: Hydrate App State (Mode, ViewSummary)
    // We also check 'lastTeamHash' to see if this is a reload of the SAME URL
    let lastHash = null;
    let hydratedMode = mode; // Default to current state

    if (!hasHydratedState.current) {
        const rawState = localStorage.getItem(STORAGE_KEY_APP_STATE);
        if (rawState) {
            try {
                const s = JSON.parse(rawState);
                if (s.mode) {
                    setMode(s.mode);
                    hydratedMode = s.mode; // Capture for immediate use
                }
                if (s.viewSummary !== undefined) setViewSummary(s.viewSummary);
                if (s.lastTeamHash) lastHash = s.lastTeamHash;
            } catch (e) { console.error("Failed to hydrate app state", e); }
        }
        hasHydratedState.current = true;
    }

    if (hasCheckedUrlRef.current) return;
    hasCheckedUrlRef.current = true;

    const teamHash = searchParams.get('team');
    // Priority: Team Hash > Deck Hash
    if (teamHash) {
         // RELOAD OPTIMIZATION:
         // If the URL hash matches the last seen hash for this session, 
         // we assume the user is just reloading their active workspace.
         // We skip the entire import/comparison logic and trust localStorage.
         // NOTE: Use hydratedMode to avoid race condition with useState
         if (lastHash === teamHash && hydratedMode === 'TEAM') {
             return;
         }


         import("@/lib/encoding").then(({ decodeTeam }) => {
             const { name: decodedName, decks: decodedDecks } = decodeTeam(teamHash);
             const importedDecks: StoredDeck[] = []; // Capture for comparison
             
             // Helper to normalize null/undefined
             const normalizeId = (id: string | null | undefined) => id || null;

             decodedDecks.forEach((d, idx) => {
                 if (idx > 2 || !d) return;
                 
                 const slots = (d.slotIds || []).map(normalizeId) as [string | null, string | null, string | null, string | null, string | null];
                 while (slots.length < 5) slots.push(null);

                 const stored: StoredDeck = { 
                     id: undefined, // Imported decks don't keep their origin IDs
                     name: d.name || "Imported Deck",
                     spellcasterId: normalizeId(d.spellcasterId),
                     slotIds: slots
                 };

                 importedDecks.push(stored);
             });

             // Check if this matches a saved team
             const savedTeamsRaw = localStorage.getItem(STORAGE_KEY_SAVED_TEAMS);

             
             // Fingerprint: stringify fields cleanly
             // We need to be careful about object key order, so we manually construct the string
             const fingerprint = (sc: string | null | undefined, s: (string | null | undefined)[]) => {
                 const cleanSc = normalizeId(sc);
                 const cleanSlots = s.map(normalizeId);
                 // Simple pipe-delimited string
                 return `${cleanSc}|${cleanSlots.join('|')}`;
             };

             const importedFingerprints = importedDecks.map(d => fingerprint(d.spellcasterId, d.slotIds));
             
             // Debug Logging


             // 1. Check against CURRENT local storage (Active Slots)
             // This handles the "Reload" case where we are already editing this team
             const currentActiveFingerprints = TEAM_SLOT_KEYS.map(key => {
                 try {
                     const raw = localStorage.getItem(key);
                     if (!raw) return fingerprint(null, [null,null,null,null,null]);
                     const d = JSON.parse(raw);
                     return fingerprint(d.spellcasterId, d.slotIds);
                 } catch { return fingerprint(null, [null,null,null,null,null]); }
             });
             
             const isReloadingCurrent = JSON.stringify(importedFingerprints) === JSON.stringify(currentActiveFingerprints);

             if (isReloadingCurrent) {
                 // We are just reloading the page. 
                 setMode('TEAM');
                 setViewingTeamData(null); // Clear view mode
                 setIsReadOnly(false);
                 return; 
             }

             // --- VIEW MODE ONLY ---
             // We do NOT overwrite local storage here. We just set the view state.
             
             // Check if we have this team saved already, to set the "Saved" context
             if (savedTeamsRaw && importedDecks.length === 3) {
                 try {
                     const savedTeams = JSON.parse(savedTeamsRaw) as { id: string, name: string, deckData: StoredDeck[] }[];
                     const found = savedTeams.find(saved => {
                         if (!saved.deckData || saved.deckData.length !== 3) return false;
                         const savedFingerprints = saved.deckData.map(d => fingerprint(d.spellcasterId, d.slotIds));
                         
                         return JSON.stringify(importedFingerprints) === JSON.stringify(savedFingerprints);
                     });

                     if (found) {
                         // We can use this to prompt: "You already have this team!"
                         // For now just log it
                     }
                 } catch (e) { console.error("Error checking saved teams match", e); }
             }



             // Start in View Mode
             setMode('TEAM');
             setViewSummary(true);
             setIsReadOnly(true);
             
             // Reconstruct full Decks to pass to View
             import("@/hooks/useDeckBuilder").then(({ reconstructDeck }) => {
                const fullDecks = importedDecks.map(d => reconstructDeck(d, units, spellcasters));
                setViewingTeamData(fullDecks);
                
                 // If we found a name in URL, use it for display
                const tnameParam = searchParams.get('tname');
                // const finalTeamName = decodedName || tnameParam || "Imported Team";

                // We'll handle this by passing teamName override to TeamOverview via URL param hack or state?
                // Actually `TeamOverview` takes `teamName` prop.
                // We are passing `searchParams.get('tname')` to TeamOverview currently.
                // We should update the URL to include the name if it was decoded but missing in params?
                // Or just rely on the component using the name we pass.
                // But `DeckBuilderApp` renders `TeamOverview` with `teamName={searchParams.get('tname') || team.teamName}`
                // We should update the URL to allow TeamOverview to see it, OR update how we pass it.
                
                // Let's update the URL params to match what we found, so the UI is consistent
                if (decodedName && decodedName !== tnameParam) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('tname', decodedName);
                    router.replace(url.pathname + url.search);
                }

                 // Check if we have this team saved already
                 if (savedTeamsRaw) {
                     try {
                         const savedTeams = JSON.parse(savedTeamsRaw) as { id: string, name: string, deckData: StoredDeck[] }[];
                         const found = savedTeams.find(saved => {
                             if (!saved.deckData || saved.deckData.length !== 3) return false;
                             const savedFingerprints = saved.deckData.map(d => fingerprint(d.spellcasterId, d.slotIds));
                             return JSON.stringify(importedFingerprints) === JSON.stringify(savedFingerprints);
                         });
 
                         if (found) {
                             setViewingTeamId(found.id);
                         }
                     } catch (e) { console.error("Error checking saved teams match", e); }
                 }
             });
             
             // If known saved team, we could hint that.
         });
         return;
    }

    // Hash Logic - SOLO PARAMETERS (?d=)
    const deckHash = searchParams.get('d');
    if (deckHash && mode === 'SOLO') {
        const decoded = decodeDeck(deckHash);
        if (decoded) {
            // Reconstruct Deck Object
            const spellcaster = spellcasters.find(s => s.hero_id === decoded.spellcasterId) || null;
            const newDeck: Deck = {
                spellcaster,
                slots: [
                    { index: 0, unit: null, allowedTypes: ['UNIT'] },
                    { index: 1, unit: null, allowedTypes: ['UNIT'] },
                    { index: 2, unit: null, allowedTypes: ['UNIT'] },
                    { index: 3, unit: null, allowedTypes: ['UNIT'] },
                    { index: 4, unit: null, allowedTypes: ['TITAN'] },
                ],
                name: decoded.name || (spellcaster ? `${spellcaster.name} Import` : "Imported Deck")
            };

            decoded.slotIds.forEach((id, idx) => {
                if (idx > 4) return;
                if (id) {
                    const unit = units.find(u => u.entity_id === id);
                    if (unit) {
                        newDeck.slots[idx] = { ...newDeck.slots[idx], unit };
                    }
                }
            });

            // Set View Mode
            setViewingDeckData(newDeck);
            setIsReadOnly(true);

            // Check if Deck Exists in Saved Decks
            // We need to fetch from localStorage manually because deckBuilder.savedDecks might not be hydrated yet?
            // Actually, let's trust localStorage for this check.
            const savedDecksRaw = localStorage.getItem(STORAGE_KEY_SAVED);
            if (savedDecksRaw) {
                try {
                    const savedDecks = JSON.parse(savedDecksRaw) as StoredDeck[];
                    const normalizeId = (id: string | null | undefined) => id || null;
                    const fingerprint = (sc: string | null | undefined, s: (string | null | undefined)[]) => {
                        return `${normalizeId(sc)}|${s.map(normalizeId).join('|')}`;
                    };

                    const currentFingerprint = fingerprint(newDeck.spellcaster?.hero_id, newDeck.slots.map(s => s.unit?.entity_id));

                    const found = savedDecks.find(saved => {
                        const savedFingerprint = fingerprint(saved.spellcasterId, saved.slotIds);
                        return savedFingerprint === currentFingerprint;
                    });
                    
                    if (found && found.id) {
                        setViewingDeckId(found.id);
                    }
                } catch (e) { console.error("Error checking saved decks", e); }
            }
        }
    }


  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Sync Team to URL (Debounced) - REMOVED per user request
  // We no longer sync the URL while editing. URL is only for initial import.
  /* 
  useEffect(() => {
    if (mode === 'TEAM' && team.teamDecks) {
         // ...
    }
  }, ...); 
  */ 


  // Sync App State
  // We also sync the current URL hash if present, to support reload detection
  useEffect(() => {
      if (!hasHydratedState.current) return;
      const currentTeamHash = searchParams.get('team');
      localStorage.setItem(STORAGE_KEY_APP_STATE, JSON.stringify({ 
          mode, 
          viewSummary,
          lastTeamHash: currentTeamHash 
      }));
  }, [mode, viewSummary, searchParams]);


  // --- Render Conditionals ---

  
  // 1. Team Overview (View Only)
  // We now render this as an OVERLAY on top of the Editor
  const showSummary = viewSummary && isTeamMode && team.teamDecks;

  // 2. Editor Mode (Always Rendered in background)
  return (
      <div className="h-full flex flex-col relative">
          <DeckEditor
              key={isTeamMode ? "TEAM_MODE" : "SOLO_MODE"}
              units={units}
              spellcasters={spellcasters}
              storageKey={activeStorageKey}
              isTeamMode={isTeamMode}
              onSetMode={handleSetMode}
              onExitTeamMode={() => setViewSummary(true)} // "Done" button now views summary
              teamSlotIndex={team.activeSlot}
              teamDecks={team.teamDecks}
              onSwitchTeamSlot={team.enterEditMode}
              // Team Props for ForgeControls
              savedTeams={team.savedTeams}
              onLoadTeam={team.loadTeam}
              onDeleteTeam={team.deleteTeam}
              teamName={team.teamName}
              onRenameTeam={team.setTeamName}
              onSaveTeam={(currentDeck) => {
                  const isNewTeam = !team.activeTeamId;
                  team.saveTeam(team.teamName, currentDeck);
                  
                  // Requirement: "When you save a team... loadout... should clear. When you update, it shoudl stay."
                  // So if it WAS a new team (id was null), we clear.
                  if (isNewTeam) {
                      team.clearTeam();
                  }
              }}

              activeTeamId={team.activeTeamId}
              teamHasChanges={team.hasChanges}
              onClearTeam={team.clearTeam}
              onDuplicateTeam={team.duplicateTeam}
              onReorderDecks={deckBuilder.reorderDecks}
              onReorderTeams={team.reorderTeams}
              pendingExternalImport={pendingImport}
              onClearPendingImport={() => setPendingImport(null)}
              onImportSolo={(deck: Deck) => {
                  if (team.activeSlot !== null) {
                      team.importSoloDeck(team.activeSlot, deck);
                  }
              }}
              onCreateTeam={(deck: Deck) => {
                  setMode('TEAM');
                  team.importSoloDeck(0, deck);
                  team.enterEditMode(0);
                  setViewSummary(false);
              }}
              activeMobileTab={activeMobileTab}
              onSwitchMobileTab={setActiveMobileTab}
          />

            {/* Solo Overview Overlay (Preview Mode) */}
            {viewingDeckData && (
                <div 
                    className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
                    onClick={() => setViewingDeckData(null)}
                >
                    <div 
                        className="w-full max-w-6xl h-full max-h-[90vh] bg-surface-main rounded-xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SoloOverview 
                            deck={viewingDeckData}
                            isReadOnly={true}
                            existingId={viewingDeckId} // Pass ID
                            onBack={() => {
                                setViewingDeckData(null);
                                setViewingDeckId(null);
                            }}
                            onSave={() => {
                                deckBuilder.importDecks([viewingDeckData]);
                                setViewingDeckData(null);
                                setViewingDeckId(null);
                                // Optional: Toast or notification here
                            }}
                            onEdit={() => {
                                // "Try in Forge" / "Open in Forge"
                                if (viewingDeckId) {
                                    // Verify: Load Deck with ID? 
                                    deckBuilder.loadDeck(viewingDeckId);
                                    // We need to ensure logic handles this correctly? 
                                    // Actually deckBuilder.loadDeck just sets state.
                                    setViewingDeckData(null);
                                    setViewingDeckId(null);

                                    // Clear URL Params
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete('d');
                                    router.replace(url.pathname + url.search);
                                } else {
                                    setPendingImport(viewingDeckData);
                                    setViewingDeckData(null);
                                    
                                    // Clear URL Params
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete('d');
                                    router.replace(url.pathname + url.search);
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Team Overview Overlay */}
            {/* If we are in Pure View Mode (viewingTeamData) OR just viewing summary of active team */}
            {(showSummary || viewingTeamData) && (

             <div 
                className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
                onClick={() => {
                   if (!viewingTeamData) setViewSummary(false); // Only close if not in forced view mode
                }}
             >
                <div 
                    className="w-full max-w-6xl h-full max-h-[90vh] bg-surface-main rounded-xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <TeamOverview
                        decks={(viewingTeamData as [Deck, Deck, Deck]) || team.teamDecks!}
                        teamName={searchParams.get('tname') || team.teamName}
                        existingId={viewingTeamId}
                        onBack={() => {
                            if (viewingTeamData) {
                                setViewingTeamData(null);
                                setViewingTeamId(null);
                                setViewSummary(false);
                            } else {
                                setViewSummary(false);
                            }
                        }}
                        isReadOnly={!!viewingTeamData || isReadOnly}
                        onSave={() => {
                             if (viewingTeamData) {
                                  if (team.hasChanges) {
                                      const confirmed = window.confirm("You have unsaved changes in your current team. Loading this shared team will overwrite your workspace. Continue?");
                                      if (!confirmed) return;
                                  }
                                  
                                  team.exitEditMode();
                                  team.loadTeamFromData(viewingTeamData!);
                                  team.saveTeam(searchParams.get('tname') || "Imported Team");
                                  
                                  setViewingTeamData(null);
                                  setViewingTeamId(null);
                                  setViewSummary(false);
                                  setIsReadOnly(false);
                                  
                                  // Clear URL Params
                                  const url = new URL(window.location.href);
                                  url.searchParams.delete('team');
                                  url.searchParams.delete('tname');
                                  router.replace(url.pathname + url.search);

                                  team.enterEditMode(0);
                              } else {
                                team.saveTeam(team.teamName);
                                setIsReadOnly(false); 
                                team.enterEditMode(0);
                                setViewSummary(false);
                              }
                        }}
                        onEditDeck={(idx) => {
                             if (viewingTeamId && viewingTeamData) {
                                 // Open Team
                                 team.loadTeam(viewingTeamId);
                                 setViewingTeamData(null);
                                 setViewingTeamId(null);
                                 setViewSummary(false);
                                 setIsReadOnly(false);
                                    
                                    // Clear URL Params
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete('team');
                                    url.searchParams.delete('tname');
                                    router.replace(url.pathname + url.search);

                                    team.enterEditMode(idx);
                             } else if (viewingTeamData) {
                                // Import Team
                                team.loadTeamFromData(viewingTeamData!);
                                setViewingTeamData(null);
                                setViewSummary(false);
                                setIsReadOnly(false);
                                
                                // Clear URL Params
                                const url = new URL(window.location.href);
                                url.searchParams.delete('team');
                                url.searchParams.delete('tname');
                                router.replace(url.pathname + url.search);

                                team.enterEditMode(idx);
                             } else {
                                 // Normal Edit
                                 if (!isReadOnly && !viewingTeamData) {
                                    team.enterEditMode(idx);
                                }
                             }
                        }}
                    />


                </div>
             </div>
          )}

      </div>
  );
}
