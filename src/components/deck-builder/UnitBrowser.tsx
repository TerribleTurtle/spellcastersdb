"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { Unit } from "@/types/api";
import { FilterSection } from "@/components/ui/FilterSection";
import { cn } from "@/lib/utils";

// Mock Data for MVP - In real app, this should be filtered from a full list passed in props
// or fetched via a hook. For now, we assume props.
interface UnitBrowserProps {
  units: Unit[];
  onSelectUnit: (unit: Unit) => void;
}

const SCHOOLS = ["Astral", "War", "Elemental", "Lightning", "Holy", "Dark", "Frost"];
const RANKS = ["I", "II", "III", "IV"];
// "Titan" is special, handled separately usually, but for browser we might include it or filter it
const CATEGORIES = ["Spellcaster", "Creature", "Building", "Spell", "Titan"]; 

export function UnitBrowser({ units, onSelectUnit }: UnitBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    schools: [] as string[],
    ranks: [] as string[],
    categories: [] as string[],
  });

  const toggleFilter = (type: "schools" | "ranks" | "categories", value: string) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  // Filter Logic
  const filteredUnits = units.filter((unit) => {
    // Search
    if (searchQuery && !unit.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
    }
    // Categories
    if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(unit.category)) {
        return false;
    }
    // Schools
    if (activeFilters.schools.length > 0 && !activeFilters.schools.includes(unit.magic_school)) {
        return false;
    }
    // Ranks
    if (activeFilters.ranks.length > 0 && !activeFilters.ranks.includes(unit.card_config.rank)) {
        return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-surface-main border-r border-white/10">
      {/* Search Header */}
      <div className="p-4 border-b border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Unit Vault
        </h2>
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
      </div>

      {/* Main Content Area: Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
         {/* Filters (Collapsible in future, inline for now or separate tab?) 
            User asked for "Left Column" to be the browser. 
            Standard layout: Search on top, Filters below, then Results? 
            Or Filters alongside results? 
            Given space, let's put filters in a collapsible section or just list them.
         */}
         <div className="p-4 space-y-6">
            <FilterSection 
                title="Category" 
                options={CATEGORIES} 
                selected={activeFilters.categories} 
                onToggle={(v) => toggleFilter('categories', v)} 
            />
            <FilterSection 
                title="Magic School" 
                options={SCHOOLS} 
                selected={activeFilters.schools} 
                onToggle={(v) => toggleFilter('schools', v)} 
            />
             <FilterSection 
                title="Rank" 
                options={RANKS} 
                selected={activeFilters.ranks} 
                onToggle={(v) => toggleFilter('ranks', v)} 
                isGrid
            />
         </div>

         <div className="p-4 grid grid-cols-2 gap-3">
            {filteredUnits.length === 0 ? (
                <div className="col-span-2 text-center text-gray-500 py-10">
                    No units found.
                </div>
            ) : (
                filteredUnits.map(unit => (
                    <DraggableUnitCard 
                        key={unit.entity_id} 
                        unit={unit} 
                        onClick={() => onSelectUnit(unit)} 
                    />
                ))
            )}
         </div>
      </div>
    </div>
  );
}

function DraggableUnitCard({ unit, onClick }: { unit: Unit; onClick: () => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `browser-${unit.entity_id}`,
        data: { unit }
    });

    return (
        <div 
            ref={setNodeRef} 
            {...listeners} 
            {...attributes}
            onClick={onClick}
            className={cn(
                "relative group cursor-grab active:cursor-grabbing",
                "aspect-3/4 rounded-lg overflow-hidden border border-white/10 bg-surface-card",
                "hover:border-brand-primary/50 transition-all hover:scale-105",
                isDragging && "opacity-50"
            )}
        >
            {/* Image placeholder - normally Next/Image */}
            <div className={`absolute inset-0 bg-gray-800 flex items-center justify-center`}>
                <span className="text-xs text-center p-2 opacity-50">{unit.name}</span>
            </div>
             {/* Simple Rank Badge Overlay */}
            <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent">
                {unit.card_config.rank}
            </div>
            {/* Magic School Color Border/Glow could go here */}
        </div>
    )
}
