"use client";


import { Shield, Eye, Sword, ArrowRight } from "lucide-react";
import { Mechanics, UnitMechanics, SpellMechanics } from "@/types/api";
import { cn } from "@/lib/utils";
import { formatTargetName } from "@/services/utils/formatting"; // Still needed for Shield logic if not kept here
import { EntityDisplayItem, EntityCardVariant } from "./types";

// Sub-components
import { DamageModifierList } from "./mechanics/DamageModifierList";
import { AuraList } from "./mechanics/AuraList";
import { SpawnerList } from "./mechanics/SpawnerList";
import { FeaturesList } from "./mechanics/FeaturesList";
import { InitialAttackDisplay } from "./mechanics/InitialAttackDisplay";
import { BonusDamageList } from "./mechanics/BonusDamageList";
import { WaveMechanic } from "./mechanics/WaveMechanic";

// Loose type for display purposes
type UnifiedMechanics = Partial<UnitMechanics & SpellMechanics & Mechanics>;

interface EntityMechanicsProps {
  item: { mechanics?: Mechanics } | EntityDisplayItem;
  variant?: EntityCardVariant;
  showDescriptions?: boolean;
}

export function EntityMechanics({ item, variant = "detailed", showDescriptions }: EntityMechanicsProps) {
  // Mechanics only exist on Unit or Spell or Ability (legacy)
  const mechanics = "mechanics" in item ? (item.mechanics as UnifiedMechanics) : undefined;

  if (!mechanics) return null;

  const hasMechanics = 
    mechanics.pierce ||
    mechanics.stealth ||
    mechanics.cleave ||
    (mechanics.damage_modifiers && mechanics.damage_modifiers.length > 0) ||
    (mechanics.damage_reduction?.length ?? 0) > 0 ||
    (mechanics.aura?.length ?? 0) > 0 ||
    (mechanics.spawner?.length ?? 0) > 0 ||
    (mechanics.features?.length ?? 0) > 0 ||
    !!mechanics.initial_attack ||
    (mechanics.bonus_damage?.length ?? 0) > 0 ||
    (mechanics.waves || mechanics.interval);

  if (!hasMechanics) return null;

  const isCompact = variant === "compact";
  const shouldShowDescription = showDescriptions ?? !isCompact;

  return (
    <div className={cn("space-y-2", !isCompact && "pt-2")}>
      {!isCompact && (
        <h3 className="text-xs font-bold text-text-dimmed uppercase tracking-widest px-1">
          Mechanics
        </h3>
      )}

      {/* Pierce Mechanic */}
      {mechanics.pierce && (
        <div className={cn("flex items-center gap-1.5 rounded bg-status-info-muted border border-status-info-border p-2 text-status-info-text")}>
            <ArrowRight size={isCompact ? 13 : 16} className="text-status-info-text shrink-0" />
            <span className={cn("font-bold", isCompact ? "text-xs" : "text-sm")}>Target Pierce</span>
        </div>
      )}

      {/* Stealth Mechanic */}
      {mechanics.stealth && (
        <div className={cn("flex items-center gap-1.5 rounded bg-surface-dim border border-border-default p-2 text-text-secondary")}>
            <Eye size={isCompact ? 13 : 16} className="text-text-muted shrink-0" />
            <div className="flex flex-col">
                <span className={cn("font-bold", isCompact ? "text-xs" : "text-sm")}>Stealth</span>
                {shouldShowDescription && (
                    <span className="text-[10px] italic opacity-70">
                        {mechanics.stealth.duration === -1 ? "Infinite" : `${mechanics.stealth.duration}s`} duration
                        {mechanics.stealth.break_on_attack && ", breaks on attack"}
                    </span>
                )}
            </div>
        </div>
      )}

      {/* Cleave Mechanic */}
      {mechanics.cleave && (
        <div className={cn("flex items-center gap-1.5 rounded bg-status-danger-muted border border-status-danger-border p-2 text-status-danger-text")}>
            <Sword size={isCompact ? 13 : 16} className="text-status-danger-text/80 shrink-0 rotate-90" />
            <div className="flex flex-col">
                <span className={cn("font-bold", isCompact ? "text-xs" : "text-sm")}>Cleave</span>
                {shouldShowDescription && typeof mechanics.cleave === 'object' && (
                    <span className="text-[10px] italic opacity-70">
                        {mechanics.cleave.arc}° Cone, {mechanics.cleave.radius}m Radius ({Math.max(0, Math.min(1, 1 - mechanics.cleave.damage_dropoff)) * 100}% Dmg at edge)
                    </span>
                )}
            </div>
        </div>
      )}

       {/* Damage Modifiers */}
       <DamageModifierList 
        modifiers={(() => {
            const modifiers = mechanics.damage_modifiers || [];
            
            // Create a map of targets to values from Bonus Damage to detect duplicates
            // Key: target_type, Value: Set of values (e.g. 1.3)
            const bonusMap = new Map<string, Set<number>>();
            
            mechanics.bonus_damage?.forEach(bd => {
                const add = (t: string) => {
                    if (!bonusMap.has(t)) bonusMap.set(t, new Set());
                    bonusMap.get(t)?.add(bd.value);
                };
                
                if (bd.target_types) bd.target_types.forEach(t => add(t));
                if (bd.target_type) add(bd.target_type);
            });

            // Filter out modifiers that are exact duplicates of bonus damage (same target + same value)
            return modifiers.filter(mod => {
                 const targets = mod.target_types || (mod.target_type ? (Array.isArray(mod.target_type) ? mod.target_type : [mod.target_type]) : []);
                 
                 // If EVERY target of this modifier has a matching value in bonus damage, we consider it a duplicate/legacy field
                 const allTargetsDuplicated = targets.every(t => {
                     const bonusValues = bonusMap.get(t);
                     // Check if this modifier's multiplier matches a bonus value (approximate float equality)
                     return bonusValues && Array.from(bonusValues).some(v => Math.abs(v - mod.multiplier) < 0.001);
                 });

                 return !allTargetsDuplicated;
            });
        })()} 
        isCompact={isCompact} 
      />

      {mechanics.damage_reduction?.map((mod, i) => (
        <div
          key={`res-${i}`}
          className={cn(
            "flex items-center gap-1.5 rounded",
            isCompact 
                ? "bg-status-success-muted border border-status-success-border p-1" 
                : "bg-status-success-muted border border-status-success-border p-3 gap-3 transition-colors hover:bg-status-success-border"
          )}
        >
          <Shield size={isCompact ? 13 : 16} className="text-status-success-text shrink-0" />
          <div className="flex flex-col">
            <span className={cn("text-status-success-text font-bold leading-tight", isCompact ? "text-xs md:text-sm" : "text-sm")}>
              {((1 - mod.multiplier) * 100).toFixed(1).replace(/\.0$/, "")}% Resistance vs <span className="text-text-primary">{formatTargetName(mod.source_type)}</span>
            </span>
            {mod.condition && (
                <span className={cn("text-green-300/50 italic leading-none", isCompact ? "text-[9px] md:text-[10px]" : "text-xs")}>
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
      ))}

      {/* Auras */}
      <AuraList 
        auras={mechanics.aura} 
        isCompact={isCompact} 
        showDescriptions={shouldShowDescription}
      />

      {/* Spawners */}
      <SpawnerList 
        spawners={mechanics.spawner} 
        isCompact={isCompact} 
      />

      {/* Features */}
      <FeaturesList 
        features={mechanics.features} 
        isCompact={isCompact} 
        showDescriptions={shouldShowDescription}
      />

      {/* Initial Attack */}
      <InitialAttackDisplay 
        initialAttack={mechanics.initial_attack} 
        isCompact={isCompact} 
        showDescriptions={shouldShowDescription}
      />

      {/* Bonus Damage */}
      <BonusDamageList 
        bonusDamage={mechanics.bonus_damage} 
        isCompact={isCompact} 
      />

      {/* Waves / Interval */}
      <WaveMechanic 
        waves={mechanics.waves} 
        interval={mechanics.interval} 
        isCompact={isCompact} 
      />
    </div>
  );
}
