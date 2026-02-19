"use client";

/**
 * ChangelogArchive — Full-page searchable changelog browser.
 *
 * Renders every change as a flat row with search, sort, and multi-filter.
 * Reuses PatchBadge and Badge from the existing UI library.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PatchBadge } from "@/components/ui/PatchBadge";
import { cn } from "@/lib/utils";
import type { PatchEntry, PatchCategory, ChangeType } from "@/types/patch-history";

import {
  useChangelogSearch,
  type FlatChangeRow,
  type SortMode,
} from "./hooks/useChangelogSearch";

// ============================================================================
// Helpers
// ============================================================================

/** Resolve entity URL from target_id and category. */
function getEntityUrl(row: FlatChangeRow): string | null {
  // target_id format: "category/entity_id.json" or "entity_id.json"
  const parts = row.targetId.replace(".json", "").split("/");
  const entityId = parts[parts.length - 1];
  const cat = row.category.toLowerCase();

  if (cat === "heroes" || cat === "spellcaster" || cat === "spellcasters")
    return `/spellcasters/${entityId}`;
  if (cat === "units" || cat === "creature" || cat === "building")
    return `/incantations/units/${entityId}`;
  if (cat === "spells" || cat === "spell")
    return `/incantations/spells/${entityId}`;
  if (cat === "titans" || cat === "titan") return `/titans/${entityId}`;
  if (cat === "consumables" || cat === "consumable")
    return `/consumables/${entityId}`;
  return null;
}

import { LocalDate } from "@/components/ui/LocalDate";
import { DiffLine, type DiffData } from "@/components/ui/DiffLine";

const CHANGE_TYPE_CONFIG: Record<
  ChangeType,
  { label: string; bg: string; text: string; border: string }
