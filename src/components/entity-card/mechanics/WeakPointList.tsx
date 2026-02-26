"use client";

import { Crosshair } from "lucide-react";

import { cn } from "@/lib/utils";
import { WeakPoint } from "@/types/api";

interface WeakPointListProps {
  weakPoints?: WeakPoint[];
  isCompact?: boolean;
  showDescriptions?: boolean;
}

function formatLocation(location: string): string {
  return location.charAt(0).toUpperCase() + location.slice(1);
}

function formatMultiplier(multiplier: number): string {
  const pct = ((multiplier - 1) * 100).toFixed(0);
  return `+${pct}%`;
}

export function WeakPointList({
  weakPoints,
  isCompact,
  showDescriptions,
}: WeakPointListProps) {
  if (!weakPoints || weakPoints.length === 0) return null;

  return (
    <>
      {weakPoints.map((wp, i) => (
        <div
          key={`wp-${i}`}
          className={cn(
            "flex items-center gap-1.5 rounded",
            isCompact
              ? "bg-rose-500/10 border border-rose-500/20 p-1"
              : "bg-rose-500/10 border border-rose-500/20 p-3 gap-3 transition-colors hover:bg-rose-500/20"
          )}
        >
          <Crosshair
            size={isCompact ? 13 : 16}
            className="text-rose-400 shrink-0"
          />
          <div className="flex flex-col">
            <span
              className={cn(
                "text-rose-200 font-bold leading-tight",
                isCompact ? "text-xs" : "text-sm"
              )}
            >
              {formatMultiplier(wp.multiplier)} Damage —{" "}
              <span className="text-text-primary">
                {formatLocation(wp.location)}
              </span>
            </span>
            {showDescriptions && wp.description && (
              <span className="text-rose-300/70 text-[10px] italic">
                {wp.description}
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
