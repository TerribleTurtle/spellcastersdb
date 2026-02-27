"use client";

import { ShoppingCart, Skull, Target, TrendingUp, Trophy } from "lucide-react";

import { KnowledgeIcon } from "@/components/ui/icons/KnowledgeIcon";
import { cn } from "@/lib/utils";
import { GameSystems } from "@/types/api";

interface ForecastPanelProps {
  targetCost: number;
  currentKnowledge: number;
  selectedCount: number;
  winRate: number;
  gamesPerDay: number;
  matchDuration: number;
  systems: GameSystems;
}

interface StatCardProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  valueClassName?: string;
  subLabel?: string;
  muted?: boolean;
}

function StatCard({
  label,
  icon,
  value,
  valueClassName,
  subLabel,
  muted,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-dim rounded-md p-3 border border-border-subtle flex flex-col justify-center text-center",
        muted && "opacity-40"
      )}
    >
      <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold leading-tight mb-1">
        {label}
      </p>
      <div className="flex items-center justify-center gap-1">
        {icon}
        <p
          className={cn(
            "text-lg font-bold font-mono tabular-nums",
            valueClassName ?? "text-text-primary"
          )}
        >
          {value}
        </p>
      </div>
      {subLabel && (
        <p className="text-[9px] text-text-muted mt-0.5">{subLabel}</p>
      )}
    </div>
  );
}

