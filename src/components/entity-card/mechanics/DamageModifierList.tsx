"use client";


import { Sword } from "lucide-react";
import { DamageModifier } from "@/types/api";
import { cn } from "@/lib/utils";
import { formatTargetName } from "@/services/utils/formatting";

interface DamageModifierListProps {
  modifiers?: DamageModifier[];
  isCompact?: boolean;
}

export function DamageModifierList({ modifiers, isCompact }: DamageModifierListProps) {
  if (!modifiers || modifiers.length === 0) return null;

  // Strict Array Support
  return (
    <>
      {modifiers.map((mod, i) => {
        const isBonus = mod.multiplier >= 1;
        return (
          <div
            key={`dmg-${i}`}
            className={cn(
              "flex items-center gap-1.5 rounded",
              isCompact
                ? (isBonus ? "bg-green-500/10 border border-green-500/20 p-1" : "bg-red-500/10 border border-red-500/20 p-1")
                : (isBonus ? "bg-green-500/10 border border-green-500/20 p-3 gap-3 hover:bg-green-500/20" : "bg-red-500/10 border border-red-500/20 p-3 gap-3 hover:bg-red-500/20") + " transition-colors"
            )}
          >
            <Sword size={isCompact ? 13 : 16} className={cn("shrink-0", isBonus ? "text-green-400" : "text-red-400")} />
            <div className="flex flex-col">
              <span className={cn("font-bold leading-tight", isCompact ? "text-xs" : "text-sm", isBonus ? "text-green-200" : "text-red-200")}>
                {(mod.multiplier > 1 ? "+" : "") + ((mod.multiplier - 1) * 100).toFixed(1).replace(/\.0$/, "")}% Damage vs <span className="text-white">
                  {(() => {
                    // Handle V2 target_types (plural) or Legacy target_type (singular or array)
                    const targets = mod.target_types || mod.target_type;
                    
                    if (Array.isArray(targets)) {
                      return targets.map(formatTargetName).join(", ");
                    }
                    
                    return formatTargetName(targets || "Target");
                  })()}
                </span>
              </span>
              {mod.condition && (
                <span className={cn("italic leading-none", isCompact ? "text-[9px]" : "text-xs", isBonus ? "text-green-300/50" : "text-red-300/50")}>
                  {typeof mod.condition === 'string'
                    ? mod.condition
                    : (isCompact
                        ? `${mod.condition.field} ${mod.condition.operator} ${mod.condition.value}`
                        : `Condition: ${mod.condition.field} ${mod.condition.operator} ${mod.condition.value}`
                      )
                  }
                </span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
