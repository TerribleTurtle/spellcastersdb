"use client";

import { Clock, Swords, TrendingUp, X } from "lucide-react";

import { KnowledgeIcon } from "@/components/ui/icons/KnowledgeIcon";
import { Label } from "@/components/ui/label";

interface AccountPanelProps {
  currentKnowledge: number;
  onKnowledgeChange: (value: number) => void;
  winRate: number;
  onWinRateChange: (value: number) => void;
  gamesPerDay: number;
  onGamesPerDayChange: (value: number) => void;
  matchDuration: number;
  onMatchDurationChange: (value: number) => void;
  // Pass down the actual earn rates so we can show them as context
  winReward: number;
  lossReward: number;
}

export function AccountPanel({
  currentKnowledge,
  onKnowledgeChange,
  winRate,
  onWinRateChange,
  gamesPerDay,
  onGamesPerDayChange,
  matchDuration,
  onMatchDurationChange,
  winReward,
  lossReward,
}: AccountPanelProps) {
  return (
    <div className="bg-surface-card border border-border-default rounded-lg p-4 space-y-5">
      {/* ── Knowledge Bank ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <KnowledgeIcon size={14} />
          <Label
            htmlFor="current-knowledge"
            className="text-xs font-bold text-text-primary uppercase tracking-wider"
          >
            Knowledge
          </Label>
        </div>
        {/* Main Knowledge Stepper */}
        <div className="space-y-1.5">
          <div className="flex items-stretch gap-1">
            {/* Left: − Win (outer), − Loss (inner) — both red */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                aria-label={`Subtract win reward (${winReward})`}
                title={`−Win (−${winReward})`}
                disabled={currentKnowledge <= 0}
                onClick={() =>
                  onKnowledgeChange(Math.max(0, currentKnowledge - winReward))
                }
                className="flex-1 w-12 rounded border border-status-danger/30 bg-status-danger/5 text-status-danger-text hover:bg-status-danger/15 transition-colors text-xs font-bold disabled:opacity-30 flex flex-col items-center justify-center gap-0.5 py-1"
              >
                <span className="text-sm font-bold leading-none">
                  −{winReward}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Subtract loss reward (${lossReward})`}
                title={`−Loss (−${lossReward})`}
                disabled={currentKnowledge <= 0}
                onClick={() =>
                  onKnowledgeChange(Math.max(0, currentKnowledge - lossReward))
                }
                className="flex-1 w-12 rounded border border-status-danger/30 bg-status-danger/5 text-status-danger-text hover:bg-status-danger/15 transition-colors text-xs font-bold disabled:opacity-30 flex flex-col items-center justify-center gap-0.5 py-1"
              >
                <span className="text-sm font-bold leading-none">
                  −{lossReward}
                </span>
              </button>
            </div>

            {/* Center: big number input with KnowledgeIcon inset */}
            <div className="relative flex-1 group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <KnowledgeIcon size={18} />
              </span>
              <input
                id="current-knowledge"
                type="number"
                min="0"
                aria-label="Current Knowledge Bank"
                className="w-full bg-surface-dim border border-border-subtle rounded-md pl-8 pr-10 py-2 text-2xl font-bold font-mono tabular-nums text-brand-primary text-center focus:border-brand-primary focus:outline-none transition-colors placeholder:text-text-muted/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={currentKnowledge || ""}
                placeholder="0"
                onChange={(e) =>
                  onKnowledgeChange(Math.max(0, parseInt(e.target.value) || 0))
                }
              />
              {currentKnowledge > 0 && (
                <button
                  type="button"
                  onClick={() => onKnowledgeChange(0)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:opacity-100 opacity-60 hover:opacity-100"
                  aria-label="Clear bank"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Right: + Loss (inner), + Win (outer) — both green */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                aria-label={`Add win reward (${winReward})`}
                title={`+Win (+${winReward})`}
                onClick={() => onKnowledgeChange(currentKnowledge + winReward)}
                className="flex-1 w-12 rounded border border-status-success/30 bg-status-success/5 text-status-success hover:bg-status-success/15 transition-colors text-xs font-bold flex flex-col items-center justify-center gap-0.5 py-1"
              >
                <span className="text-sm font-bold leading-none">
                  +{winReward}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Add loss reward (${lossReward})`}
                title={`+Loss (+${lossReward})`}
                onClick={() => onKnowledgeChange(currentKnowledge + lossReward)}
                className="flex-1 w-12 rounded border border-status-success/30 bg-status-success/5 text-status-success hover:bg-status-success/15 transition-colors text-xs font-bold flex flex-col items-center justify-center gap-0.5 py-1"
              >
                <span className="text-sm font-bold leading-none">
                  +{lossReward}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-border-subtle" />

      {/* ── Forecast Settings ── */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          Forecast Settings
        </h2>

        {/* Matches Per Day */}
        <div className="bg-surface-dim border border-border-subtle rounded-md px-3 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Swords size={13} className="text-text-muted" />
            <Label
              htmlFor="matches-per-day"
              className="text-sm font-medium text-text-secondary"
            >
              Matches Per Day
            </Label>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              aria-label="Decrease Matches Per Day"
              className="w-9 h-9 rounded border border-border-default bg-surface-base text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors text-base font-bold disabled:opacity-30"
              disabled={gamesPerDay <= 0}
              onClick={() => onGamesPerDayChange(Math.max(0, gamesPerDay - 1))}
            >
              −
            </button>
            <input
              id="matches-per-day"
              type="number"
              min={0}
              aria-label="Matches Per Day"
              className="w-12 bg-surface-base border border-border-default rounded px-2 py-1 text-center text-sm font-mono tabular-nums text-text-primary focus:border-brand-primary focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={gamesPerDay}
              onChange={(e) =>
                onGamesPerDayChange(Math.max(0, parseInt(e.target.value) || 0))
              }
            />
            <button
              type="button"
              aria-label="Increase Matches Per Day"
              className="w-9 h-9 rounded border border-border-default bg-surface-base text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors text-base font-bold"
              onClick={() => onGamesPerDayChange(gamesPerDay + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Win Rate Slider */}
        <div className="bg-surface-dim border border-border-subtle rounded-md px-3 py-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={13} className="text-text-muted" />
              <Label
                htmlFor="win-rate-slider"
                className="text-sm font-medium text-text-secondary"
              >
                Expected Win Rate
              </Label>
            </div>
            <span className="text-sm font-mono tabular-nums text-brand-primary font-bold">
              {Math.round(winRate * 100)}%
            </span>
          </div>
          <input
            id="win-rate-slider"
            type="range"
            aria-label="Expected Win Rate"
            min="0"
            max="100"
            step="1"
            className="w-full accent-brand-primary"
            value={winRate * 100}
            onChange={(e) => onWinRateChange(parseInt(e.target.value) / 100)}
          />
          <div className="flex justify-between text-[10px] text-text-muted font-mono">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Avg Match Duration */}
        <div className="bg-surface-dim border border-border-subtle rounded-md px-3 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-text-muted" />
            <Label
              htmlFor="match-duration"
              className="text-sm font-medium text-text-secondary"
            >
              Avg Match Duration
            </Label>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              aria-label="Decrease Avg Match Duration"
              className="w-9 h-9 rounded border border-border-default bg-surface-base text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors text-base font-bold disabled:opacity-30"
              disabled={matchDuration <= 1}
              onClick={() =>
                onMatchDurationChange(Math.max(1, matchDuration - 1))
              }
            >
              −
            </button>
            <input
              id="match-duration"
              type="number"
              min={1}
              aria-label="Avg Match Duration"
              className="w-12 bg-surface-base border border-border-default rounded px-2 py-1 text-center text-sm font-mono tabular-nums text-text-primary focus:border-brand-primary focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={matchDuration}
              onChange={(e) =>
                onMatchDurationChange(
                  Math.max(1, parseInt(e.target.value) || 1)
                )
              }
            />
            <button
              type="button"
              aria-label="Increase Avg Match Duration"
              className="w-9 h-9 rounded border border-border-default bg-surface-base text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors text-base font-bold"
              onClick={() => onMatchDurationChange(matchDuration + 1)}
            >
              +
            </button>
            <span className="text-xs text-text-muted font-medium ml-1 w-6">
              min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
