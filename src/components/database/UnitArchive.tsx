"use client";

import { useState, useEffect } from "react";

import { LayoutGrid, List } from "lucide-react";

import { useUnitSearch } from "@/features/deck-builder/hooks/domain/useUnitSearch";
import { cn } from "@/lib/utils";
import { UnifiedEntity } from "@/types/api";
import { usePatchHistoryStore } from "@/store/patch-history-store";
import { isBrowserPatchType } from "@/lib/patch-utils";

import { FilterSidebar } from "./FilterSidebar";
// Assuming we use Unit type
import { UnitCard } from "./UnitCard";
import { useUnitFilters } from "./hooks/useUnitFilters";
import { useViewMode } from "./hooks/useViewMode";

// Helper to safely get unique ID
function getUniqueId(entity: UnifiedEntity): string {
  if (entity.category === "Spellcaster") return entity.spellcaster_id || entity.entity_id;
  if (entity.category === "Consumable") return entity.entity_id;
  return entity.entity_id;
}

interface UnitArchiveProps {
  initialUnits: UnifiedEntity[];
  defaultFilters?: {
    schools?: string[];
    ranks?: string[];
    categories?: string[];
    classes?: string[];
  };
}

export function UnitArchive(props: UnitArchiveProps) {
  const { initialUnits } = props;
  // State
  const [searchQuery, setSearchQuery] = useState("");

  const { viewMode, setViewMode } = useViewMode();

  const {
    activeFilters,
    toggleFilter,
    clearFilters: clearFiltersBase,
  } = useUnitFilters({ defaultFilters: props.defaultFilters });

  const clearFilters = () => {
    clearFiltersBase();
    setSearchQuery("");
  };

  // Load balance index for patch badges (idempotent — fetches once)
  const loadBalanceIndex = usePatchHistoryStore((s) => s.loadBalanceIndex);
  const balanceEntities = usePatchHistoryStore((s) => s.entities);
  useEffect(() => { loadBalanceIndex(); }, [loadBalanceIndex]);

  // derived state
  const filteredUnits = useUnitSearch(initialUnits, searchQuery, activeFilters);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start min-h-[80vh]">
      {/* Sidebar (Desktop: Sticky, Mobile: Toggle) */}
      <FilterSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        clearFilters={clearFilters}
        className="w-full md:w-64 shrink-0 md:sticky md:top-24 md:z-30"
      />

      {/* Main Content */}
      <div className="flex-1 w-full">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="text-sm text-gray-400">
            Showing{" "}
            <strong className="text-white">{filteredUnits.length}</strong>{" "}
            results
          </div>

          <div className="flex items-center gap-2 bg-surface-card border border-white/5 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "grid"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              )}
              title="Grid View"
              aria-label="Switch to Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "list"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300"
              )}
              title="List View"
              aria-label="Switch to List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Results Grid */}
        {filteredUnits.length > 0 ? (
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            )}
          >
            {filteredUnits.map((unit) => {
              const entityPatch = balanceEntities[unit.entity_id];
              return (
                <UnitCard
                  key={getUniqueId(unit)}
                  unit={unit}
                  variant={viewMode === "list" ? "compact" : "default"}
                  patchType={entityPatch && isBrowserPatchType(entityPatch) ? entityPatch : undefined}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-xl">
            <p className="text-lg font-bold text-gray-400 mb-2">
              No units found
            </p>
            <p className="text-sm text-gray-600">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-brand-primary hover:underline text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
