"use client";

import React, { useCallback, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";

import { useUnitFiltering } from "@/features/deck-builder/hooks/domain/useUnitFiltering";
import { useResponsiveGrid } from "@/features/deck-builder/hooks/ui/useResponsiveGrid";
import {
  FilterState,
  useUnitBrowserState,
} from "@/features/deck-builder/hooks/ui/useUnitBrowserState";
import {
  DEFAULT_BROWSER_COLUMNS,
  GroupMode,
} from "@/services/config/constants";
import { BrowserItem, ItemUsageState, VirtualRow } from "@/types/browser";

import { BrowserSkeleton } from "./BrowserSkeleton";
import { UnitBrowserHeader } from "./UnitBrowserHeader";
import { UnitFilterOverlay } from "./UnitFilterOverlay";
import { UnitGridRow } from "./UnitGridRow";
import { UnitGroupHeader } from "./UnitGroupHeader";
import { prepareVirtualizationRows } from "./utils";

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
    activeFilterCount,
  } = useUnitBrowserState();

  // Responsive Columns Hook logic
  const { columns, isReady, containerRef } = useResponsiveGrid(
    DEFAULT_BROWSER_COLUMNS
  );

  // 1. Loading State (Grid not ready) overrides everything to prevent flash
  if (!isReady) {
    return (
      <div
        ref={containerRef}
        className="flex flex-col h-full bg-surface-main border-r border-border-default relative"
      >
        <BrowserSkeleton />
      </div>
    );
  }

  // 2. Empty State (No items, no search)
  if (items.length === 0 && !searchQuery) {
    return (
      <div
        ref={containerRef}
        className="flex flex-col h-full bg-surface-main border-r border-border-default relative"
      >
        <BrowserSkeleton />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-surface-main border-r border-border-default relative"
    >
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
        <UnitFilterOverlay onClose={() => setShowFilters(false)} />
      )}

      {/* Main Content Area - Memoized List */}
      <MemoizedUnitBrowserList
        items={items}
        columns={columns}
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
  columns: number;
  debouncedSearchQuery: string;
  activeFilters: FilterState;
  groupMode: GroupMode;
  onSelectItem: (item: BrowserItem, pos?: { x: number; y: number }) => void;
  onQuickAdd: (item: BrowserItem) => boolean | void;
  itemStates?: Map<string, ItemUsageState>;
}

const MemoizedUnitBrowserList = React.memo(function UnitBrowserList({
  items,
  columns,
  debouncedSearchQuery,
  activeFilters,
  groupMode,
  onSelectItem,
  onQuickAdd,
  itemStates,
}: UnitBrowserListProps) {
  // Collapsible Sections State
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(
    new Set()
  );

  const toggleSection = useCallback((title: string) => {
    setCollapsedSections((prev) => {
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
  const { groupedContent } = useUnitFiltering(
    items,
    debouncedSearchQuery,
    activeFilters,
    groupMode
  );

  // Flatten for Virtualization
  const virtualData = useMemo<VirtualRow[]>(() => {
    return prepareVirtualizationRows(
      groupedContent,
      columns,
      collapsedSections
    );
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
            priority={index < 4}
            itemStates={itemStates}
          />
        );
      }
    },
    [columns, onSelectItem, onQuickAdd, toggleSection, itemStates]
  );

  return (
    <div className="flex-1 bg-surface-dim overflow-hidden">
      {!virtualData || virtualData.length === 0 ? (
        <div className="text-center text-text-dimmed py-10 mt-10">
          No results found.
        </div>
      ) : (
        <Virtuoso
          style={{ height: "100%" }}
          className="overscroll-y-contain"
          data={virtualData}
          // Mobile (4 cols, 390px) -> ~105px height. Desktop (6 cols, 1280px) -> ~250px height.
          defaultItemHeight={columns <= 4 ? 120 : 250}
          overscan={200}
          // Pre-render first items so LCP images are discoverable in initial HTML
          initialItemCount={Math.min(4, virtualData.length)}
          itemContent={rowContent}
          components={{
            Footer: () => <div className="h-64" />,
          }}
        />
      )}
    </div>
  );
});
