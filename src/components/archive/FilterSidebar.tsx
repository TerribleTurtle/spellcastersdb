"use client";

import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterSection } from "@/components/ui/FilterSection";

interface FilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilters: {
    schools: string[];
    ranks: string[];
    categories: string[];
  };
  toggleFilter: (type: "schools" | "ranks" | "categories", value: string) => void;
  clearFilters: () => void;
  className?: string;
}

const SCHOOLS = ["Elemental", "Wild", "War", "Astral", "Holy", "Technomancy", "Necromancy", "Titan"];
const RANKS = ["I", "II", "III", "IV"];
const CATEGORIES = ["Spellcaster", "Creature", "Building", "Spell", "Titan", "Consumable"];

export function FilterSidebar({
  searchQuery,
  setSearchQuery,
  activeFilters,
  toggleFilter,
  clearFilters,
  className,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false); // Mobile Drawer State

  const hasActiveFilters =
    activeFilters.schools.length > 0 ||
    activeFilters.ranks.length > 0 ||
    activeFilters.categories.length > 0;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-surface-card border border-white/10 rounded-lg text-white font-bold"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-brand-accent" />
            <span>Filters & Search</span>
          </div>
          {hasActiveFilters && (
            <div className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
          )}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "bg-surface-main/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none fixed inset-0 z-50 p-6 md:p-0 overflow-y-auto transition-transform duration-300 md:relative md:transform-none md:block w-full md:w-64 shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex justify-between items-center md:hidden mb-6">
          <h2 className="text-xl font-bold text-white">Filters</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-card border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>

          {/* Active Filters Clear */}
          <div className="min-h-[20px]">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-brand-secondary hover:text-brand-secondary/80 flex items-center gap-1 font-mono uppercase tracking-wider"
              >
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>

          {/* Categories */}
          <FilterSection
            title="Category"
            options={CATEGORIES}
            selected={activeFilters.categories}
            onToggle={(val) => toggleFilter("categories", val)}
          />

          {/* Magic Schools */}
          <FilterSection
            title="Magic School"
            options={SCHOOLS}
            selected={activeFilters.schools}
            onToggle={(val) => toggleFilter("schools", val)}
          />

          {/* Ranks */}
          <FilterSection
            title="Rank"
            options={RANKS}
            selected={activeFilters.ranks}
            onToggle={(val) => toggleFilter("ranks", val)}
            isGrid
          />
        </div>
      </aside>
    </>
  );
}


// ... (imports will be handled by the user/system or manual edit, but here I replace the bottom function)
// Actually I need to do imports separately or replacing the whole file content if I want to be clean, but `replace_file_content` is a chunk replacement.
// I will remove the bottom function first.

