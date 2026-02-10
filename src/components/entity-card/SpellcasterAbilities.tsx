"use client";

import React from "react";
import { Spellcaster } from "@/types/api";
import { cn } from "@/lib/utils";
import { EntityDisplayItem, EntityCardVariant } from "./types";
import { EntityMechanics } from "./EntityMechanics";

interface SpellcasterAbilitiesProps {
  item: EntityDisplayItem;
  variant?: EntityCardVariant;
}

export function SpellcasterAbilities({ item, variant = "detailed" }: SpellcasterAbilitiesProps) {
  // Only for Spellcasters
  if (!("spellcaster_id" in item)) return null;

  const spellcaster = item as Spellcaster;
  const isCompact = variant === "compact";

  return (
    <div className={cn("space-y-3", !isCompact && "pt-2")}>
      {/* Passives */}
      {spellcaster.abilities.passive.length > 0 && (
        <div className={cn("space-y-1", !isCompact && "space-y-2")}>
          <h3 className={cn("font-bold uppercase text-gray-500 tracking-wider", isCompact ? "text-[10px]" : "text-xs px-1")}>
            Passive
          </h3>
          {spellcaster.abilities.passive.map((p, i) => (
            <div
              key={i}
              className={cn(
                "rounded border border-white/5",
                isCompact 
                  ? "bg-white/5 p-2 text-xs" 
                  : "bg-white/5 hover:bg-white/10 p-3 hover:border-white/10 transition-colors"
              )}
            >
              <span className={cn("font-bold text-brand-secondary block", isCompact ? "mb-0.5" : "mb-1 text-sm")}>
                {p.name}
              </span>
              <span className={cn("text-gray-400 leading-tight", isCompact ? "text-xs" : "text-xs leading-relaxed")}>
                {p.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Active Abilities */}
      <div className={cn("space-y-1", !isCompact && "space-y-2")}>
        <h3 className={cn("font-bold uppercase text-gray-500 tracking-wider", isCompact ? "text-[10px]" : "text-xs px-1")}>
          Abilities
        </h3>
        {[
           { ...spellcaster.abilities.primary, type: 'PRIMARY' as const },
           { ...spellcaster.abilities.defense, type: 'DEFENSE' as const },
           { ...spellcaster.abilities.ultimate, type: 'ULTIMATE' as const },
        ].map((ab, i) => (
          <div
            key={i}
            className={cn(
               "rounded border border-white/5",
               isCompact 
                ? "bg-white/5 p-2" 
                : "bg-white/5 hover:bg-white/10 p-3 hover:border-white/10 transition-colors group"
            )}
          >
            <div className={cn("flex justify-between items-center", isCompact ? "mb-0.5" : "mb-1")}>
              {isCompact ? (
                  <span className="font-bold text-xs text-brand-accent">
                    {ab.name} <span className="opacity-60 text-[10px] font-normal tracking-wide ml-1">{ab.type}</span>
                  </span>
              ) : (
                  <div className="flex items-center gap-2">
                     <span className={cn(
                       "text-[9px] px-1.5 py-0.5 rounded font-bold bg-white/10 text-gray-400 group-hover:text-white transition-colors",
                       ab.type === 'PRIMARY' && "group-hover:bg-brand-primary",
                       ab.type === 'DEFENSE' && "group-hover:bg-brand-accent group-hover:text-brand-dark",
                       ab.type === 'ULTIMATE' && "group-hover:bg-brand-secondary"
                     )}>
                        {ab.type}
                     </span>
                     <span className="font-bold text-sm text-white">
                       {ab.name}
                     </span>
                  </div>
              )}
              
              {ab.cooldown && (
                <span className={cn(
                    "rounded text-gray-500 bg-black/40",
                    isCompact ? "text-[9px] px-1" : "text-[10px] px-1.5 py-0.5 font-mono"
                )}>
                  {ab.cooldown}s
                </span>
              )}
            </div>
            <p className={cn("text-gray-400 leading-tight", isCompact ? "text-[10px]" : "text-xs leading-relaxed group-hover:text-gray-300 transition-colors")}>
              {ab.description}
            </p>

            {/* Mechanics */}
            {"mechanics" in ab && ab.mechanics && (
               <div className={cn("mt-1.5", !isCompact && "mt-2 pt-1 border-t border-white/5")}>
                  <EntityMechanics item={ab} variant="compact" showDescriptions={true} />
               </div>
            )}
            
            {/* Stats */}
            {"stats" in ab && ab.stats && (
                <div className={cn("grid gap-1 pt-1 border-t border-white/5", isCompact ? "mt-1.5 grid-cols-2" : "mt-2 grid-cols-2 gap-1.5")}>
                   {/* Damage (Priority) */}
                   {ab.stats.damage && typeof ab.stats.damage === 'number' && (
                     <div className={cn("flex justify-between items-center bg-black/30 rounded text-gray-500", isCompact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px] border border-white/5")}>
                        <span className={cn("uppercase font-bold tracking-wide text-red-400", isCompact ? "text-[8px]" : "text-[9px]")}>DAMAGE</span>
                        <span className={cn("text-white font-mono", !isCompact && "font-bold")}>{ab.stats.damage}</span>
                     </div>
                   )}

                   {/* Projectiles (Priority) */}
                   {ab.stats.projectiles && typeof ab.stats.projectiles === 'number' && (
                     <div className={cn("flex justify-between items-center bg-black/30 rounded text-gray-500", isCompact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px] border border-white/5")}>
                        <span className={cn("uppercase font-bold tracking-wide", isCompact ? "text-[8px]" : "text-[9px]")}>PROJECTILES</span>
                        <span className={cn("text-white font-mono", !isCompact && "font-bold")}>{ab.stats.projectiles}</span>
                     </div>
                   )}

                   {Object.entries(ab.stats).map(([k, v]) => {
                       if (v === null || v === undefined) return null;
                       if (k === 'damage' || k === 'projectiles') return null; // Already handled
                       
                       let displayValue = String(v);
                       const label = String(k).replace(/_/g, ' ');

                       // Formatting Logic
                       if (k === 'duration' && typeof v === 'number') {
                           displayValue = `${v}s`;
                       } else if (k === 'health' && typeof v === 'number') {
                           displayValue = v.toLocaleString();
                       }

                       return (
                          <div key={k} className={cn("flex justify-between items-center bg-black/30 rounded text-gray-500", isCompact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px] border border-white/5")}>
                             <span className={cn("uppercase font-bold tracking-wide", isCompact ? "text-[8px]" : "text-[9px]")}>{label}</span>
                             <span className={cn("text-white font-mono", !isCompact && "font-bold")}>{displayValue}</span>
                          </div>
                       );
                   })}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
