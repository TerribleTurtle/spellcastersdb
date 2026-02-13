import { Filter, Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";
import { GROUP_MODES, GroupMode } from "@/services/config/constants";

interface UnitBrowserHeaderProps {
  activeFilterCount: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  groupMode: GroupMode;
  setGroupMode: (mode: GroupMode) => void;
}

export function UnitBrowserHeader({
  activeFilterCount,
  showFilters,
  setShowFilters,
  searchQuery,
  setSearchQuery,
  groupMode,
  setGroupMode,
}: UnitBrowserHeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when expanded
  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Collapse search if empty on blur (optional UX, maybe better to keep manual close)
  // For now, manual close via button or explicit blur handler if needed.
  
  const handleClearSearch = () => {
      setSearchQuery("");
      setIsSearchExpanded(false);
  };

  return (
    <div className="flex items-center justify-between px-4 h-12 border-b border-white/10 z-10 bg-surface-main/95 backdrop-blur shadow-sm shrink-0 gap-2">
      
      {/* Left Side: Tabs or Search Input */}
      <div className="flex-1 flex items-center overflow-hidden h-full">
        {isSearchExpanded ? (
             <div className="flex-1 flex items-center animate-in fade-in slide-in-from-left-2 duration-200">
                <Search size={16} className="text-brand-primary mr-2 shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search units..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            handleClearSearch();
                        }
                    }}
                    className="w-full bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none"
                />
             </div>
        ) : (
             <div className="flex gap-4 text-xs font-bold text-gray-500 h-full items-center animate-in fade-in slide-in-from-left-2 duration-200">
                {GROUP_MODES.map((mode) => (
                <button
                    key={mode}
                    onClick={() => setGroupMode(mode)}
                    className={cn(
                    "h-full border-b-2 transition-all uppercase tracking-wider flex items-center px-1",
                    groupMode === mode
                        ? "text-brand-accent border-brand-accent"
                        : "border-transparent hover:text-gray-300 hover:border-white/10"
                    )}
                >
                    {mode}
                </button>
                ))}
            </div>
        )}
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-1 shrink-0">
         {/* Search Toggle / Close */}
         {isSearchExpanded ? (
             <button
                onClick={handleClearSearch}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                title="Close Search"
             >
                 <X size={18} />
             </button>
         ) : (
             <button
                onClick={() => setIsSearchExpanded(true)}
                className={cn(
                    "p-2 rounded-lg transition-colors",
                    searchQuery ? "text-brand-primary bg-brand-primary/10" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title="Search"
             >
                 <Search size={18} />
             </button>
         )}

         {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "relative p-2 rounded-lg transition-all",
            activeFilterCount > 0
              ? "text-brand-primary bg-brand-primary/10"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
          title="Filters"
        >
          <Filter size={18} />
          {activeFilterCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-brand-primary shadow-sm ring-1 ring-bg-surface-main" />
          )}
        </button>
      </div>
    </div>
  );
}
