"use client";


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
          <h3 className={cn("font-bold uppercase text-text-dimmed tracking-wider", isCompact ? "text-[10px] md:text-xs" : "text-xs px-1")}>
            Passive
          </h3>
          {spellcaster.abilities.passive.map((p, i) => (
            <div
              key={i}
              className={cn(
                "rounded border border-border-subtle",
                  isCompact 
                  ? "bg-surface-card p-2 text-xs md:text-sm" 
                  : "bg-surface-card hover:bg-surface-hover p-3 hover:border-border-default transition-colors"
              )}
            >
              <span className={cn("font-bold text-brand-secondary block", isCompact ? "mb-0.5" : "mb-1 text-sm")}>
                {p.name}
              </span>
              <span className={cn("text-text-muted leading-tight", isCompact ? "text-xs" : "text-xs leading-relaxed")}>
                {p.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Active Abilities */}
      <div className={cn("space-y-1", !isCompact && "space-y-2")}>
        <h3 className={cn("font-bold uppercase text-text-dimmed tracking-wider", isCompact ? "text-[10px] md:text-xs" : "text-xs px-1")}>
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
               "rounded border border-border-subtle",
               isCompact 
                ? "bg-surface-card p-2" 
                : "bg-surface-card hover:bg-surface-hover p-3 hover:border-border-default transition-colors group"
            )}
          >
            <div className={cn("flex justify-between items-center", isCompact ? "mb-0.5" : "mb-1")}>
              {isCompact ? (
                  <span className="font-bold text-xs md:text-sm text-brand-accent">
                    {ab.name} <span className="opacity-60 text-[10px] font-normal tracking-wide ml-1">{ab.type}</span>
                  </span>
              ) : (
                  <div className="flex items-center gap-2">
                     <span className={cn(
                       "text-[10px] px-1.5 py-0.5 rounded font-bold bg-surface-hover text-text-muted group-hover:text-text-primary transition-colors",
                       ab.type === 'PRIMARY' && "group-hover:bg-brand-primary",
                       ab.type === 'DEFENSE' && "group-hover:bg-brand-accent group-hover:text-brand-dark",
                       ab.type === 'ULTIMATE' && "group-hover:bg-brand-secondary"
                     )}>
                        {ab.type}
                     </span>
                     <span className="font-bold text-sm text-text-primary">
                       {ab.name}
                     </span>
                  </div>
              )}
              
              {ab.cooldown && (
                <span className={cn(
                    "rounded text-text-dimmed bg-surface-inset",
                    isCompact ? "text-[10px] px-1" : "text-[10px] px-1.5 py-0.5 font-mono"
                )}>
                  {ab.cooldown}s
                </span>
              )}
            </div>
            <p className={cn("text-text-muted leading-tight", isCompact ? "text-[10px] md:text-xs" : "text-xs leading-relaxed group-hover:text-text-secondary transition-colors")}>
              {ab.description}
            </p>

            {/* Mechanics */}
            {"mechanics" in ab && ab.mechanics && (
               <div className={cn("mt-1.5", !isCompact && "mt-2 pt-1 border-t border-border-subtle")}>
                  <EntityMechanics item={ab} variant="compact" showDescriptions={true} />
               </div>
            )}
            
            {/* Stats (Top Level now) */}
             <div className={cn("grid gap-1 pt-1 border-t border-border-subtle", isCompact ? "mt-1.5 grid-cols-2" : "mt-2 grid-cols-2 gap-1.5")}>
                 {/* Cooldown */}
                 {ab.cooldown && (
                   <div className={cn("flex justify-between items-center bg-surface-dim rounded text-text-dimmed", isCompact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[10px] border border-border-subtle")}>
                      <span className={cn("uppercase font-bold tracking-wide", "text-[10px]")}>COOLDOWN</span>
                      <span className={cn("text-text-primary font-mono", !isCompact && "font-bold")}>{ab.cooldown}s</span>
                   </div>
                 )}

                 {/* Damage */}
                 {ab.damage && (
                   <div className={cn("flex justify-between items-center bg-surface-dim rounded text-text-dimmed", isCompact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[10px] border border-border-subtle")}>
                      <span className={cn("uppercase font-bold tracking-wide text-status-danger-text", "text-[10px]")}>DAMAGE</span>
                      <span className={cn("text-text-primary font-mono", !isCompact && "font-bold")}>{ab.damage}</span>
                   </div>
                 )}

                 {/* Projectiles */}
                 {ab.projectiles && (
                   <div className={cn("flex justify-between items-center bg-surface-dim rounded text-text-dimmed", isCompact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[10px] border border-border-subtle")}>
                      <span className={cn("uppercase font-bold tracking-wide", "text-[10px]")}>PROJECTILES</span>
                      <span className={cn("text-text-primary font-mono", !isCompact && "font-bold")}>{ab.projectiles}</span>
                   </div>
                 )}

                 {/* Duration */}
                 {ab.duration && (
                   <div className={cn("flex justify-between items-center bg-surface-dim rounded text-text-dimmed", isCompact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[10px] border border-border-subtle")}>
                      <span className={cn("uppercase font-bold tracking-wide", "text-[10px]")}>DURATION</span>
                      <span className={cn("text-text-primary font-mono", !isCompact && "font-bold")}>{ab.duration}s</span>
                   </div>
                 )}
                 
                 {/* Charges */}
                 {ab.charges && (
                   <div className={cn("flex justify-between items-center bg-surface-dim rounded text-text-dimmed", isCompact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[10px] border border-border-subtle")}>
                      <span className={cn("uppercase font-bold tracking-wide", "text-[10px]")}>CHARGES</span>
                      <span className={cn("text-text-primary font-mono", !isCompact && "font-bold")}>{ab.charges}</span>
                   </div>
                 )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
