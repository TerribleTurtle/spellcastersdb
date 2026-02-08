"use client";

import { useState } from "react";
import { UnifiedEntity } from "@/types/api"; // Assuming we use Unit type
import { UnitCard } from "./UnitCard";
import { FilterSidebar } from "./FilterSidebar";
import { useUnitSearch } from "@/hooks/useUnitSearch";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to safely get unique ID
function getUniqueId(entity: UnifiedEntity): string {
  if (entity.category === 'Spellcaster') return entity.spellcaster_id;
  // Consumables use entity_id now, so the default return works, but for safety:
  if (entity.category === 'Consumable') return entity.entity_id;
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
  
  // Initialize view mode based on screen size (mobile = list, desktop = grid)
  // Using lazy initialization to avoid setState in useEffect
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "list" : "grid";
    }
    return "grid"; // SSR fallback
  });
  const [activeFilters, setActiveFilters] = useState<{
    schools: string[];
    ranks: string[];
    categories: string[];
    classes: string[];
  }>({
    schools: props.defaultFilters?.schools || [],
    ranks: props.defaultFilters?.ranks || [],
    categories: props.defaultFilters?.categories || [],
    classes: props.defaultFilters?.classes || [],
  });

  // Filter Logic
  const toggleFilter = (type: "schools" | "ranks" | "categories" | "classes", value: string) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [type]: next };
    });
  };

  const clearFilters = () => {
    setActiveFilters({ schools: [], ranks: [], categories: [], classes: [] });
    setSearchQuery("");
  };

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
             Showing <strong className="text-white">{filteredUnits.length}</strong> results
          </div>
          
          <div className="flex items-center gap-2 bg-surface-card border border-white/5 p-1 rounded-lg">
             <button 
               onClick={() => setViewMode("grid")}
               className={cn(
                 "p-1.5 rounded transition-colors",
                 viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
               )}
               title="Grid View"
             >
                <LayoutGrid size={16} />
             </button>
             <button 
               onClick={() => setViewMode("list")}
               className={cn(
                 "p-1.5 rounded transition-colors",
                 viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
               )}
               title="List View"
             >
                <List size={16} />
             </button>
          </div>
        </div>

        {/* Results Grid */}
        {filteredUnits.length > 0 ? (
           <div className={cn(
             "grid gap-4",
             viewMode === "grid" 
               ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
               : "grid-cols-1"
           )}>
             {filteredUnits.map((unit) => (
               <UnitCard 
                 key={getUniqueId(unit)} 
                 unit={unit} 
                 variant={viewMode === "list" ? "compact" : "default"} 
               />
             ))}
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-xl">
            <p className="text-lg font-bold text-gray-400 mb-2">No units found</p>
            <p className="text-sm text-gray-600">Try adjusting your search or filters.</p>
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
