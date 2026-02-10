"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";

import { useDraggable } from "@dnd-kit/core";
import { Filter, Plus, Search, X } from "lucide-react";

import { FilterSection } from "@/components/ui/FilterSection";
import { GameImage } from "@/components/ui/GameImage";
import { cn, getCardImageUrl } from "@/lib/utils";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

// Combined type handling
type BrowserItem =
  | Unit
  | (Spellcaster & { category: "Spellcaster" })
  | Spell
  | Titan;

interface UnitBrowserProps {
  items: BrowserItem[];
  onSelectItem: (item: BrowserItem) => void;
  onQuickAdd: (item: BrowserItem) => void;
}

const SCHOOLS = [
  "Elemental",
  "Wild",
  "War",
  "Astral",
  "Holy",
  "Technomancy",
  "Necromancy",
  "Titan",
];
const RANKS = ["I", "II", "III", "IV"];
const SPELLCASTER_CLASSES = ["Duelist", "Conqueror", "Enchanter"];
const CATEGORY_TO_PLURAL: Record<string, string> = {
  Spellcaster: "Spellcasters",
  Creature: "Creatures",
  Building: "Buildings",
  Spell: "Spells",
  Titan: "Titans",
};

const CATEGORIES = Object.values(CATEGORY_TO_PLURAL);

// Priority Maps for Sorting
const CATEGORY_PRIORITY: Record<string, number> = {
  Titan: 1,
  Creature: 2,
  Spell: 3,
  Building: 4,
  Spellcaster: 5,
};

const GROUP_MODES = ["All", "Rank", "Magic School"] as const;

type GroupMode = (typeof GROUP_MODES)[number];

// Virtualization Types
type VirtualRow =
  | { type: "header"; title: string; count: number }
  | { type: "row"; items: BrowserItem[]; startIndex: number };

const arePropsEqual = (prev: UnitBrowserProps, next: UnitBrowserProps) => {
  // Only re-render if items array ref changes or selection counts change
  // Since items is a large array, we rely on parent usage (should be memoized or state-stable)
  // However, for drag performance, the critical part is ignoring function prop changes if they are recreated
  return (
    prev.items === next.items
  ); /* Functions ignored intentionally for perf if parent doesn't memoize them properly
       although ideally parent serves stable functions. 
       If we strictly compare functions, we rely on parent useCallback. */
};

import { useDebounce } from "@/hooks/useDebounce";

