"use client";

import React from "react";
import { Spellcaster } from "@/types/api";
import { cn } from "@/lib/utils";
import { EntityDisplayItem, EntityCardVariant } from "./types";
import { getStatsStrategy } from "./stats-strategies";

interface EntityStatsProps {
  item: EntityDisplayItem;
  variant?: EntityCardVariant;
}

export function EntityStats({ item, variant = "detailed" }: EntityStatsProps) {
  const isSpellcaster = "spellcaster_id" in item;
  
  // Strategy Pattern: Get relevant stats configuration
  const strategies = getStatsStrategy(item);

  // Grid columns based on variant
  const gridClass = variant === "compact" ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className={cn("grid gap-2", gridClass)}>
      {/* Dynamic Stat Rendering */}
      {strategies.map((stat) => {
        // 1. Check if stat has a condition function
        if (stat.condition && !stat.condition(item)) return null;
        
        // 2. Get value
        const value = stat.getValue(item);
        if (value === undefined || value === 0 || value === "0s") return null; // Filter empty/zero stats if desirable, matching old logic logic roughly
        // Note: Old logic often checked `!== undefined && !== 0`. 
        
        return (
          <StatBox
            key={stat.id}
            label={stat.label}
            value={value}
            icon={<stat.icon size={variant === "compact" ? 16 : 18} className={stat.colorClass} />}
            variant={variant}
          />
        );
      })}

      {/* Spellcaster Difficulty (Special Case) */}
      {isSpellcaster && (
         <div className={cn(
             "bg-surface-main border border-white/5 rounded flex flex-col items-center justify-center text-center",
             variant === "compact" ? "p-1.5 col-span-2" : "p-3 col-span-3 bg-surface-main/50"
         )}>
            <div className={cn(
                "uppercase tracking-widest text-gray-500",
                variant === "compact" ? "text-[10px] md:text-xs mb-1" : "text-[10px] mb-2"
            )}>
              Difficulty
            </div>
            <div className={cn("flex", variant === "compact" ? "gap-1" : "gap-2")}>
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className={cn(
                      "rounded-full transition-all",
                      variant === "compact" ? "h-2 w-2" : "h-2.5 w-2.5 ring-2 ring-offset-2 ring-offset-surface-card",
                      ((item as Spellcaster).difficulty || 1) >= star
                        ? variant === "compact" ? "bg-brand-primary" : "bg-brand-primary ring-brand-primary/30"
                        : variant === "compact" ? "bg-white/10" : "bg-surface-main ring-white/10"
                  )}
                />
              ))}
            </div>
          </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
  variant,
}: {
  label: string;
  value: string | number | undefined;
  icon: React.ReactNode;
  variant: EntityCardVariant;
}) {
  return (
    <div className={cn(
        "bg-surface-main border border-white/5 rounded flex flex-col items-center justify-center text-center transition-colors group",
        variant === "compact" ? "p-1 min-h-[50px]" : "p-3 hover:border-white/10 bg-surface-main/50"
    )}>
      <div className={cn(
          variant === "compact" ? "scale-75 opacity-60 -mb-1" : "mb-1 opacity-60 scale-90 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300"
      )}>
          {icon}
      </div>
      <div className={cn(
          "font-bold font-mono text-white leading-tight",
          variant === "compact" ? "text-xs md:text-sm" : "text-base md:text-lg"
      )}>
        {value ?? "-"}
      </div>
      <div className={cn(
          "uppercase tracking-widest text-gray-500",
          variant === "compact" ? "text-[10px] md:text-[10px]" : "text-[10px] mt-0.5"
      )}>
        {label}
      </div>
    </div>
  );
}
