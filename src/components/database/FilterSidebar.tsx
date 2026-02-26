"use client";

import { useState } from "react";

import {
  ArrowDownAZ,
  ArrowUpAZ,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { FilterSection } from "@/components/ui/FilterSection";
import { cn } from "@/lib/utils";
import {
  RANKS,
  SCHOOLS,
  SPELLCASTER_CLASSES,
} from "@/services/config/constants";

export type SortField = "name" | "cost" | "damage" | "health" | "rank";
export type SortOrder = "asc" | "desc";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "cost", label: "Cost" },
  { value: "damage", label: "Attack" },
  { value: "health", label: "Health" },
  { value: "rank", label: "Rank" },
];

interface FilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilters: {
    schools: string[];
    ranks: string[];
    categories: string[];
    classes: string[];
  };
  toggleFilter: (
    type: "schools" | "ranks" | "categories" | "classes",
    value: string
  ) => void;
  clearFilters: () => void;
  className?: string;
  sortBy?: SortField;
  setSortBy?: (field: SortField) => void;
  sortOrder?: SortOrder;
  setSortOrder?: (order: SortOrder) => void;
}

// CATEGORIES used locally for filter options (Singular)
const CATEGORIES = [
  "Spellcaster",
  "Creature",
  "Building",
  "Spell",
  "Titan",
  "Consumable",
];

export function FilterSidebar({
  searchQuery,
  setSearchQuery,
  activeFilters,
  toggleFilter,
  clearFilters,
  className,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false); // Mobile Drawer State

  const hasActiveFilters =
    activeFilters.schools.length > 0 ||
    activeFilters.ranks.length > 0 ||
    activeFilters.categories.length > 0 ||
    activeFilters.classes.length > 0;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          data-testid="filter-mobile-toggle"
          className="w-full flex items-center justify-between p-3 bg-surface-card border border-border-default rounded-lg text-text-primary font-bold"
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
        aria-label="Filter Options"
        data-testid="filter-sidebar"
        className={cn(
          "bg-surface-main/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none fixed inset-0 z-50 p-6 md:p-0 overflow-y-auto transition-transform duration-300 md:relative md:transform-none md:block w-full md:w-64 shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex justify-between items-center mb-6 md:mb-0">
          <h2 className="text-xl font-bold text-text-primary md:sr-only">
            Filters
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close filters"
            className="text-text-muted hover:text-text-primary md:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dimmed"
              size={16}
            />
            <input
              type="text"
              placeholder="Search cards..."
              aria-label="Search cards"
              data-testid="filter-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-card border border-border-default rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>

          {/* Active Filters Clear */}
          <div className="min-h-[20px]">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                data-testid="filter-clear-btn"
                className="text-xs text-brand-secondary hover:text-brand-secondary/80 flex items-center gap-1 font-mono uppercase tracking-wider"
              >
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>

          {/* Sort Controls */}
          {setSortBy && setSortOrder && (
            <div className="space-y-2" data-testid="sort-controls">
              <label
                htmlFor="sort-select"
                className="text-xs font-bold text-text-muted uppercase tracking-widest"
              >
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  id="sort-select"
                  value={sortBy ?? "name"}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                  data-testid="sort-select"
                  className="flex-1 bg-surface-card border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary/50 transition-colors appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  data-testid="sort-order-toggle"
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                  aria-label={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}`}
                  className="p-2 bg-surface-card border border-border-default rounded-lg text-text-secondary hover:text-text-primary hover:border-brand-primary/50 transition-colors"
                >
                  {sortOrder === "asc" ? (
                    <ArrowDownAZ size={16} />
                  ) : (
                    <ArrowUpAZ size={16} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Categories */}
          <FilterSection
            title="Category"
            options={CATEGORIES}
            selected={activeFilters.categories}
            onToggle={(val) => toggleFilter("categories", val)}
          />

          {/* Classes (Only show if 'Spellcaster' category is active OR no categories active, but simpler to always show or conditioning?) */}
          {/* For now, always show, user can combine as they wish */}
          <FilterSection
            title="Class"
            options={SPELLCASTER_CLASSES}
            selected={activeFilters.classes}
            onToggle={(val) => toggleFilter("classes", val)}
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
