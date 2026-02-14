"use client";

import { X } from "lucide-react";
import { FilterSection } from "@/components/ui/FilterSection";
import { CATEGORIES, RANKS, SCHOOLS, SPELLCASTER_CLASSES } from "@/services/config/constants";


import { useDeckStore } from "@/store/index";

interface UnitFilterOverlayProps {
  onClose: () => void;
}

export function UnitFilterOverlay({
  onClose
}: UnitFilterOverlayProps) {
  const activeFilters = useDeckStore((state) => state.browserFilters);
  const onToggle = useDeckStore((state) => state.toggleBrowserFilter);
  const onClear = useDeckStore((state) => state.clearBrowserFilters);

  return (
    <div className="absolute top-32 left-0 right-0 z-20 bg-surface-main border-b border-white/10 shadow-2xl animate-in slide-in-from-top-2 p-4 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-white uppercase">
          Active Filters
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FilterSection
          title="Category"
          options={CATEGORIES}
          selected={activeFilters.categories}
          onToggle={(v) => onToggle("categories", v)}
        />
        <FilterSection
          title="Class"
          options={SPELLCASTER_CLASSES}
          selected={activeFilters.classes}
          onToggle={(v) => onToggle("classes", v)}
        />
        <div className="space-y-6">
          <FilterSection
            title="Magic School"
            options={SCHOOLS}
            selected={activeFilters.schools}
            onToggle={(v) => onToggle("schools", v)}
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

      <div className="flex justify-end pt-4 border-t border-white/5">
        <button
          onClick={onClear}
          className="text-xs text-red-400 hover:text-red-300 mr-4"
        >
          Clear All
        </button>
        <button
          onClick={onClose}
          className="bg-brand-primary text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/80"
        >
          Done
        </button>
      </div>
    </div>
  );
}
