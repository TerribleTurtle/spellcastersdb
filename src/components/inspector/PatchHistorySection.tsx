"use client";

/**
 * PatchHistorySection — Displays patch history on the full card page.
 * Shows a timeline of balance changes and a before/after stat comparison
 * when timeline data is available.
 *
 * @see {@link types/patch-history.d.ts} for type definitions.
 */

import { PatchBadge } from "@/components/ui/PatchBadge";
import type { PatchEntry, TimelineEntry } from "@/types/patch-history";

// ============================================================================
// Component
// ============================================================================

interface PatchHistorySectionProps {
  /** Changelog entries filtered for this entity. */
  changelog: PatchEntry[];
  /** Timeline snapshots for stat comparison. */
  timeline: TimelineEntry[];
}

export function PatchHistorySection({
  changelog,
  timeline,
}: PatchHistorySectionProps) {
  // Don't render if no data
  if (changelog.length === 0 && timeline.length === 0) return null;

  // Build stat comparison from the two most recent timeline entries
  const hasComparison = timeline.length >= 2;
  const current = hasComparison ? timeline[0] : null;
  const previous = hasComparison ? timeline[1] : null;

  // Get comparable stat keys (numeric values only)
  const statKeys =
    current && previous
      ? Object.keys(current.snapshot).filter(
          (key) =>
            typeof current.snapshot[key] === "number" &&
            typeof previous.snapshot[key] === "number" &&
            key !== "population" // Exclude meta fields
        )
      : [];

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
          Patch History
        </h3>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Stat Comparison Table */}
      {hasComparison && current && previous && statKeys.length > 0 && (
        <div className="bg-black/30 rounded-lg border border-white/5 overflow-hidden">
          <div className="grid grid-cols-3 gap-px bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-500 px-3 py-2">
            <span>Stat</span>
            <span className="text-center">v{previous.version}</span>
            <span className="text-center">v{current.version}</span>
          </div>
          {statKeys.map((key) => {
            const oldVal = previous.snapshot[key] as number;
            const newVal = current.snapshot[key] as number;
            const diff = newVal - oldVal;
            const diffColor =
              diff > 0
                ? "text-emerald-400"
                : diff < 0
                  ? "text-red-400"
                  : "text-gray-500";

            return (
              <div
                key={key}
                className="grid grid-cols-3 gap-px px-3 py-1.5 border-t border-white/5 text-xs"
              >
                <span className="text-gray-400 capitalize">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-center text-gray-500 font-mono">
                  {oldVal}
                </span>
                <span
                  className={`text-center font-mono font-bold ${diffColor}`}
                >
                  {newVal}
                  {diff !== 0 && (
                    <span className="ml-1 text-[10px] opacity-70">
                      ({diff > 0 ? "+" : ""}
                      {diff})
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Changelog Timeline */}
      {changelog.length > 0 && (
        <div className="space-y-3">
          {changelog.map((entry, idx) => (
            <div
              key={`${entry.version}-${idx}`}
              className="relative pl-4 border-l-2 border-white/10"
            >
              {/* Version Header */}
              <div className="flex items-center gap-2 mb-1.5">
                <PatchBadge type={entry.patch_type} variant="full" />
                <span className="text-[10px] text-gray-500 font-mono">
                  v{entry.version} · {entry.date}
                </span>
              </div>

              {/* Changes List */}
              <ul className="space-y-1">
                {entry.changes.map((change, cIdx) => (
                  <li
                    key={cIdx}
                    className="text-xs text-gray-400 leading-relaxed"
                  >
                    • {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
