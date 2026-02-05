"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { Unit, Spellcaster } from "@/types/api";
import { FilterSection } from "@/components/ui/FilterSection";
import { cn, getCardImageUrl } from "@/lib/utils";

// Combined type handling
type BrowserItem = Unit | (Spellcaster & { category: 'Spellcaster' });

interface UnitBrowserProps {
  items: BrowserItem[];
  onSelectItem: (item: BrowserItem) => void;
}

const SCHOOLS = ["Astral", "War", "Elemental", "Lightning", "Holy", "Dark", "Frost"];
const RANKS = ["I", "II", "III", "IV"];
const CATEGORIES = ["Spellcaster", "Creature", "Building", "Spell", "Titan"]; 

export function UnitBrowser({ items, onSelectItem }: UnitBrowserProps) {
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
  const filteredItems = items.filter((item) => {
    // Search
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
    }
    
    // Type Guard for fields
    const isUnit = 'entity_id' in item;
    const category = isUnit ? item.category : 'Spellcaster';
    const school = isUnit ? item.magic_school : 'N/A';
    const rank = isUnit ? item.card_config.rank : null;

    // Categories
    if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(category)) {
        return false;
    }
    // Schools - Heroes might not have school in API data yet, logic here strictly filters if mismatch
    if (activeFilters.schools.length > 0) {
        if (!isUnit) {
            // For heroes without explicit school, we might treat them as matching none, 
            // or pass them if NO school filter is strict?
            // Current 'AND' logic means if I select "Astral", a Hero with no school won't show.
            // That is correct behavior.
            return false; 
        }
        if (!activeFilters.schools.includes(school)) return false;
    }
    // Ranks
    if (activeFilters.ranks.length > 0) {
        if (!rank || !activeFilters.ranks.includes(rank)) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-surface-main border-r border-white/10">
      {/* Sticky Header with Search AND Filters */}
      <div className="flex flex-col border-b border-white/10 z-10 bg-surface-main/95 backdrop-blur shadow-sm">
          {/* Search */}
          <div className="p-4 space-y-4 pb-2">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Unit Vault
            </h2>
            <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-card border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
            </div>
          </div>
          
          {/* Compact Filters - Horizontal Scroll or Accordion? 
              User complained about scrolling filters. Let's make them collapsible or scrollable standalone?
              But sticky header approach means they are always visible.
              Let's put them in a max-h container with overflow-y-auto so they don't eat the whole screen
          */}
          <div className="px-4 pb-4 max-h-[30vh] overflow-y-auto space-y-4 border-t border-white/5 pt-4">
              <FilterSection 
                    title="Category" 
                    options={CATEGORIES} 
                    selected={activeFilters.categories} 
                    onToggle={(v) => toggleFilter('categories', v)} 
                />
               {/* Show other filters only if relevant? Keep standard */}
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
      </div>

      {/* Main Content Area: Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
         <div className="p-3 grid grid-cols-3 gap-2">
            {filteredItems.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500 py-10">
                    No results.
                </div>
            ) : (
                filteredItems.map(item => {
                    const id = 'entity_id' in item ? item.entity_id : item.hero_id;
                    return (
                        <DraggableCard 
                            key={id} 
                            item={item} 
                            onClick={() => onSelectItem(item)} 
                        />
                    );
                })
            )}
         </div>
      </div>
    </div>
  );
}

function DraggableCard({ item, onClick }: { item: BrowserItem; onClick: () => void }) {
    const id = 'entity_id' in item ? item.entity_id : item.hero_id;
    const isHero = !('entity_id' in item);
    const rank = !isHero ? item.card_config.rank : null;

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `browser-${id}`,
        data: { item }
    });

    return (
        <div 
            ref={setNodeRef} 
            {...listeners} 
            {...attributes}
            onClick={onClick}
            className={cn(
                "relative group cursor-grab active:cursor-grabbing",
                "aspect-3/4 rounded overflow-hidden border border-white/10 bg-surface-card",
                "hover:border-brand-primary/50 transition-all hover:scale-105",
                isDragging && "opacity-50",
                isHero && "border-brand-accent/30 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
            )}
        >

            {/* Image */}
            <img 
                src={getCardImageUrl(item)} 
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover bg-gray-800"
            />
             
             {/* Rank Badge */}
             {rank && (
                 <div className="absolute top-0.5 right-0.5 bg-black/60 px-1 py-0.5 rounded text-[8px] font-mono text-brand-accent">
                    {rank}
                </div>
             )}
             
             {/* Spellcaster Badge */}
             {isHero && (
                <div className="absolute top-0.5 left-0.5 bg-brand-primary/80 px-1 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">
                    HERO
                </div>
             )}
        </div>
    )
}
