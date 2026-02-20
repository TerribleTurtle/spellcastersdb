"use client";

import { FilterSection } from "@/components/ui/FilterSection";
import {
  CATEGORIES,
  RANKS,
  SCHOOLS,
  SPELLCASTER_CLASSES,
} from "@/services/config/constants";
import { useDeckStore } from "@/store/index";

interface UnitFilterOverlayProps {
  onClose: () => void;
}

export function UnitFilterOverlay({ onClose }: UnitFilterOverlayProps) {
  const activeFilters = useDeckStore((state) => state.browserFilters);
  const onToggle = useDeckStore((state) => state.toggleBrowserFilter);
  const onClear = useDeckStore((state) => state.clearBrowserFilters);

  return (
    <div className="relative bg-surface-main border-b border-border-default shadow-md p-4 space-y-4 overflow-y-auto">
      {/* Header + Actions — always visible at top */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-primary uppercase">
          Filters
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="text-xs text-status-danger-text hover:text-red-300"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="bg-brand-primary text-brand-dark px-4 py-1 rounded text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/80"
          >
            Done
          </button>
        </div>
      </div>

      <div className="columns-2 gap-6 space-y-4">
        <FilterSection
          title="Category"
          options={CATEGORIES}
          selected={activeFilters.categories}
          onToggle={(v) => onToggle("categories", v)}
        />
        <FilterSection
          title="Magic School"
          options={SCHOOLS}
          selected={activeFilters.schools}
          onToggle={(v) => onToggle("schools", v)}
        />
        <FilterSection
          title="Class"
          options={SPELLCASTER_CLASSES}
          selected={activeFilters.classes}
          onToggle={(v) => onToggle("classes", v)}
        />
        <FilterSection
          title="Rank"
          options={RANKS}
          selected={activeFilters.ranks}
          onToggle={(v) => onToggle("ranks", v)}
          isGrid
        />
      </div>
    </div>
  );
}
