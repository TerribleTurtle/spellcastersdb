"use client";


import { Shield } from "lucide-react";
import { Mechanics, UnitMechanics, SpellMechanics } from "@/types/api";
import { cn } from "@/lib/utils";
import { formatTargetName } from "@/services/formatting"; // Still needed for Shield logic if not kept here
import { EntityDisplayItem, EntityCardVariant } from "./types";

// Sub-components
import { DamageModifierList } from "./mechanics/DamageModifierList";
import { AuraList } from "./mechanics/AuraList";
import { SpawnerList } from "./mechanics/SpawnerList";
import { FeaturesList } from "./mechanics/FeaturesList";
import { InitialAttackDisplay } from "./mechanics/InitialAttackDisplay";
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
    ((mechanics.damage_modifiers && Array.isArray(mechanics.damage_modifiers) && mechanics.damage_modifiers.length > 0) || (typeof mechanics.damage_modifiers === 'string')) ||
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
      <DamageModifierList 
        modifiers={mechanics.damage_modifiers} 
        isCompact={isCompact} 
      />

      {/* Damage Reduction - Keeping inline strictly to show we considered it, or we could extract it to a list too. 
          Given the pattern, let's keep it inline for now as it wasn't explicitly planned for extraction in my list, 
          but for consistency I'll extract it next if I see it fits. 
          For now, preserving original logic for DR.
      */}
      {mechanics.damage_reduction?.map((mod, i) => (
        <div
          key={`res-${i}`}
          className={cn(
            "flex items-center gap-1.5 rounded",
            isCompact 
                ? "bg-green-500/10 border border-green-500/20 p-1" 
                : "bg-green-500/10 border border-green-500/20 p-3 gap-3 transition-colors hover:bg-green-500/20"
          )}
        >
          <Shield size={isCompact ? 13 : 16} className="text-green-400 shrink-0" />
          <div className="flex flex-col">
            <span className={cn("text-green-200 font-bold leading-tight", isCompact ? "text-xs md:text-sm" : "text-sm")}>
              {((1 - mod.multiplier) * 100).toFixed(1).replace(/\.0$/, "")}% Resistance vs <span className="text-white">{formatTargetName(mod.source_type)}</span>
            </span>
            {mod.condition && (
                <span className={cn("text-green-300/50 italic leading-none", isCompact ? "text-[9px] md:text-[10px]" : "text-xs")}>
                     {isCompact 
                        ? (typeof mod.condition === 'string' ? mod.condition : `${mod.condition.field} ${mod.condition.operator} ${mod.condition.value}`)
                        : `Condition: ${typeof mod.condition === 'string' ? mod.condition : `${mod.condition.field} ${mod.condition.operator} ${mod.condition.value}`}`
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

      {/* Waves / Interval */}
      <WaveMechanic 
        waves={mechanics.waves} 
        interval={mechanics.interval} 
        isCompact={isCompact} 
      />
    </div>
  );
}
