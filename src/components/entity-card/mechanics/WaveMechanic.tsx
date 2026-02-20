"use client";

import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";

interface WaveMechanicProps {
  waves?: number;
  interval?: number;
  isCompact?: boolean;
}

export function WaveMechanic({
  waves,
  interval,
  isCompact,
}: WaveMechanicProps) {
  if (!waves && !interval) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded",
        isCompact
          ? "bg-sky-500/10 border border-sky-500/20 p-1"
          : "bg-sky-500/10 border border-sky-500/20 p-3 gap-3 transition-colors hover:bg-sky-500/20"
      )}
    >
      <Activity size={isCompact ? 13 : 16} className="text-sky-400 shrink-0" />
      <div className="flex flex-col">
        <span
          className={cn(
            "text-sky-200 font-bold leading-tight",
            isCompact ? "text-xs" : "text-sm"
          )}
        >
          {waves ? `${waves} Waves` : "Periodic Effect"}
        </span>
        {interval && (
          <span
            className={cn(
              "text-sky-300/70",
              isCompact ? "text-[10px] leading-tight" : "text-xs"
            )}
          >
            Interval: {interval}s
          </span>
        )}
      </div>
    </div>
  );
}