export function ForecastPanel({
  targetCost,
  currentKnowledge,
  selectedCount,
  winRate,
  gamesPerDay,
  matchDuration,
  systems,
}: ForecastPanelProps) {
  const { progression } = systems;
  const rates = progression.earn_rates;

  const blendedRatePerMatch = winRate * rates.win + (1 - winRate) * rates.loss;

  const deficit = Math.max(0, targetCost - currentKnowledge);

  const isUnlocked = targetCost > 0 && deficit === 0;
  const hasTarget = targetCost > 0;

  const gamesAllWins =
    rates.win > 0 ? Math.ceil(deficit / rates.win) : Infinity;
  const gamesAllLosses =
    rates.loss > 0 ? Math.ceil(deficit / rates.loss) : Infinity;
  const gamesCustom =
    blendedRatePerMatch > 0
      ? Math.ceil(deficit / blendedRatePerMatch)
      : Infinity;

  let daysToGoal: string;
  if (!hasTarget || isUnlocked) {
    daysToGoal = "—";
  } else if (gamesPerDay <= 0) {
    daysToGoal = "∞";
  } else {
    const dailyEarnRate =
      rates.first_daily_match + gamesPerDay * blendedRatePerMatch;
    daysToGoal = Math.ceil(deficit / dailyEarnRate).toString();
  }

  let timeToGoal: string;
  if (!hasTarget || isUnlocked) {
    timeToGoal = "—";
  } else if (gamesCustom === Infinity) {
    timeToGoal = "∞";
  } else {
    const totalMins = gamesCustom * matchDuration;
    timeToGoal =
      totalMins < 60 ? `${totalMins}m` : `${(totalMins / 60).toFixed(1)}h`;
  }

  const progressPct =
    targetCost > 0
      ? Math.min(100, Math.round((currentKnowledge / targetCost) * 100))
      : 0;

  const formatGames = (n: number): string =>
    n === Infinity ? "∞" : n.toLocaleString();

  const showStats = hasTarget && !isUnlocked;

  return (
    <div className="bg-surface-card border border-border-default rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Target size={16} className="text-text-secondary" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Forecast
        </h2>
        {selectedCount > 0 && (
          <span className="text-[10px] bg-surface-dim border border-border-subtle rounded px-1.5 py-0.5 text-text-muted font-mono ml-auto">
            {selectedCount} incantation{selectedCount === 1 ? "" : "s"} selected
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {/* Progress + Target Column (spans 3 so it sits on top) */}
        <div className="col-span-3 bg-surface-dim rounded-md p-3 border border-border-subtle flex flex-col justify-center">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-text-muted font-medium">
              {hasTarget
                ? isUnlocked
                  ? "Goal Accomplished"
                  : `${deficit.toLocaleString()} remaining`
                : "No incantations selected"}
            </span>
            {hasTarget && (
              <span className="font-mono tabular-nums font-bold text-text-primary">
                {progressPct}% of {targetCost.toLocaleString()}
              </span>
            )}
          </div>
          <div className="h-2 bg-surface-base rounded-full overflow-hidden border border-border-subtle/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isUnlocked
                  ? "bg-status-success"
                  : "bg-gradient-to-r from-brand-primary to-brand-secondary"
              }`}
              style={{ width: `${progressPct}%` }} // eslint-disable-line react/forbid-dom-props -- Dynamic width for progress bar requires inline style
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${progressPct}% of target knowledge earned`}
            />
          </div>
        </div>

        <StatCard
          label="Target"
          icon={<KnowledgeIcon size={10} />}
          value={hasTarget ? targetCost.toLocaleString() : "—"}
          muted={!hasTarget}
        />
        <StatCard
          label="Wins Needed"
          icon={<Trophy size={10} className="text-status-success" />}
          value={showStats ? formatGames(gamesAllWins) : "—"}
          valueClassName="text-status-success"
          subLabel={showStats ? "best case" : undefined}
          muted={!showStats}
        />
        <StatCard
          label="Losses Needed"
          icon={<Skull size={10} className="text-status-danger-text" />}
          value={showStats ? formatGames(gamesAllLosses) : "—"}
          valueClassName="text-status-danger-text"
          subLabel={showStats ? "worst case" : undefined}
          muted={!showStats}
        />
      </div>

      {/* Projection Row — always visible, empty CTA when no target */}
      {!showStats ? (
        isUnlocked ? (
          // Goal met — nudge toward buying
          <div className="border border-status-success/30 bg-status-success/5 rounded-lg p-4 text-center flex flex-col items-center justify-center gap-1.5 min-h-[80px]">
            <ShoppingCart size={16} className="text-status-success/70" />
            <p className="text-xs text-status-success font-semibold">
              You can buy your tracked items now!
            </p>
            <p className="text-[10px] text-text-muted">
              You have enough knowledge to unlock everything you&apos;ve
              tracked.
            </p>
          </div>
        ) : (
          // Nothing selected
          <div className="border border-border-subtle bg-surface-dim/40 rounded-lg p-4 text-center flex flex-col items-center justify-center gap-1.5 min-h-[80px]">
            <TrendingUp size={16} className="text-text-muted/50" />
            <p className="text-xs text-text-muted/60 font-medium">
              Select entities below to see your projection
            </p>
          </div>
        )
      ) : (
        <div className="border border-brand-primary/30 bg-brand-primary/5 rounded-lg p-3">
          <p className="text-[9px] text-brand-primary/70 uppercase tracking-widest font-bold mb-2.5 text-center">
            Projected at {Math.round(winRate * 100)}% Win Rate
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold mb-1">
                Games
              </p>
              <p className="text-xl font-bold font-mono tabular-nums text-text-primary">
                {formatGames(gamesCustom)}
              </p>
              <p className="text-[8px] text-text-muted/60 mt-0.5">
                no daily bonus
              </p>
            </div>
            <div className="border-x border-brand-primary/20">
              <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold mb-1">
                Days
              </p>
              <p className="text-xl font-bold font-mono tabular-nums text-text-primary">
                {daysToGoal}
              </p>
              {gamesPerDay > 0 && (
                <p className="text-[8px] text-text-muted mt-0.5">
                  at {gamesPerDay}/day + daily bonus
                </p>
              )}
            </div>
            <div>
              <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold mb-1">
                Time
              </p>
              <p className="text-xl font-bold font-mono tabular-nums text-text-primary">
                {timeToGoal}
              </p>
              <p className="text-[8px] text-text-muted/60 mt-0.5">
                {matchDuration > 0 && gamesCustom !== Infinity
                  ? `~${matchDuration}m/match`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
