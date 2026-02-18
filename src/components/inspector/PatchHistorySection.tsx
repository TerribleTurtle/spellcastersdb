"use client";

/**
 * PatchHistorySection — Displays patch history on the full card page.
 * Shows a timeline of balance changes and a before/after stat comparison
 * when timeline data is available.
 *
 * @see {@link types/patch-history.d.ts} for type definitions.
 */

import { useState, useMemo, useEffect } from "react";
import { PatchBadge } from "@/components/ui/PatchBadge";
import type { PatchEntry, TimelineEntry, PatchCategory } from "@/types/patch-history";
import { ArrowDownAZ, ArrowUpAZ, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Renders a date string in the viewer's locale format (client-side only). */
function LocalDate({ iso }: { iso: string }) {
  const [display, setDisplay] = useState(iso);
  useEffect(() => {
    try {
      // Dates are date-only strings (e.g. "2026-02-18"), so we parse them
      // as local dates and format with the viewer's locale — no time component.
      const [year, month, day] = iso.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(d.toLocaleDateString(undefined, { dateStyle: "medium" }));
    } catch {
      setDisplay(iso);
    }
  }, [iso]);
  return <time dateTime={iso} suppressHydrationWarning>{display}</time>;
}

// ============================================================================
// Component
// ============================================================================

interface PatchHistorySectionProps {
  /** Changelog entries filtered for this entity. */
  changelog: PatchEntry[];
  /** Timeline snapshots for stat comparison. */
  timeline: TimelineEntry[];
  /** Whether to show sort/filter controls (true for full page, false for inspector). */
  showControls?: boolean;
}

export function PatchHistorySection({
  changelog,
  timeline,
  showControls = false,
}: PatchHistorySectionProps) {
  // Local State for Filtering/Sorting
  const [sortDesc, setSortDesc] = useState(true);
  // Default to showing only Patch and Content (hiding Hotfixes)
  const [selectedTypes, setSelectedTypes] = useState<PatchCategory[]>(["Patch", "Content"]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Derived Data
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    changelog.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [changelog]);

  const filteredChangelog = useMemo(() => {
    let result = [...changelog];

    // Filter by Type
    if (selectedTypes.length > 0) {
      result = result.filter(p => selectedTypes.includes(p.type));
    }

    // Filter by Tags
    if (selectedTags.length > 0) {
      result = result.filter(p => p.tags?.some(t => selectedTags.includes(t)));
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDesc ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [changelog, selectedTypes, selectedTags, sortDesc]);

  // Don't render inside logic, return null early
  if (changelog.length === 0 && timeline.length === 0) return null;

  const toggleType = (type: PatchCategory) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Helper to find the snapshot for a specific version
  const getSnapshot = (version: string) => timeline.find(t => t.version === version)?.snapshot;

  // Helper to get previous snapshot (relative to the current one in the sorted list)
  // Logic: Find current patch in timeline, take the next one (older) as previous
  const getPreviousSnapshot = (currentVersion: string) => {
      const idx = timeline.findIndex(t => t.version === currentVersion);
      if (idx === -1 || idx === timeline.length - 1) return null;
      return timeline[idx + 1].snapshot;
  };

  // Pagination / Collapse Logic
  // Show only the latest patch by default, or all if toggled
  const visiblePatches = showAllHistory ? filteredChangelog : filteredChangelog.slice(0, 1);
  const hiddenCount = filteredChangelog.length - visiblePatches.length;

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
            Patch History
            </h3>
            <div className="flex-1 h-px bg-white/10" />
        </div>
        
        {/* Controls */}
        {showControls && (
            <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSortDesc(!sortDesc)}
                    className="h-7 px-2 text-gray-400 hover:text-white"
                    title={sortDesc ? "Newest First" : "Oldest First"}
                >
                    {sortDesc ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}
                </Button>
                <Button 
                    variant={filtersOpen || selectedTags.length > 0 ? "secondary" : "ghost"}
                    size="sm" 
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className={cn(
                        "h-7 px-2 gap-1.5", 
                        (filtersOpen) && "text-brand-primary bg-brand-primary/10 border border-brand-primary/20",
                         // Highlight if non-default filters are applied
                         (selectedTypes.length !== 2 || selectedTags.length > 0) && "text-brand-accent"
                    )}
                >
                    <Filter size={14} />
                    <span className="text-[10px] font-bold">
                        {(selectedTags.length) || "Filter"}
                    </span>
                </Button>
            </div>
        )}
      </div>

      {/* Filters Panel */}
      {showControls && filtersOpen && (
          <div className="bg-black/40 border border-white/10 rounded-lg p-3 space-y-3 animate-in slide-in-from-top-2">
              {/* Types */}
              <div className="flex flex-wrap gap-2">
                  {(["Patch", "Hotfix", "Content"] as PatchCategory[]).map(type => (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase border transition-all",
                            selectedTypes.includes(type) 
                                ? "bg-white/10 border-white/40 text-white shadow-sm" 
                                : "bg-transparent border-white/5 text-gray-500 hover:border-white/20"
                        )}
                      >
                          {type}
                      </button>
                  ))}
              </div>

              {/* Tags */}
              {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                      {allTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] border transition-all",
                                selectedTags.includes(tag) 
                                    ? "bg-brand-primary/20 border-brand-primary/50 text-brand-primary" 
                                    : "bg-transparent border-white/5 text-gray-500 hover:border-white/20"
                            )}
                          >
                              #{tag}
                          </button>
                      ))}
                  </div>
              )}
              
              {/* Clear */}
              {(selectedTypes.length !== 2 || selectedTags.length > 0) && (
                  <div className="flex justify-end pt-1">
                      <button 
                        onClick={() => { setSelectedTypes(["Patch", "Content"]); setSelectedTags([]); }}
                        className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1"
                      >
                          <X size={10} /> Reset Filters
                      </button>
                  </div>
              )}
          </div>
      )}

      {/* Timeline & Stats Container */}
      {visiblePatches.length > 0 ? (
        <div className="space-y-4">
          {visiblePatches.map((entry, idx) => {
             // Resolve stats for this patch
             const currentSnap = getSnapshot(entry.version);
             const previousSnap = getPreviousSnapshot(entry.version);
             
             // Calculate diffs
             const statChanges: { key: string; old: number; new: number; diff: number }[] = [];
             
             if (currentSnap && previousSnap) {
                 Object.keys(currentSnap).forEach(key => {
                     const valNow = currentSnap[key];
                     const valPrev = previousSnap[key];
                     if (typeof valNow === 'number' && typeof valPrev === 'number' && key !== 'population') {
                         if (valNow !== valPrev) {
                             statChanges.push({
                                 key, 
                                 old: valPrev, 
                                 new: valNow, 
                                 diff: valNow - valPrev
                             });
                         }
                     }
                 });
             }

             return (
                <div
                  key={`${entry.id}-${idx}`}
                  className="bg-black/20 border border-white/5 rounded-lg overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex items-center gap-2 flex-wrap">
                     <PatchBadge type={entry.type} variant="icon" />
                     <span className="text-xs font-mono font-bold text-gray-300">v{entry.version}</span>
                     <span className="text-[10px] text-gray-500">• <LocalDate iso={entry.date} /></span>
                     {entry.tags?.map(t => (
                        <span key={t} className="text-[9px] text-gray-600 bg-black/40 px-1.5 rounded">#{t}</span>
                    ))}
                  </div>

                  <div className="p-3 space-y-3">
                      {/* Stat Changes (Vertical) */}
                      {statChanges.length > 0 && (
                          <div className="space-y-1 bg-black/20 rounded p-2 border border-white/5">
                              {statChanges.map(stat => (
                                  <div key={stat.key} className="flex items-center justify-between text-xs">
                                      <span className="text-gray-400 capitalize">{stat.key.replace(/_/g, " ")}</span>
                                      <div className="flex items-center gap-2 font-mono">
                                          <span className="text-gray-600">{stat.old}</span>
                                          <span className="text-gray-600 text-[10px]">→</span>
                                          <span className={cn(
                                              "font-bold",
                                              stat.diff > 0 ? "text-emerald-400" : "text-red-400"
                                          )}>
                                              {stat.new}
                                              <span className="ml-1 opacity-70 text-[10px]">
                                                  ({stat.diff > 0 ? "+" : ""}{stat.diff})
                                              </span>
                                          </span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}

                      {/* Changelog Text */}
                      <ul className="space-y-2">
                        {entry.changes.map((change, cIdx) => (
                          <li key={cIdx} className="text-xs text-gray-400">
                             <div className="flex items-start gap-2">
                                <span className="text-gray-600 mt-1">•</span> 
                                <div>
                                    <span className="font-medium text-gray-300 mr-2">{change.name}</span>
                                    {change.field !== 'entity' && (
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 py-0 border-white/10 text-gray-500 uppercase tracking-wide font-normal">
                                            {change.field.replace(/_/g, ' ')}
                                        </Badge>
                                    )}
                                </div>
                             </div>
                             {/* Diffs (unchanged) */}
                             {change.diffs && change.diffs.length > 0 && (
                                <div className="pl-4 mt-1 space-y-0.5 border-l border-white/5 ml-1">
                                     {change.diffs.slice(0, 3).map((d, i) => {
                                         const diff = d as { path?: string[]; lhs?: unknown; rhs?: unknown };
                                         const isAdded = diff.lhs == null && diff.rhs != null;
                                         const isRemoved = diff.rhs == null && diff.lhs != null;
                                         return (
                                         <div key={i} className="text-[10px] font-mono text-gray-500 flex flex-wrap gap-1 items-center">
                                             <span className="opacity-70">{diff.path ? diff.path.join('.') : 'value'}:</span>
                                             {isAdded ? (
                                                 <span className="text-emerald-400 flex items-center gap-1">
                                                     <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/30 rounded px-1 uppercase font-bold">Added</span>
                                                     {String(diff.rhs)}
                                                 </span>
                                             ) : isRemoved ? (
                                                 <span className="text-red-400 flex items-center gap-1">
                                                     <span className="text-[9px] bg-red-500/20 border border-red-500/30 rounded px-1 uppercase font-bold">Removed</span>
                                                     {String(diff.lhs)}
                                                 </span>
                                             ) : (
                                                 <span className="text-gray-400">
                                                     {String(diff.lhs)} <span className="text-gray-600">→</span> {String(diff.rhs)}
                                                 </span>
                                             )}
                                         </div>
                                     );
                                     })}
                                </div>
                             )}
                          </li>
                        ))}
                      </ul>
                  </div>
                </div>
             );
          })}

          {/* Show More Button */}
          {hiddenCount > 0 && (
              <Button 
                variant="ghost" 
                className="w-full text-xs text-gray-500 hover:text-white border border-dashed border-white/10 hover:border-white/20"
                onClick={() => setShowAllHistory(true)}
              >
                  Show {hiddenCount} older updates...
              </Button>
          )}

        </div>
      ) : (changelog.length > 0 || timeline.length > 0) ? (
          <div className="text-center py-8 text-gray-500 text-xs italic border border-dashed border-white/10 rounded-lg">
              No patches match the selected filters.
          </div>
      ) : null}
    </div>
  );
}
