"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { Search, Filter, X } from "lucide-react";
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
const GROUP_MODES = ["All", "Rank", "Magic School"] as const;

type GroupMode = typeof GROUP_MODES[number];

export function UnitBrowser({ items, onSelectItem }: UnitBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupMode, setGroupMode] = useState<GroupMode>("All");
  const [showFilters, setShowFilters] = useState(false);
  
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
  
  const clearFilters = () => {
      setActiveFilters({ schools: [], ranks: [], categories: [] });
  };
  
  const activeFilterCount = activeFilters.schools.length + activeFilters.ranks.length + activeFilters.categories.length;

  // 1. Filter Items
  const filteredItems = useMemo(() => {
      return items.filter((item) => {
        // Search
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        
        const isUnit = 'entity_id' in item;
        const category = isUnit ? item.category : 'Spellcaster';
        const school = isUnit ? item.magic_school : 'N/A';
        const rank = isUnit ? item.card_config.rank : null;

        // Overlay Filters
        if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(category)) return false;
        if (activeFilters.schools.length > 0) {
            if (!isUnit) return false; // Spellcasters usually don't have school in this context yet
            if (!activeFilters.schools.includes(school)) return false;
        }
        if (activeFilters.ranks.length > 0) {
            if (!rank || !activeFilters.ranks.includes(rank)) return false;
        }

        return true;
      });
  }, [items, searchQuery, activeFilters]);

  // 2. Group Items based on Mode
  const groupedContent = useMemo(() => {
      if (filteredItems.length === 0) return null;

      const groups: { title: string; items: BrowserItem[] }[] = [];

      if (groupMode === "All") {
          // Group by Category (rank i-iv inside not strictly enforced by "group", just sort order?)
          // User said: "groups all creature, all spells and all building in theri own group rank i - iv"
          // So -> Category Headers -> Items sorted by Rank
          const cats = ["Spellcaster", "Creature", "Spell", "Building", "Titan"];
          cats.forEach(cat => {
              const catItems = filteredItems.filter(i => {
                  const c = 'entity_id' in i ? i.category : 'Spellcaster';
                  return c === cat;
              });
              if (catItems.length > 0) {
                  // Sort by Rank, then Name
                  catItems.sort((a, b) => {
                      const rA = 'card_config' in a ? a.card_config.rank : 'I';
                      const rB = 'card_config' in b ? b.card_config.rank : 'I';
                      if (rA !== rB) return rA.localeCompare(rB);
                      return a.name.localeCompare(b.name);
                  });
                  groups.push({ title: cat, items: catItems });
              }
          });
      } else if (groupMode === "Rank") {
          // Group by Rank I, II, III, IV
          RANKS.forEach(rank => {
              const rankItems = filteredItems.filter(i => {
                  if (!('entity_id' in i)) return false; // Exclude Spellcasters from rank view? Or treat as neutral? Usually no rank.
                  return i.card_config.rank === rank;
              });
              
              // Also include Spellcasters in a separate group or at top?
              // User said "Rank (list rank 1 spells... then rank ii...)"
              // Usually Spellcasters don't have ranks I-IV like units. Keeping them out or in separate "Commander" group.
              
              if (rankItems.length > 0) {
                  groups.push({ title: `Rank ${rank}`, items: rankItems });
              }
          });
      } else if (groupMode === "Magic School") {
           SCHOOLS.forEach(school => {
              const schoolItems = filteredItems.filter(i => {
                  if (!('entity_id' in i)) return false; 
                  return i.magic_school === school;
              });
              if (schoolItems.length > 0) {
                  groups.push({ title: school, items: schoolItems });
              }
           });
           
           // Catch-all for "Neutral" or others if any
           // ...
      }

      return groups;
  }, [filteredItems, groupMode]);


  return (
    <div className="flex flex-col h-full bg-surface-main border-r border-white/10 relative">
      {/* Header Area */}
      <div className="flex flex-col border-b border-white/10 z-10 bg-surface-main/95 backdrop-blur shadow-sm pb-2">
          {/* Title & Search */}
          <div className="p-4 pb-2 space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Unit Vault
                </h2>
                {/* Filter Toggle Button */}
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all border",
                        activeFilterCount > 0 
                            ? "bg-brand-primary text-white border-brand-primary shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                            : "bg-surface-card text-gray-400 border-white/10 hover:text-white"
                    )}
                >
                    <Filter size={14} />
                    <span>Filter {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                </button>
            </div>

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

          {/* Group Mode Tabs */}
          <div className="px-4 flex gap-4 text-xs font-bold text-gray-500 border-b border-white/5">
              {GROUP_MODES.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setGroupMode(mode)}
                    className={cn(
                        "pb-2 border-b-2 transition-colors uppercase tracking-wider",
                        groupMode === mode 
                            ? "text-brand-accent border-brand-accent" 
                            : "border-transparent hover:text-gray-300"
                    )}
                  >
                      {mode}
                  </button>
              ))}
          </div>
      </div>

      {/* Filter Overlay */}
      {showFilters && (
          <div className="absolute top-32 left-0 right-0 z-20 bg-surface-main border-b border-white/10 shadow-2xl animate-in slide-in-from-top-2 p-4 space-y-6">
               <div className="flex justify-between items-center mb-2">
                   <h3 className="text-xs font-bold text-white uppercase">Active Filters</h3>
                   <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-white"><X size={16}/></button>
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                   <FilterSection 
                        title="Category" 
                        options={CATEGORIES} 
                        selected={activeFilters.categories} 
                        onToggle={(v) => toggleFilter('categories', v)} 
                    />
                    <div className="space-y-6">
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
               
               <div className="flex justify-end pt-4 border-t border-white/5">
                   <button 
                        onClick={clearFilters}
                        className="text-xs text-red-400 hover:text-red-300 mr-4"
                   >
                       Clear All
                   </button>
                   <button 
                        onClick={() => setShowFilters(false)}
                        className="bg-brand-primary text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/80"
                   >
                       Done
                   </button>
               </div>
          </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 pb-20">
         {(!groupedContent || groupedContent.length === 0) ? (
             <div className="text-center text-gray-500 py-10 mt-10">
                 No results found.
             </div>
         ) : (
             <div className="space-y-6 p-4">
                 {groupedContent.map(group => (
                     <div key={group.title}>
                         <h3 className="text-brand-primary font-bold text-sm uppercase tracking-widest mb-3 border-b border-white/5 pb-1">
                             {group.title} <span className="text-gray-600 text-xs ml-2">({group.items.length})</span>
                         </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                             {group.items.map(item => {
                                 const id = 'entity_id' in item ? item.entity_id : item.hero_id;
                                 return (
                                     <DraggableCard 
                                         key={id} 
                                         item={item} 
                                         onClick={() => onSelectItem(item)} 
                                     />
                                 );
                             })}
                         </div>
                     </div>
                 ))}
             </div>
         )}
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
                "relative group cursor-grab active:cursor-grabbing flex flex-col",
                "aspect-3/4 rounded overflow-hidden border border-white/10 bg-surface-card",
                "hover:border-brand-primary/50 transition-all hover:scale-105",
                "opacity-100", // Reset default
                isDragging && "opacity-50",
                isHero && "border-brand-accent/30 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
            )}
        >
            {/* Image Area */}
            <div className="relative flex-1 overflow-hidden bg-gray-800">
                <Image 
                    src={getCardImageUrl(item)} 
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 33vw, 20vw"
                    className="object-cover object-top transition-transform group-hover:scale-110"
                />
                 {/* Rank Badge - Overlaid on Image - Larger Text */}
                 {rank && (
                     <div className="absolute top-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm shadow-md border border-white/10">
                        {rank}
                    </div>
                 )}
                 {/* Spellcaster Badge */}
                 {isHero && (
                    <div className="absolute top-0.5 left-0.5 bg-brand-primary/90 px-1 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider shadow-sm">
                        MAGE
                    </div>
                 )}
            </div>

            {/* Name Banner - Increased Text Size */}
            <div className="h-8 min-h-8 bg-surface-main/95 border-t border-white/10 flex items-center justify-center px-1 z-10">
                <span className="text-[10px] font-bold text-gray-200 text-center leading-tight line-clamp-2 w-full px-1">
                    {item.name}
                </span>
            </div>
        </div>
    )
}

