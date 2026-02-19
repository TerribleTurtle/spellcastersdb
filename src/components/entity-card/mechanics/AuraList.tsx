"use client";


import { Wifi } from "lucide-react";
import { Aura } from "@/types/api";
import { cn } from "@/lib/utils";
import { formatTargetName } from "@/services/utils/formatting";

interface AuraListProps {
  auras?: Aura[];
  isCompact?: boolean;
  showDescriptions?: boolean;
}

export function AuraList({ auras, isCompact, showDescriptions }: AuraListProps) {
  if (!auras || auras.length === 0) return null;

  return (
    <>
      {auras.map((aura, i) => (
        <div
          key={`aura-${i}`}
          className={cn(
            "flex items-center gap-1.5 rounded",
            isCompact
              ? "bg-status-info-muted border border-status-info-border p-1"
              : "bg-status-info-muted border border-status-info-border p-3 gap-3 transition-colors hover:bg-status-info-border"
          )}
        >
          <Wifi size={isCompact ? 13 : 16} className="text-status-info-text shrink-0" />
          <div className="flex flex-col">
            <span className={cn("text-blue-200 font-bold leading-tight", isCompact ? "text-xs" : "text-sm")}>
              {aura.name || "Aura"}: <span className="text-text-primary text-base">{aura.value}</span> ({aura.effect || "Effect"})
              {!isCompact && ` / ${aura.interval}s`}
            </span>
            <span className={cn("text-blue-300/70", isCompact ? "text-[9px] leading-tight" : "text-xs")}>
              Target: {aura.target_type ? formatTargetName(aura.target_type) : (aura.target_types?.map(formatTargetName).join(", ") || "Unknown")} • Radius: {aura.radius}m {isCompact && `• Interval: ${aura.interval}s`}
            </span>
            {showDescriptions && aura.description && (
              <span className="text-xs text-blue-300/50 italic mt-0.5">
                {aura.description}
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
