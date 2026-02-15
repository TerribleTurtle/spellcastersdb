"use client";

import React, { useMemo, useCallback } from "react";
import { Virtuoso } from "react-virtuoso";
import { UnitBrowserHeader } from "./UnitBrowserHeader";
import { UnitGroupHeader } from "./UnitGroupHeader";
import { UnitGridRow } from "./UnitGridRow";
import { UnitFilterOverlay } from "./UnitFilterOverlay";
import { useUnitFiltering } from "@/features/deck-builder/hooks/domain/useUnitFiltering";
import { useResponsiveGrid } from "@/features/deck-builder/hooks/ui/useResponsiveGrid";
import { 
    DEFAULT_BROWSER_COLUMNS,
    GroupMode
} from "@/services/config/constants";
import { prepareVirtualizationRows } from "./utils";
import { useUnitBrowserState, FilterState } from "@/features/deck-builder/hooks/ui/useUnitBrowserState";
import { BrowserItem, VirtualRow, ItemUsageState } from "@/types/browser";

interface UnitBrowserProps {
  items: BrowserItem[];
  onSelectItem: (item: BrowserItem, pos?: { x: number; y: number }) => void;
  onQuickAdd: (item: BrowserItem) => boolean | void;
  itemStates?: Map<string, ItemUsageState>;
}



export const UnitBrowser = React.memo(function UnitBrowser({
  items,
  onSelectItem,
  onQuickAdd,
  itemStates,
}: UnitBrowserProps) {
  const {
      searchQuery,
      setSearchQuery,
      debouncedSearchQuery,
      groupMode,
      setGroupMode,
      showFilters,
      setShowFilters,
      activeFilters,
      activeFilterCount
  } = useUnitBrowserState();

  return (
    <div className="flex flex-col h-full bg-surface-main border-r border-white/10 relative">
      <UnitBrowserHeader
          activeFilterCount={activeFilterCount}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          groupMode={groupMode}
          setGroupMode={setGroupMode}
      />

      {/* Filter Overlay */}
      {showFilters && (
        <UnitFilterOverlay
            onClose={() => setShowFilters(false)}
        />
      )}

      {/* Main Content Area - Memoized List */}
      <MemoizedUnitBrowserList 
        items={items}
        debouncedSearchQuery={debouncedSearchQuery}
        activeFilters={activeFilters}
        groupMode={groupMode}
        onSelectItem={onSelectItem}
        onQuickAdd={onQuickAdd}
        itemStates={itemStates}
      />
    </div>
  );
});

interface UnitBrowserListProps {
    items: BrowserItem[];
    debouncedSearchQuery: string;
    activeFilters: FilterState; 
    groupMode: GroupMode;
    onSelectItem: (item: BrowserItem, pos?: { x: number; y: number }) => void;
    onQuickAdd: (item: BrowserItem) => boolean | void;
    itemStates?: Map<string, ItemUsageState>;
}

const MemoizedUnitBrowserList = React.memo(function UnitBrowserList({
    items,
    debouncedSearchQuery,
    activeFilters,
    groupMode,
    onSelectItem,
    onQuickAdd,
    itemStates
}: UnitBrowserListProps) {
  // Responsive Columns Hook logic
  const columns = useResponsiveGrid(DEFAULT_BROWSER_COLUMNS);

  // Collapsible Sections State
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(new Set());

  const toggleSection = useCallback((title: string) => {
      setCollapsedSections(prev => {
          const next = new Set(prev);
          if (next.has(title)) {
              next.delete(title);
          } else {
              next.add(title);
          }
          return next;
      });
  }, []);

  // Use Custom Hook for Heavy Lifting
  const { groupedContent } = useUnitFiltering(items, debouncedSearchQuery, activeFilters, groupMode);

  // Flatten for Virtualization
  const virtualData = useMemo<VirtualRow[]>(() => {
      return prepareVirtualizationRows(groupedContent, columns, collapsedSections);
  }, [groupedContent, columns, collapsedSections]);

  // Optimize Row Rendering
  const rowContent = useCallback(
    (index: number, row: VirtualRow) => {
      if (row.type === "header") {
        return (
            <UnitGroupHeader 
                title={row.title} 
                count={row.count} 
                isCollapsed={row.isCollapsed}
                onToggle={() => toggleSection(row.title)} 
            />
        );
      } else {
        return (
          <UnitGridRow
            items={row.items}
            columns={columns}
            onSelectItem={onSelectItem}
            onQuickAdd={onQuickAdd}
            priority={index < 2}
            itemStates={itemStates}
          />
        );
      }
    },
    [columns, onSelectItem, onQuickAdd, toggleSection, itemStates]
  );

  return (
      <div className="flex-1 bg-black/20 overflow-hidden">
        {!virtualData || virtualData.length === 0 ? (
          <div className="text-center text-gray-500 py-10 mt-10">
            No results found.
          </div>
        ) : (
          <Virtuoso
            style={{ height: "100%" }}
            className="overscroll-y-contain"
            data={virtualData}
            overscan={200} 
            itemContent={rowContent}
            components={{
              Footer: () => <div className="h-64" />, 
            }}
          />
        )}
      </div>
  );
});
