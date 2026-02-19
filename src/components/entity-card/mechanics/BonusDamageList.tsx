"use client";


import { Flame } from "lucide-react";
import { BonusDamage } from "@/types/api";
import { cn } from "@/lib/utils";
import { formatTargetName } from "@/services/utils/formatting";

interface BonusDamageListProps {
  bonusDamage?: BonusDamage[];
  isCompact?: boolean;
}

function formatBonusValue(bd: BonusDamage): string {
  switch (bd.unit) {
    case "percent_max_hp": {
      const pct = ((bd.value - 1) * 100).toFixed(1).replace(/\.0$/, "");
      return `${pct}% Max HP`;
    }
    case "percent_current_hp": {
      const pct = ((bd.value - 1) * 100).toFixed(1).replace(/\.0$/, "");
      return `${pct}% Current HP`;
    }
    case "flat":
    default:
      return `+${bd.value}`;
  }
}

function formatBonusTargets(bd: BonusDamage): string | null {
  const targets = bd.target_types || (bd.target_type ? [bd.target_type] : null);
  if (!targets || targets.length === 0) return null;
  return targets.map(formatTargetName).join(", ");
}

export function BonusDamageList({ bonusDamage, isCompact }: BonusDamageListProps) {
  if (!bonusDamage || bonusDamage.length === 0) return null;

  return (
    <>
      {bonusDamage.map((bd, i) => {
        const targetLabel = formatBonusTargets(bd);
        return (
          <div
            key={`bonus-${i}`}
            className={cn(
              "flex items-center gap-1.5 rounded",
              isCompact
                ? "bg-amber-500/10 border border-amber-500/20 p-1"
                : "bg-amber-500/10 border border-amber-500/20 p-3 gap-3 transition-colors hover:bg-amber-500/20"
            )}
          >
            <Flame size={isCompact ? 13 : 16} className="text-amber-400 shrink-0" />
            <span className={cn("text-amber-200 font-bold leading-tight", isCompact ? "text-xs" : "text-sm")}>
              {formatBonusValue(bd)} Bonus Dmg
              {targetLabel && (
                <> vs <span className="text-white">{targetLabel}</span></>
              )}
            </span>
          </div>
        );
      })}
    </>
  );
}