export const UnitBrowser = React.memo(function UnitBrowser({
  items,
  onSelectItem,
  onQuickAdd,
}: UnitBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [groupMode, setGroupMode] = useState<GroupMode>("All");
  const [showFilters, setShowFilters] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    schools: [] as string[],
    ranks: [] as string[],
    categories: [] as string[],
    classes: [] as string[],
  });

  // Responsive Columns Hook logic
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Matches Tailwind Breakpoints logic roughly
      if (width >= 1280)
        setColumns(4); // xl
      else setColumns(3); // lg & md & sm & default (Mobile 3 columns request)
    };

    handleResize(); // Init
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleFilter = (
    type: "schools" | "ranks" | "categories" | "classes",
    value: string
  ) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const clearFilters = () => {
    setActiveFilters({ schools: [], ranks: [], categories: [], classes: [] });
  };

  const activeFilterCount =
    activeFilters.schools.length +
    activeFilters.ranks.length +
    activeFilters.categories.length +
    activeFilters.classes.length;

  // 1. Filter Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const isUnit = "entity_id" in item;
      const rawCategory = isUnit ? item.category : "Spellcaster";
      const category = CATEGORY_TO_PLURAL[rawCategory] || rawCategory;
      const school = isUnit ? item.magic_school : "N/A";
      // Unified Rank: Check if item has rank property. Spells and Units do. Titans have rank "V".
      const rank = "rank" in item ? (item as Unit | Spell | Titan).rank : null;
      const spellcasterClass = !isUnit ? (item as Spellcaster).class : null;

      // Search - Expanded
      if (debouncedSearchQuery) {
        const lowQuery = debouncedSearchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(lowQuery);
        const matchesDesc =
          "description" in item &&
          item.description.toLowerCase().includes(lowQuery);
        const matchesTags =
          "tags" in item &&
          item.tags.some((tag) => tag.toLowerCase().includes(lowQuery));
        const matchesSchool =
          isUnit && item.magic_school.toLowerCase().includes(lowQuery);
        const matchesCategory = category.toLowerCase().includes(lowQuery);

        if (
          !matchesName &&
          !matchesDesc &&
          !matchesTags &&
          !matchesSchool &&
          !matchesCategory
        ) {
          return false;
        }
      }

      // Overlay Filters
      if (
        activeFilters.categories.length > 0 &&
        !activeFilters.categories.includes(category)
      )
        return false;
      if (activeFilters.schools.length > 0) {
        if (!isUnit) return false;
        if (!activeFilters.schools.includes(school)) return false;
      }
      if (activeFilters.ranks.length > 0) {
        // Now includes Spells if they have rank
        if (!rank || !activeFilters.ranks.includes(rank)) return false;
      }
      if (activeFilters.classes.length > 0) {
        if (!spellcasterClass) return false;
        if (!activeFilters.classes.includes(spellcasterClass)) return false;
      }

      return true;
    });
  }, [items, debouncedSearchQuery, activeFilters]);

  // 2. Group Items based on Mode
  const groupedContent = useMemo(() => {
    if (filteredItems.length === 0) return null;

    const groups: { title: string; items: BrowserItem[] }[] = [];

    if (groupMode === "All") {
      const orderedSingularCats = [
        "Spellcaster",
        "Creature",
        "Spell",
        "Building",
        "Titan",
      ];
      orderedSingularCats.forEach((catSingular) => {
        const catPlural = CATEGORY_TO_PLURAL[catSingular] || catSingular;
        const catItems = filteredItems.filter((i) => {
          const c = "entity_id" in i ? i.category : "Spellcaster";
          return c === catSingular;
        });
        if (catItems.length > 0) {
          catItems.sort((a, b) => {
            const rA = "rank" in a ? (a as Unit).rank || "I" : "I";
            const rB = "rank" in b ? (b as Unit).rank || "I" : "I";
            if (rA !== rB) return rA.localeCompare(rB);
            return a.name.localeCompare(b.name);
          });
          groups.push({ title: catPlural, items: catItems });
        }
      });
    } else if (groupMode === "Rank") {
      RANKS.forEach((rank) => {
        const rankItems = filteredItems.filter((i) => {
          if (!("entity_id" in i)) return false;
          return (i as Unit).rank === rank;
        });

        if (rankItems.length > 0) {
          // User Request: Sort by Creature > Spell > Building > Name
          rankItems.sort((a, b) => {
            const catA = "category" in a ? a.category : "Spellcaster";
            const catB = "category" in b ? b.category : "Spellcaster";

            const pA = CATEGORY_PRIORITY[catA] || 99;
            const pB = CATEGORY_PRIORITY[catB] || 99;

            if (pA !== pB) return pA - pB;

            return a.name.localeCompare(b.name);
          });
          groups.push({ title: `Rank ${rank}`, items: rankItems });
        }
      });
    } else if (groupMode === "Magic School") {
      SCHOOLS.forEach((school) => {
        const schoolItems = filteredItems.filter((i) => {
          if (!("entity_id" in i)) return false;
          return i.magic_school === school;
        });
        if (schoolItems.length > 0) {
          // User Request: Sort "Magic Schools should be Creature > Spells > buildings > (Rank?)"
          schoolItems.sort((a, b) => {
            // 1. Category
            const catA = "category" in a ? a.category : "Spellcaster";
            const catB = "category" in b ? b.category : "Spellcaster";
            const pA = CATEGORY_PRIORITY[catA] || 99;
            const pB = CATEGORY_PRIORITY[catB] || 99;
            if (pA !== pB) return pA - pB;

            // 2. Rank (Secondary)
            const rA = "rank" in a ? (a as Unit).rank || "I" : "I";
            const rB = "rank" in b ? (b as Unit).rank || "I" : "I";
            if (rA !== rB) return rA.localeCompare(rB);

            // 3. Name
            return a.name.localeCompare(b.name);
          });
          groups.push({ title: school, items: schoolItems });
        }
      });
    }

    return groups;
  }, [filteredItems, groupMode]);

  // 3. Flatten for Virtualization
  const virtualData = useMemo<VirtualRow[]>(() => {
    if (!groupedContent) return [];

    const rows: VirtualRow[] = [];

    groupedContent.forEach((group) => {
      // Header
      rows.push({
        type: "header",
        title: group.title,
        count: group.items.length,
      });

      // Chunk Items into Rows
      for (let i = 0; i < group.items.length; i += columns) {
        rows.push({
          type: "row",
          items: group.items.slice(i, i + columns),
          startIndex: i,
        });
      }
    });

    return rows;
  }, [groupedContent, columns]);

  return (
    <div className="flex flex-col h-full bg-surface-main border-r border-white/10 relative">
      {/* Header Area */}
      <div className="flex flex-col border-b border-white/10 z-10 bg-surface-main/95 backdrop-blur shadow-sm pb-2 shrink-0">
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
              <span>
                Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
              </span>
            </button>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={16}
            />
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
          {GROUP_MODES.map((mode) => (
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
            <h3 className="text-xs font-bold text-white uppercase">
              Active Filters
            </h3>
            <button
              onClick={() => setShowFilters(false)}
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
              onToggle={(v) => toggleFilter("categories", v)}
            />
            <FilterSection
              title="Class"
              options={SPELLCASTER_CLASSES}
              selected={activeFilters.classes}
              onToggle={(v) => toggleFilter("classes", v)}
            />
            <div className="space-y-6">
              <FilterSection
                title="Magic School"
                options={SCHOOLS}
                selected={activeFilters.schools}
                onToggle={(v) => toggleFilter("schools", v)}
              />
              <FilterSection
                title="Rank"
                options={RANKS}
                selected={activeFilters.ranks}
                onToggle={(v) => toggleFilter("ranks", v)}
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
      <div className="flex-1 bg-black/20 overflow-hidden">
        {!virtualData || virtualData.length === 0 ? (
          <div className="text-center text-gray-500 py-10 mt-10">
            No results found.
          </div>
        ) : (
          <Virtuoso
            style={{ height: "100%" }}
            data={virtualData}
            overscan={500}
            itemContent={(index, row) => {
              if (row.type === "header") {
                return (
                  <div className="px-4 pt-6 pb-2 bg-surface-main/50 backdrop-blur-sm sticky top-0 z-10">
                    <h3 className="text-brand-primary font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-1">
                      {row.title}{" "}
                      <span className="text-gray-600 text-xs ml-2">
                        ({row.count})
                      </span>
                    </h3>
                  </div>
                );
              } else {
                return (
                  <div
                    className="px-4 py-1 grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                  >
                    {row.items.map((item) => {
                      const id =
                        "entity_id" in item
                          ? item.entity_id
                          : item.spellcaster_id;
                      return (
                        <DraggableCard
                          key={id}
                          item={item}
                          onClick={onSelectItem}
                          onQuickAdd={onQuickAdd}
                        />
                      );
                    })}
                  </div>
                );
              }
            }}
          />
        )}
      </div>
    </div>
  );
}, arePropsEqual);

const DraggableCard = React.memo(function DraggableCard({
  item,
  onClick,
  onQuickAdd,
}: {
  item: BrowserItem;
  onClick: (item: BrowserItem) => void;
  onQuickAdd: (item: BrowserItem) => void;
}) {
  const id = "entity_id" in item ? item.entity_id : item.spellcaster_id;
  const isSpellcaster = !("entity_id" in item);
  const rank = !isSpellcaster ? (item as Unit).rank : null;
  const isTitan = !isSpellcaster && item.category === "Titan";
  const spellcasterClass = isSpellcaster ? (item as Spellcaster).class : null;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `browser-${id}`,
    data: { item },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (!isDragging) onClick(item);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation(); // Prevent inspect
        onQuickAdd(item);
      }}
      className={cn(
        "relative group cursor-grab active:cursor-grabbing flex flex-col",
        "aspect-3/4 rounded overflow-hidden border border-white/10 bg-surface-card",
        "hover:border-brand-primary/50 transition-all hover:scale-105",
        "opacity-100", // Reset default
        isDragging && "opacity-50",
        isSpellcaster &&
          "border-brand-accent/30 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
      )}
    >
      {/* Image Area - Touch action allowed to enable scrolling */}
      <div className="relative flex-1 overflow-hidden bg-gray-800">
        <GameImage
          src={getCardImageUrl(item)}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 33vw, 20vw"
          className="object-cover object-top transition-transform group-hover:scale-110"
        />
        {/* Rank Badge - Overlaid on Image */}
        {rank && !isTitan && (
          <div className="absolute top-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm shadow-md border border-white/10">
            {rank}
          </div>
        )}
        {/* Titan Badge */}
        {isTitan && (
          <div className="absolute top-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm shadow-md border border-white/10">
            TITAN
          </div>
        )}
        {/* Spellcaster Class Badge */}
        {spellcasterClass && (
          <div className="absolute top-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm shadow-md border border-white/10 uppercase">
            {spellcasterClass}
          </div>
        )}

        {/* Quick Add Button (Mobile/Tablet) */}
        <button
          className="md:hidden absolute top-1 left-1 bg-brand-primary text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-white/20 active:scale-95"
          onClick={(e) => {
            e.stopPropagation(); // Stop drag/select
            onQuickAdd(item);
          }}
          onPointerDown={(e) => e.stopPropagation()} // Stop drag initiation
          onTouchStart={(e) => e.stopPropagation()} // Stop drag initiation
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>

      {/* Name Banner - Increased Text Size */}
      <div className="h-7 min-h-7 bg-surface-main/95 border-t border-white/10 flex items-center justify-center px-1 z-10">
        <span className="text-[9px] font-bold text-gray-200 text-center leading-tight line-clamp-2 w-full px-1">
          {item.name}
        </span>
      </div>
    </div>
  );
});
