"use client";

import { Target } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatTargetName } from "@/services/utils/formatting";
import { InitialAttack } from "@/types/api";

interface InitialAttackDisplayProps {
  initialAttack?: InitialAttack;
  isCompact?: boolean;
  showDescriptions?: boolean;
}

export function InitialAttackDisplay({
  initialAttack,
  isCompact,
  showDescriptions,
}: InitialAttackDisplayProps) {
  if (!initialAttack) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded",
        isCompact
          ? "bg-orange-500/10 border border-orange-500/20 p-1"
          : "bg-orange-500/10 border border-orange-500/20 p-3 gap-3 transition-colors hover:bg-orange-500/20"
      )}
    >
      <Target size={isCompact ? 13 : 16} className="text-orange-400 shrink-0" />
      <div className="flex flex-col">
        <span
          className={cn(
            "text-orange-200 font-bold leading-tight",
            isCompact ? "text-xs" : "text-sm"
          )}
        >
          +{initialAttack.damage_flat} Initial Dmg vs{" "}
          <span className="text-text-primary">
            {initialAttack.target_types.map(formatTargetName).join(", ")}
          </span>
        </span>
        {showDescriptions && initialAttack.description && (
          <span className={cn("text-orange-300/70 text-[10px] italic")}>
            {initialAttack.description}
          </span>
        )}
      </div>
    </div>
  );
}