> = {
  add: {
    label: "Added",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  edit: {
    label: "Changed",
    bg: "bg-sky-500/15",
    text: "text-sky-400",
    border: "border-sky-500/30",
  },
  delete: {
    label: "Removed",
    bg: "bg-red-500/15",
    text: "text-status-danger-text",
    border: "border-red-500/30",
  },
};

const SORT_OPTIONS: { value: SortMode; label: string; icon: typeof ArrowDown }[] = [
  { value: "date-desc", label: "Newest First", icon: ArrowDown },
  { value: "date-asc", label: "Oldest First", icon: ArrowUp },
  { value: "name-asc", label: "Name A → Z", icon: ArrowDownAZ },
  { value: "name-desc", label: "Name Z → A", icon: ArrowUpAZ },
];

// ============================================================================
// Sub-Components
// ============================================================================

function ChangeRow({
  row,
  isExpanded,
  onToggle,
}: {
  row: FlatChangeRow;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const ctConfig = CHANGE_TYPE_CONFIG[row.changeType];
  const entityUrl = getEntityUrl(row);

  return (
    <div
      className={cn(
        "bg-surface-card border border-border-subtle rounded-lg transition-all hover:border-border-default",
        isExpanded && "border-border-default bg-surface-hover"
      )}
    >
      {/* Main Row */}
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2.5 flex items-center gap-3 group"
      >
        {/* Expand Icon */}
        <span className="text-text-faint shrink-0">
          {row.diffs.length > 0 ? (
            isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <span className="w-3.5" />
          )}
        </span>

        {/* Patch Badge */}
        <PatchBadge type={row.patchType} variant="icon" className="shrink-0" />

        {/* Version */}
        <span className="text-[11px] font-mono text-text-dimmed w-12 shrink-0">
          v{row.version}
        </span>

        {/* Entity Name */}
        <span className="font-medium text-sm text-text-secondary group-hover:text-text-primary transition-colors truncate min-w-0 flex-1">
          {row.name}
        </span>

        {/* Field Badge */}
        {row.field !== "entity" && (
          <Badge
            variant="outline"
            className="text-[9px] h-4 px-1.5 py-0 border-border-default text-text-dimmed uppercase tracking-wide font-normal shrink-0 hidden sm:inline-flex"
          >
            {row.field.replace(/_/g, " ")}
          </Badge>
        )}

        {/* Change Type */}
        <span
          className={cn(
            "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0",
            ctConfig.bg,
            ctConfig.text,
            ctConfig.border
          )}
        >
          {ctConfig.label}
        </span>

        {/* Category */}
        <span className="text-[10px] text-text-faint uppercase tracking-wider w-16 shrink-0 hidden md:block text-right">
          {row.category}
        </span>

        {/* Date */}
        <span className="text-[10px] text-text-faint shrink-0 hidden lg:flex items-center gap-1 w-36 justify-end">
          <Clock size={10} />
          <LocalDate iso={row.patchDate} />
        </span>

        {/* Link out */}
        {entityUrl && (
          <Link
            href={entityUrl}
            onClick={(e) => e.stopPropagation()}
            className="text-text-faint hover:text-brand-primary transition-colors shrink-0"
            title={`View ${row.name}`}
          >
            <ExternalLink size={12} />
          </Link>
        )}
      </button>

      {/* Expanded Diff Detail */}
      {isExpanded && row.diffs.length > 0 && (
        <div className="px-4 pb-3 pt-0 border-t border-border-subtle ml-6">
          <div className="pl-4 mt-2 space-y-1 border-l border-border-subtle">
            {row.diffs.slice(0, 8).map((d, i) => (
                <DiffLine key={i} diff={d as DiffData} />
             ))}
            {row.diffs.length > 8 && (
              <div className="text-[10px] text-text-faint italic">
                +{row.diffs.length - 8} more changes...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const PAGE_SIZE = 50;

interface ChangelogArchiveProps {
  patches: PatchEntry[];
}

export function ChangelogArchive({ patches }: ChangelogArchiveProps) {
  const {
    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode,
    filters,
    results,
    totalCount,
    allCategories,
    hasActiveFilters,
    togglePatchType,
    toggleChangeType,
    toggleCategory,
    clearAll,
  } = useChangelogSearch(patches);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Reset visible count when filters change
  const visibleResults = results.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dimmed"
            size={16}
          />
          <input
            type="text"
            placeholder="Search changes... (name, field, version, category)"
            aria-label="Search changes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-card border border-border-default rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dimmed hover:text-text-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            aria-label="Sort order"
            className="bg-surface-card border border-border-default rounded-lg px-3 py-2.5 text-xs text-text-secondary focus:outline-none focus:border-brand-primary/50 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-bold transition-all",
              filtersOpen || hasActiveFilters
                ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                : "bg-surface-card border-border-default text-text-muted hover:text-text-primary hover:border-border-strong"
            )}
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {filtersOpen && (
        <div className="bg-surface-dim border border-border-default rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2">
          {/* Patch Type */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-dimmed mb-2">
              Patch Type
            </h4>
            <div className="flex flex-wrap gap-2">
              {(["Patch", "Hotfix", "Content"] as PatchCategory[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => togglePatchType(type)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all",
                      filters.patchTypes.includes(type)
                        ? "bg-surface-hover border-border-strong text-text-primary shadow-sm"
                        : "bg-transparent border-border-subtle text-text-dimmed hover:border-border-strong"
                    )}
                  >
                    <PatchBadge
                      type={type}
                      variant="icon"
                      className="w-3.5 h-3.5"
                    />
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Change Type */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-dimmed mb-2">
              Change Type
            </h4>
            <div className="flex flex-wrap gap-2">
              {(["add", "edit", "delete"] as ChangeType[]).map((type) => {
                const config = CHANGE_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => toggleChangeType(type)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all",
                      filters.changeTypes.includes(type)
                        ? cn(config.bg, config.text, config.border)
                        : "bg-transparent border-border-subtle text-text-dimmed hover:border-border-strong"
                    )}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          {allCategories.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-dimmed mb-2">
                Category
              </h4>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all",
                      filters.categories.includes(cat)
                        ? "bg-surface-hover border-border-strong text-text-primary shadow-sm"
                        : "bg-transparent border-border-subtle text-text-dimmed hover:border-border-strong"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-1 border-t border-border-subtle">
              <button
                onClick={clearAll}
                className="text-[10px] text-text-dimmed hover:text-text-primary flex items-center gap-1"
              >
                <X size={10} /> Reset all
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Result Count ── */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-text-muted">
          Showing{" "}
          <strong className="text-text-primary">
            {Math.min(visibleCount, results.length)}
          </strong>{" "}
          of <strong className="text-text-primary">{results.length}</strong> changes
          {results.length !== totalCount && (
            <span className="text-text-faint">
              {" "}
              (filtered from {totalCount})
            </span>
          )}
        </div>
        {(searchQuery || hasActiveFilters) && (
          <button
            onClick={clearAll}
            className="text-xs text-brand-secondary hover:text-brand-secondary/80 flex items-center gap-1"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* ── Results ── */}
      {visibleResults.length > 0 ? (
        <div className="space-y-1.5">
          {visibleResults.map((row) => (
            <ChangeRow
              key={row.key}
              row={row}
              isExpanded={expandedRows.has(row.key)}
              onToggle={() => toggleRow(row.key)}
            />
          ))}

          {/* Load More */}
          {visibleCount < results.length && (
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="w-full py-3 text-xs text-text-dimmed hover:text-text-primary border border-dashed border-border-default hover:border-border-strong rounded-lg transition-colors"
            >
              Load {Math.min(PAGE_SIZE, results.length - visibleCount)} more...
              ({results.length - visibleCount} remaining)
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border-default rounded-xl">
          <p className="text-lg font-bold text-text-muted mb-2">
            No changes found
          </p>
          <p className="text-sm text-text-faint">
            Try adjusting your search or filters.
          </p>
          <button
            onClick={clearAll}
            className="mt-4 text-brand-primary hover:underline text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
