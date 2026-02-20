import { useEffect, useRef, useState } from "react";

import { Filter, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <div className="relative h-8 border-b border-border-default z-40 bg-surface-main/95 backdrop-blur shadow-sm shrink-0">
      <div className="flex items-center justify-between px-4 h-full gap-2 max-w-site-shell mx-auto">
        {/* Left Side: Tabs or Search Input */}
        <div className="flex-1 flex items-center overflow-hidden h-full">
          {isSearchExpanded ? (
            <div className="flex-1 flex items-center animate-in fade-in slide-in-from-left-2 duration-200">
              <Search size={16} className="text-brand-primary mr-2 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleClearSearch();
                  }
                }}
                className="w-full bg-transparent border-none text-sm text-text-primary placeholder-gray-500 focus:outline-none"
              />
            </div>
          ) : (
            <div className="flex gap-4 text-xs font-bold text-text-muted h-full items-center">
              {GROUP_MODES.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setGroupMode(mode)}
                  className={cn(
                    "h-full border-b-2 transition-colors uppercase tracking-wider flex items-center px-1",
                    groupMode === mode
                      ? "text-brand-accent border-brand-accent"
                      : "border-transparent hover:text-text-secondary hover:border-border-default"
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearSearch}
              className="text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-hover"
              title="Close Search"
              aria-label="Clear search"
            >
              <X size={18} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchExpanded(true)}
              className={cn(
                "rounded-lg",
                searchQuery
                  ? "text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-card"
              )}
              title="Search"
              aria-label="Search cards"
            >
              <Search size={18} />
            </Button>
          )}

          {/* Theme Picker - Moved to Sidebar/Navbar */}
          {/* <ThemePicker className="text-text-muted hover:text-text-primary hover:bg-surface-card rounded-lg" /> */}

          {/* Filter Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "relative rounded-lg",
              activeFilterCount > 0
                ? "text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20"
                : "text-text-muted hover:text-text-primary hover:bg-surface-card"
            )}
            title="Filters"
            aria-label={showFilters ? "Close filters" : "Filter cards"}
          >
            <Filter size={18} />
            {activeFilterCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-brand-primary shadow-sm ring-1 ring-bg-surface-main" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
