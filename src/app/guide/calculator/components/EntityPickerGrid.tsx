"use client";

import { useMemo, useState } from "react";

import { CheckCircle2, Circle, Search } from "lucide-react";

import { KnowledgeIcon } from "@/components/ui/icons/KnowledgeIcon";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { UnifiedEntity } from "@/types/api";

import { groupCalculatorEntities } from "../utils";

type CategoryFilter = "All" | "Creatures" | "Buildings" | "Spells";

interface EntityPickerGridProps {
  entities: UnifiedEntity[];
  selectedSet: Set<string>;
  ownedSet: Set<string>;
  hideOwned: boolean;
  onToggleEntity: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearAll: () => void;
  onToggleOwned: (id: string) => void;
  onHideOwnedChange: (checked: boolean) => void;
  totalEarned: number;
}

export function EntityPickerGrid({
  entities,
  selectedSet,
  ownedSet,
  hideOwned,
  onToggleEntity,
  onSelectAll,
  onClearAll,
  onToggleOwned,
  onHideOwnedChange,
  totalEarned,
}: EntityPickerGridProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");

  const { filteredEntities, groupedEntities } = useMemo(() => {
    // 1. Text and Tab Filtering
    const searchFiltered = entities.filter((e) => {
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()))
        return false;

      const cat = e.category || "Spellcaster";
      if (categoryFilter === "Spellcasters" && cat !== "Spellcaster")
        return false;
      if (categoryFilter === "Creatures" && cat !== "Creature") return false;
      if (categoryFilter === "Buildings" && cat !== "Building") return false;
      if (categoryFilter === "Spells" && cat !== "Spell") return false;

      return true;
    });

    // 2. Group and apply hideOwned logic
    const groups = groupCalculatorEntities(searchFiltered, ownedSet, hideOwned);
    return { filteredEntities: searchFiltered, groupedEntities: groups };
  }, [entities, search, categoryFilter, ownedSet, hideOwned]);

  // We only want to select items that are visible AND currently "unowned"
  const selectableVisibleIds = useMemo(() => {
    const ids: string[] = [];
    groupedEntities.forEach((g) => {
      g.items.forEach((item) => {
        if (!ownedSet.has(item.entity_id)) {
          ids.push(item.entity_id);
        }
      });
    });
    return ids;
  }, [groupedEntities, ownedSet]);

  const selectedCount = selectableVisibleIds.filter((id) =>
    selectedSet.has(id)
  ).length;

  return (
    <div className="bg-surface-card border border-border-default rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border-default bg-surface-dim space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Filter by name..."
                aria-label="Filter entities by name"
                className="w-full bg-surface-card border border-border-subtle rounded-md pl-8 pr-3 py-1.5 text-sm focus:border-brand-primary focus:outline-none transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category Tabs */}
            <div
              className="flex bg-surface-card border border-border-subtle rounded-md overflow-hidden text-xs shrink-0"
              role="tablist"
              aria-label="Filter by category"
            >
              {(["All", "Creatures", "Buildings", "Spells"] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={categoryFilter === cat}
                    className={cn(
                      "px-3 py-1.5 font-medium transition-colors border-r border-border-subtle last:border-r-0",
                      categoryFilter === cat
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                    )}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat === "All" ? "All" : cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Hide Owned Toggle */}
          <div className="flex items-center gap-2 shrink-0 bg-surface-card px-3 py-1.5 rounded border border-border-subtle">
            <Label
              htmlFor="hide-owned"
              className="text-xs font-semibold cursor-pointer"
            >
              Hide Owned
            </Label>
            <Switch
              id="hide-owned"
              checked={hideOwned}
              onCheckedChange={onHideOwnedChange}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle">
          <span className="text-text-muted">
            {selectableVisibleIds.length} shown · {selectedCount} selected
          </span>
          <div className="flex gap-3">
            <button
              className="text-brand-primary hover:text-brand-secondary font-semibold transition-colors"
              onClick={() => onSelectAll(selectableVisibleIds)}
            >
              Select All Shown
            </button>
            <button
              className="text-text-muted hover:text-text-primary font-semibold transition-colors"
              onClick={onClearAll}
            >
              Clear Tracked
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 space-y-6">
        {groupedEntities.length === 0 ? (
          <div className="text-center py-10 text-text-muted text-sm border border-dashed border-border-subtle rounded-lg">
            No entities match your filters.
          </div>
        ) : (
          <div className="columns-1 lg:columns-2 gap-6 space-y-6 lg:space-y-0">
            {groupedEntities.map((group) => (
              <div
                key={group.title}
                className="bg-surface-elevated/30 border border-border-subtle rounded-xl p-4 shadow-inner break-inside-avoid w-full lg:mb-6 inline-block"
              >
                <h2 className="text-lg font-bold text-text-primary border-b border-border-subtle pb-2 mb-4">
                  {group.title}
                </h2>
                <div className="flex flex-col gap-4">
                  {group.rankGroups.map((rankGroup) => {
                    // Determine faint background based on rank
                    let rankBg =
                      "bg-surface-elevated/40 border-border-default/50";
                    let rankText = "text-text-muted";

                    if (rankGroup.rank === "I") {
                      rankBg = "bg-slate-500/10 border-slate-500/20";
                      rankText = "text-slate-400";
                    } else if (rankGroup.rank === "II") {
                      rankBg = "bg-emerald-500/10 border-emerald-500/20";
                      rankText = "text-emerald-500/80";
                    } else if (rankGroup.rank === "III") {
                      rankBg = "bg-blue-500/10 border-blue-500/20";
                      rankText = "text-blue-400";
                    } else if (rankGroup.rank === "IV") {
                      rankBg = "bg-purple-500/10 border-purple-500/20";
                      rankText = "text-purple-400";
                    } else if (rankGroup.rank === "V") {
                      rankBg = "bg-amber-500/10 border-amber-500/20";
                      rankText = "text-amber-500/80";
                    }

                    return (
                      <div
                        key={`rank-${rankGroup.rank || "no-rank"}`}
                        className={cn(
                          rankGroup.rank &&
                            `border rounded-xl p-3 shadow-sm ${rankBg}`
                        )}
                      >
                        {/* Rank Header */}
                        {rankGroup.rank && (
                          <div className="flex items-center gap-2 mb-3 px-1">
                            <span
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-widest bg-surface-base border border-border-subtle rounded-full px-2.5 py-0.5 shadow-sm",
                                rankText
                              )}
                            >
                              Rank {rankGroup.rank}
                            </span>
                            <div
                              className={cn(
                                "flex-1 h-px opacity-50",
                                rankBg.split(" ")[0].replace("bg-", "bg-")
                              )}
                            />
                          </div>
                        )}

                        {/* Items */}
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2.5">
                          {rankGroup.items.map((entity) => {
                            const isOwned = ownedSet.has(entity.entity_id);
                            const isSelected =
                              selectedSet.has(entity.entity_id) && !isOwned;
                            const cost =
                              "knowledge_cost" in entity
                                ? (entity.knowledge_cost as number) || 0
                                : 0;
                            const canAfford = totalEarned >= cost;
                            return (
                              <div
                                key={entity.entity_id}
                                data-testid={`entity-card-${entity.entity_id}`}
                                className={cn(
                                  "relative flex items-center rounded-md border transition-all text-sm group overflow-hidden h-[42px]",
                                  isOwned
                                    ? "bg-surface-dim border-border-default opacity-50"
                                    : isSelected
                                      ? "bg-brand-primary/10 border-brand-primary/50 ring-1 ring-brand-primary/30 shadow-inner"
                                      : "bg-surface-base border-border-subtle hover:border-brand-primary/40 hover:bg-brand-primary/5 shadow-sm"
                                )}
                              >
                                {/* Selected indicator bar */}
                                {isSelected && (
                                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-primary rounded-l-md pointer-events-none" />
                                )}

                                {/* Main Select Area */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    !isOwned && onToggleEntity(entity.entity_id)
                                  }
                                  disabled={isOwned}
                                  aria-pressed={isSelected}
                                  aria-label={`Select ${entity.name}`}
                                  className={cn(
                                    "flex-1 flex items-center gap-2 px-2.5 py-1.5 text-left h-full min-w-0 transition-colors",
                                    !isOwned && "cursor-pointer"
                                  )}
                                >
                                  {/* Thumbnail */}
                                  <img
                                    src={getCardImageUrl(entity)}
                                    alt=""
                                    className="w-6 h-6 rounded object-cover shrink-0 mix-blend-screen bg-black/40"
                                    loading="lazy"
                                  />

                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <span
                                      className={cn(
                                        "truncate font-medium leading-tight",
                                        isOwned
                                          ? "line-through text-text-muted"
                                          : "text-text-primary"
                                      )}
                                    >
                                      {entity.name}
                                    </span>
                                    {!isOwned && (
                                      <span
                                        className={cn(
                                          "text-[9px] uppercase font-bold tracking-widest mt-0.5",
                                          isSelected
                                            ? "text-brand-primary"
                                            : "text-text-muted/60"
                                        )}
                                      >
                                        {isSelected ? "Tracked" : "Track"}
                                      </span>
                                    )}
                                  </div>

                                  {/* Cost */}
                                  {cost > 0 && (
                                    <span className="flex items-center gap-1 shrink-0 tabular-nums">
                                      <KnowledgeIcon size={12} />
                                      <span
                                        className={cn(
                                          "text-xs font-mono font-bold w-7 text-right",
                                          isOwned
                                            ? "text-text-muted"
                                            : canAfford && !isSelected
                                              ? "text-status-success"
                                              : "text-text-secondary"
                                        )}
                                      >
                                        {cost.toLocaleString()}
                                      </span>
                                    </span>
                                  )}
                                </button>

                                {/* Divider */}
                                <div className="w-px h-6 bg-border-subtle shrink-0 mx-1" />

                                {/* Owned toggle — Always visible, clear affordance */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (cost > 0) {
                                      onToggleOwned(entity.entity_id);
                                    }
                                  }}
                                  disabled={cost === 0}
                                  aria-label={
                                    isOwned
                                      ? `Mark ${entity.name} as Unowned`
                                      : `Mark ${entity.name} as Owned`
                                  }
                                  className={cn(
                                    "h-full px-2 flex flex-col items-center justify-center transition-colors shrink-0 outline-none w-12",
                                    cost === 0 &&
                                      "opacity-50 cursor-not-allowed",
                                    cost > 0 &&
                                      "focus-visible:ring-2 focus-visible:ring-brand-primary/50",
                                    isOwned
                                      ? cost > 0
                                        ? "text-status-success hover:text-status-success/80"
                                        : "text-status-success"
                                      : "text-text-muted hover:text-text-primary"
                                  )}
                                  title={
                                    cost === 0
                                      ? "Owned by Default"
                                      : isOwned
                                        ? "Mark as Unowned"
                                        : "Mark as Owned"
                                  }
                                >
                                  {isOwned ? (
                                    <CheckCircle2
                                      size={14}
                                      className="text-status-success drop-shadow-sm mb-[1px]"
                                    />
                                  ) : (
                                    <Circle
                                      size={14}
                                      className="opacity-40 mb-[1px]"
                                    />
                                  )}
                                  <span
                                    className={cn(
                                      "text-[8px] uppercase font-bold tracking-widest leading-none",
                                      isOwned ? "opacity-100" : "opacity-60"
                                    )}
                                  >
                                    {isOwned ? "Owned" : "Own"}
                                  </span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
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
