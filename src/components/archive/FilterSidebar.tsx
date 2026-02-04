"use client";

import { useState } from "react";
import { Search, Filter, X, ChevronDown, ChevronUp, Check, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

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

const SCHOOLS = ["Astral", "War", "Elemental", "Lightning", "Holy", "Dark", "Frost"];
const RANKS = ["I", "II", "III", "IV"];
const CATEGORIES = ["Hero", "Creature", "Building", "Spell", "Titan", "Consumable"];

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

        <div className="space-y-8">
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
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-brand-secondary hover:text-brand-secondary/80 flex items-center gap-1 font-mono uppercase tracking-wider"
            >
              <X size={12} /> Clear all filters
            </button>
          )}

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

function FilterSection({
  title,
  options,
  selected,
  onToggle,
  isGrid = false,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  isGrid?: boolean; // For Ranks mostly
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left group"
      >
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
          {title}
        </h3>
        {isExpanded ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />}
      </button>

      {isExpanded && (
        <div className={cn("space-y-1", isGrid && "grid grid-cols-4 gap-2 space-y-0")}>
          {options.map((option) => {
            const isSelected = selected.includes(option);
            
            if (isGrid) {
               return (
                 <button
                   key={option}
                   onClick={() => onToggle(option)}
                   className={cn(
                     "flex items-center justify-center p-2 rounded border text-xs font-mono font-bold transition-all",
                     isSelected
                       ? "bg-brand-primary border-brand-primary text-white"
                       : "bg-surface-card border-white/5 text-gray-400 hover:border-brand-primary/30"
                   )}
                 >
                   {option}
                 </button>
               )
            }

            return (
              <label
                key={option}
                className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer group transition-colors"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default since we wrap in label but handle toggle manually if needed, or just let input handle it. Better to use button/div for custom UI.
                  onToggle(option);
                }}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-brand-primary border-brand-primary"
                      : "border-gray-600 group-hover:border-gray-400"
                  )}
                >
                  {isSelected && <Check size={10} className="text-white" />}
                </div>
                <span className={cn("text-sm", isSelected ? "text-white" : "text-gray-400 group-hover:text-gray-300")}>
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
