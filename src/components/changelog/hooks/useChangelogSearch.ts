"use client";

/**
 * useChangelogSearch — Search, filter, and sort hook for the Change Log page.
 *
 * Flattens all PatchEntry[] → FlatChangeRow[] (one row per ChangeEntry),
 * then applies Fuse.js fuzzy search, multi-filter, and sort.
 */

import { useMemo, useState } from "react";
import Fuse from "fuse.js";

import { useDebounce } from "@/hooks/useDebounce";
import type { PatchEntry, ChangeEntry, PatchCategory, ChangeType } from "@/types/patch-history";

// ============================================================================
// Types
// ============================================================================

/** A single change enriched with its parent patch metadata. */
export interface FlatChangeRow {
  /** Unique key for React rendering. */
  key: string;
  /** Parent patch info */
  patchId: string;
  version: string;
  patchType: PatchCategory;
  patchTitle: string;
  patchDate: string;
  /** Pre-parsed timestamp for efficient sorting (avoids repeated new Date() in comparator). */
  patchTimestamp: number;
  patchTags: string[];
  /** Change-level info */
  targetId: string;
  name: string;
  field: string;
  changeType: ChangeType;
  category: string;
  diffs: unknown[];
}

export type SortMode = "date-desc" | "date-asc" | "name-asc" | "name-desc";

export interface ChangelogFilters {
  patchTypes: PatchCategory[];
  changeTypes: ChangeType[];
  categories: string[];
}

// ============================================================================
// Flatten Helper
// ============================================================================

function flattenChangelog(patches: PatchEntry[]): FlatChangeRow[] {
  const rows: FlatChangeRow[] = [];

  for (const patch of patches) {
    for (let i = 0; i < patch.changes.length; i++) {
      const change: ChangeEntry = patch.changes[i];
      rows.push({
        key: `${patch.id}-${i}`,
        patchId: patch.id,
        version: patch.version,
        patchType: patch.type,
        patchTitle: patch.title,
        patchDate: patch.date,
        patchTimestamp: new Date(patch.date).getTime(),
        patchTags: patch.tags || [],
        targetId: change.target_id,
        name: change.name,
        field: change.field,
        changeType: change.change_type || "edit",
        category: change.category || "unknown",
        diffs: change.diffs || [],
      });
    }
  }

  return rows;
}

// ============================================================================
// Hook
// ============================================================================

const DEFAULT_FILTERS: ChangelogFilters = {
  patchTypes: [],
  changeTypes: [],
  categories: [],
};

export function useChangelogSearch(patches: PatchEntry[]) {
  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date-desc");
  const [filters, setFilters] = useState<ChangelogFilters>(DEFAULT_FILTERS);

  const debouncedQuery = useDebounce(searchQuery, 250);

  // --- Flatten once ---
  const allRows = useMemo(() => flattenChangelog(patches), [patches]);

  // --- Derive unique categories ---
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    allRows.forEach((r) => cats.add(r.category));
    return Array.from(cats).sort();
  }, [allRows]);

  // --- Fuse instance ---
  const fuse = useMemo(
    () =>
      new Fuse(allRows, {
        keys: ["name", "field", "category", "version", "patchTitle"],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [allRows]
  );

  // --- Filter + Search + Sort ---
  const results = useMemo(() => {
    let result = allRows;

    // 1. Text search
    if (debouncedQuery.trim().length > 0) {
      result = fuse.search(debouncedQuery).map((r) => r.item);
    }

    // 2. Filters
    if (filters.patchTypes.length > 0) {
      result = result.filter((r) => filters.patchTypes.includes(r.patchType));
    }
    if (filters.changeTypes.length > 0) {
      result = result.filter((r) => filters.changeTypes.includes(r.changeType));
    }
    if (filters.categories.length > 0) {
      result = result.filter((r) => filters.categories.includes(r.category));
    }

    // 3. Sort
    result = [...result].sort((a, b) => {
      switch (sortMode) {
        case "date-desc": {
          const diff = b.patchTimestamp - a.patchTimestamp;
          if (diff !== 0) return diff;
          // Tie-breaker: Newer version first
          return b.version.localeCompare(a.version, undefined, { numeric: true });
        }
        case "date-asc": {
          const diff = a.patchTimestamp - b.patchTimestamp;
          if (diff !== 0) return diff;
          // Tie-breaker: Older version first
          return a.version.localeCompare(b.version, undefined, { numeric: true });
        }
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [allRows, debouncedQuery, filters, sortMode, fuse]);

  // --- Toggle helpers ---
  const togglePatchType = (type: PatchCategory) => {
    setFilters((prev) => ({
      ...prev,
      patchTypes: prev.patchTypes.includes(type)
        ? prev.patchTypes.filter((t) => t !== type)
        : [...prev.patchTypes, type],
    }));
  };

  const toggleChangeType = (type: ChangeType) => {
    setFilters((prev) => ({
      ...prev,
      changeTypes: prev.changeTypes.includes(type)
        ? prev.changeTypes.filter((t) => t !== type)
        : [...prev.changeTypes, type],
    }));
  };

  const toggleCategory = (cat: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const clearAll = () => {
    setSearchQuery("");
    setFilters(DEFAULT_FILTERS);
    setSortMode("date-desc");
  };

  const hasActiveFilters =
    filters.patchTypes.length > 0 ||
    filters.changeTypes.length > 0 ||
    filters.categories.length > 0;

  return {
    // State
    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode,
    filters,
    // Derived
    results,
    totalCount: allRows.length,
    allCategories,
    hasActiveFilters,
    // Actions
    togglePatchType,
    toggleChangeType,
    toggleCategory,
    clearAll,
  };
}
