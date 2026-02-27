"use client";

import { useEffect, useMemo } from "react";

import { useCalculatorStore } from "@/store/calculator-store";
import { GameSystems, UnifiedEntity } from "@/types/api";

import { AccountPanel } from "./AccountPanel";
import { EntityPickerGrid } from "./EntityPickerGrid";
import { ForecastPanel } from "./ForecastPanel";

interface UnlockCalculatorProps {
  entities: UnifiedEntity[];
  systems: GameSystems;
}

export function UnlockCalculator({ entities, systems }: UnlockCalculatorProps) {
  const {
    selectedIds,
    ownedIds,
    currentKnowledge,
    winRate,
    gamesPerDay,
    matchDuration,
    hideOwned,
    toggleEntity,
    toggleOwned,
    selectAll,
    clearAll,
    setCurrentKnowledge,
    setWinRate,
    setGamesPerDay,
    setMatchDuration,
    setHideOwned,
    initializeDefaults,
  } = useCalculatorStore();

  useEffect(() => {
    // Collect all entities that have a 0 cost
    const defaultIds = entities
      .filter((e) => {
        if ("knowledge_cost" in e && typeof e.knowledge_cost === "number") {
          return e.knowledge_cost === 0;
        }
        return true; // if no cost property, assume base 0
      })
      .map((e) => e.entity_id);

    if (defaultIds.length > 0) {
      initializeDefaults(defaultIds);
    }
  }, [entities, initializeDefaults]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const ownedSet = useMemo(() => new Set(ownedIds), [ownedIds]);

  const targetCost = useMemo(() => {
    let total = 0;
    entities.forEach((e) => {
      // Owned items do not contribute to the target cost
      if (
        selectedSet.has(e.entity_id) &&
        !ownedSet.has(e.entity_id) &&
        "knowledge_cost" in e &&
        typeof e.knowledge_cost === "number"
      ) {
        total += e.knowledge_cost;
      }
    });
    return total;
  }, [entities, selectedSet, ownedSet]);

  return (
    <div className="space-y-6">
      {/* Top row: Account inputs + Forecast side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AccountPanel
          currentKnowledge={currentKnowledge}
          onKnowledgeChange={setCurrentKnowledge}
          winRate={winRate}
          onWinRateChange={setWinRate}
          gamesPerDay={gamesPerDay}
          onGamesPerDayChange={setGamesPerDay}
          matchDuration={matchDuration}
          onMatchDurationChange={setMatchDuration}
          winReward={systems.progression.earn_rates.win}
          lossReward={systems.progression.earn_rates.loss}
        />

        <ForecastPanel
          targetCost={targetCost}
          currentKnowledge={currentKnowledge}
          selectedCount={selectedIds.length}
          winRate={winRate}
          gamesPerDay={gamesPerDay}
          matchDuration={matchDuration}
          systems={systems}
        />
      </div>

      {/* Entity Picker */}
      <EntityPickerGrid
        entities={entities}
        selectedSet={selectedSet}
        ownedSet={ownedSet}
        hideOwned={hideOwned}
        onToggleEntity={toggleEntity}
        onSelectAll={selectAll}
        onClearAll={clearAll}
        onToggleOwned={toggleOwned}
        onHideOwnedChange={setHideOwned}
        totalEarned={currentKnowledge}
      />
    </div>
  );
}
