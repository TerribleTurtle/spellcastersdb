"use client";

import React from "react";
import {
  Wifi, // Aura
  Ghost, // Spawner
  Sword, // Damage Modifiers
  Shield, // Damage Reduction
  Zap, // Features
  Activity, // Waves
  Target, // Initial Attack
} from "lucide-react";
import { Mechanics } from "@/types/api";
import { cn, formatEntityName } from "@/lib/utils";
import { EntityDisplayItem, EntityCardVariant } from "./types";

interface EntityMechanicsProps {
  item: { mechanics?: Mechanics } | EntityDisplayItem;
  variant?: EntityCardVariant;
  showDescriptions?: boolean;
}

const PLURAL_TARGETS: Record<string, string> = {
  "Creature": "Creatures",
  "Building": "Buildings",
  "Spellcaster": "Spellcasters",
  "Lifestone": "Lifestones",
  "Flying": "Flying",
  "Hover": "Hovering",
  "Ground": "Ground",
  "Ally": "Allies",
  "Enemy": "Enemies",
  "All": "Everything",
};

function formatTargetName(target: string): string {
  const formatted = formatEntityName(target);
  return PLURAL_TARGETS[formatted] || formatted;
}

export function EntityMechanics({ item, variant = "detailed", showDescriptions }: EntityMechanicsProps) {
  // Mechanics only exist on Unit or Spell
  const mechanics = "mechanics" in item ? (item as { mechanics?: Mechanics }).mechanics : undefined;

  if (!mechanics) return null;

  const hasMechanics = 
    (mechanics.damage_modifiers?.length ?? 0) > 0 ||
    (mechanics.damage_reduction?.length ?? 0) > 0 ||
    (mechanics.aura?.length ?? 0) > 0 ||
    (mechanics.spawner?.length ?? 0) > 0 ||
    (mechanics.features?.length ?? 0) > 0 ||
    !!mechanics.initial_attack ||
    (mechanics.waves || mechanics.interval);

  if (!hasMechanics) return null;

  const isCompact = variant === "compact";
  const shouldShowDescription = showDescriptions ?? !isCompact;

  return (
    <div className={cn("space-y-2", !isCompact && "pt-2")}>
      {!isCompact && (
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
          Mechanics
        </h3>
      )}

      {/* Damage Modifiers */}
      {mechanics.damage_modifiers?.map((mod, i) => {
        const isBonus = mod.multiplier >= 1;
        return (
            <div
            key={`dmg-${i}`}
            className={cn(
                "flex items-center gap-2 rounded",
                isCompact 
                    ? (isBonus ? "bg-green-500/10 border border-green-500/20 p-2" : "bg-red-500/10 border border-red-500/20 p-2")
                    : (isBonus ? "bg-green-500/10 border border-green-500/20 p-3 gap-3 hover:bg-green-500/20" : "bg-red-500/10 border border-red-500/20 p-3 gap-3 hover:bg-red-500/20") + " transition-colors"
            )}
            >
            <Sword size={isCompact ? 14 : 16} className={cn("shrink-0", isBonus ? "text-green-400" : "text-red-400")} />
            <div className="flex flex-col">
                <span className={cn("font-bold", isCompact ? "text-xs" : "text-sm", isBonus ? "text-green-200" : "text-red-200")}>
                {(mod.multiplier > 1 ? "+" : "") + ((mod.multiplier - 1) * 100).toFixed(1).replace(/\.0$/, "")}% Damage vs <span className="text-white">
                  {Array.isArray(mod.target_type) 
                    ? mod.target_type.map(formatTargetName).join(", ") 
                    : formatTargetName(mod.target_type)}
                </span>
                </span>
                {mod.condition && (
                    <span className={cn("italic leading-none", isCompact ? "text-[10px]" : "text-xs", isBonus ? "text-green-300/50" : "text-red-300/50")}>
                        {isCompact ? mod.condition : `Condition: ${mod.condition}`}
                    </span>
                )}
            </div>
            </div>
        );
      })}

      {/* Damage Reduction */}
      {mechanics.damage_reduction?.map((mod, i) => (
        <div
          key={`res-${i}`}
          className={cn(
            "flex items-center gap-2 rounded",
            isCompact 
                ? "bg-green-500/10 border border-green-500/20 p-2" 
                : "bg-green-500/10 border border-green-500/20 p-3 gap-3 transition-colors hover:bg-green-500/20"
          )}
        >
          <Shield size={isCompact ? 14 : 16} className="text-green-400 shrink-0" />
          <div className="flex flex-col">
            <span className={cn("text-green-200 font-bold", isCompact ? "text-xs" : "text-sm")}>
              {((1 - mod.multiplier) * 100).toFixed(1).replace(/\.0$/, "")}% Resistance vs <span className="text-white">{formatTargetName(mod.source_type)}</span>
            </span>
            {mod.condition && (
                <span className={cn("text-green-300/50 italic leading-none", isCompact ? "text-[10px]" : "text-xs")}>
                     {isCompact ? mod.condition : `Condition: ${mod.condition}`}
                </span>
            )}
          </div>
        </div>
      ))}

      {/* Aura (Array) */}
      {mechanics.aura?.map((aura, i) => (
        <div 
            key={`aura-${i}`} 
            className={cn(
                "flex items-center gap-2 rounded",
                 isCompact 
                    ? "bg-blue-500/10 border border-blue-500/20 p-2" 
                    : "bg-blue-500/10 border border-blue-500/20 p-3 gap-3 transition-colors hover:bg-blue-500/20"
            )}
        >
           <Wifi size={isCompact ? 14 : 16} className="text-blue-400 shrink-0" />
           <div className="flex flex-col">
              <span className={cn("text-blue-200 font-bold", isCompact ? "text-xs" : "text-sm")}>
                {aura.name || "Aura"}: <span className="text-white text-base">{aura.value}</span> ({aura.effect || "Effect"})
                {!isCompact && ` / ${aura.interval}s`}
              </span>
              <span className={cn("text-blue-300/70", isCompact ? "text-[10px] leading-tight" : "text-xs")}>
                Target: {formatTargetName(aura.target_type)} • Radius: {aura.radius}m {isCompact && `• Interval: ${aura.interval}s`}
              </span>
              {shouldShowDescription && aura.description && (
                 <span className="text-xs text-blue-300/50 italic mt-0.5">
                    {aura.description}
                 </span>
              )}
           </div>
        </div>
      ))}

      {/* Spawner (Array) */}
      {mechanics.spawner?.map((spawn, i) => (
         <div 
            key={`spawn-${i}`} 
            className={cn(
                "flex items-center gap-2 rounded",
                 isCompact 
                    ? "bg-purple-500/10 border border-purple-500/20 p-2" 
                    : "bg-purple-500/10 border border-purple-500/20 p-3 gap-3 transition-colors hover:bg-purple-500/20"
            )}
        >
            <Ghost size={isCompact ? 14 : 16} className="text-purple-400 shrink-0" />
            <div className="flex flex-col">
               <span className={cn("text-purple-200 font-bold", isCompact ? "text-xs" : "text-sm")}>
                 Spawns {spawn.count}x {formatEntityName(spawn.unit_id)}
               </span>
               <span className={cn("text-purple-300/70", isCompact ? "text-[10px] leading-tight" : "text-xs")}>
                 Trigger: {spawn.trigger} {spawn.interval ? (isCompact ? `@ ${spawn.interval}s` : `every ${spawn.interval}s`) : ""}
               </span>
            </div>
         </div>
      ))}

      {/* Features (Array of Objects) */}
      {mechanics.features?.map((feature, i) => (
         <div 
            key={`feat-${i}`} 
            className={cn(
                "flex items-center gap-2 rounded",
                 isCompact 
                    ? "bg-amber-500/10 border border-amber-500/20 p-2" 
                    : "bg-amber-500/10 border border-amber-500/20 p-3 gap-3 transition-colors hover:bg-amber-500/20"
            )}
        >
            <Zap size={isCompact ? 14 : 16} className="text-amber-400 shrink-0" />
            <div className="flex flex-col">
               <span className={cn("text-amber-200 font-bold", isCompact ? "text-xs" : "text-sm")}>
                 {feature.name}
               </span>
               {shouldShowDescription && feature.description && (
                   <span className="text-amber-300/70 text-xs">
                     {feature.description}
                   </span>
               )}
            </div>
         </div>
      ))}

      {/* Initial Attack */}
      {mechanics.initial_attack && (
        <div
          className={cn(
            "flex items-center gap-2 rounded",
            isCompact
                ? "bg-orange-500/10 border border-orange-500/20 p-2"
                : "bg-orange-500/10 border border-orange-500/20 p-3 gap-3 transition-colors hover:bg-orange-500/20"
          )}
        >
           <Target size={isCompact ? 14 : 16} className="text-orange-400 shrink-0" />
           <div className="flex flex-col">
              <span className={cn("text-orange-200 font-bold", isCompact ? "text-xs" : "text-sm")}>
                +{mechanics.initial_attack.damage_flat} Initial Dmg vs{" "}
                <span className="text-white">
                  {mechanics.initial_attack.target_types.map(formatTargetName).join(", ")}
                </span>
              </span>
              {shouldShowDescription && mechanics.initial_attack.description && (
                 <span className={cn("text-orange-300/70 text-xs italic")}>
                    {mechanics.initial_attack.description}
                 </span>
              )}
           </div>
        </div>
      )}

      {/* Waves / Interval */}
      {(mechanics.waves || mechanics.interval) && (
        <div 
          className={cn(
            "flex items-center gap-2 rounded",
             isCompact 
                ? "bg-sky-500/10 border border-sky-500/20 p-2" 
                : "bg-sky-500/10 border border-sky-500/20 p-3 gap-3 transition-colors hover:bg-sky-500/20"
          )}
        >
           <Activity size={isCompact ? 14 : 16} className="text-sky-400 shrink-0" />
           <div className="flex flex-col">
              <span className={cn("text-sky-200 font-bold", isCompact ? "text-xs" : "text-sm")}>
                {mechanics.waves ? `${mechanics.waves} Waves` : "Periodic Effect"}
              </span>
              {mechanics.interval && (
                <span className={cn("text-sky-300/70", isCompact ? "text-[10px] leading-tight" : "text-xs")}>
                    Interval: {mechanics.interval}s
                </span>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
