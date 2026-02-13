import React from "react";
import {
  Clock,
  Heart,
  Swords,
  Users,
  Zap,
  Wind,
  Activity,
} from "lucide-react";
import { Spell, Titan } from "@/types/api";
import { EntityDisplayItem } from "./types";
import { getDamageDisplay } from "./utils";

// --- Types ---

export interface StatDefinition {
  id: string;
  label: string;
  getValue: (item: EntityDisplayItem) => string | number | undefined;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  colorClass: string;
  // Optional condition to verify if this specific stat should show for this item
  // (beyond just being in the strategy list)
  condition?: (item: EntityDisplayItem) => boolean;
}

export type EntityCategory = "Unit" | "Spell" | "Titan" | "Spellcaster";

// --- Helper Predicates ---

const isTitan = (item: EntityDisplayItem): item is Titan => 
  (item as Titan).category === "Titan";

const isSpell = (item: EntityDisplayItem): item is Spell => 
  (item as Spell).category === "Spell";

const hasProperty = <K extends string>(item: unknown, key: K): item is Record<K, unknown> => {
    return typeof item === 'object' && item !== null && key in item;
};

// --- Stat Definitions ---

export const STATS: Record<string, StatDefinition> = {
  health: {
    id: "health",
    label: "Health",
    getValue: (item) => (hasProperty(item, "health") ? (item.health as number) : undefined),
    icon: Heart,
    colorClass: "text-green-500",
  },
  passive_health_regen: {
    id: "passive_health_regen",
    label: "Health/Sec",
    getValue: (item) => (isTitan(item) ? item.passive_health_regen : undefined),
    icon: Activity,
    colorClass: "text-emerald-400",
    condition: (item) => isTitan(item) && !!item.passive_health_regen,
  },
  heal_amount_titan: { // specific logic for Titan heal vs Spell heal if needed, or shared
    id: "heal_amount_titan",
    label: "Heal",
    getValue: (item) => (isTitan(item) ? item.heal_amount : undefined),
    icon: Activity,
    colorClass: "text-emerald-400",
    condition: (item) => isTitan(item) && !!item.heal_amount,
  },
  damage: {
    id: "damage",
    label: "Damage",
    getValue: (item) => getDamageDisplay(item),
    icon: Swords,
    colorClass: "text-red-400",
    condition: (item) => hasProperty(item, "damage") && !!item.damage,
  },
  dps: {
    id: "dps",
    label: "DPS",
    getValue: (item) => (hasProperty(item, "dps") ? (item.dps as number) : undefined),
    icon: Swords,
    colorClass: "text-orange-500",
    condition: (item) => hasProperty(item, "dps") && (item.dps as number) !== undefined,
  },
  attack_speed: {
    id: "attack_speed",
    label: "Atk Speed",
    // Unified access for attack_speed or attack_interval
    getValue: (item) => {
        if (hasProperty(item, "attack_interval")) return `${item.attack_interval}s`;
        if (hasProperty(item, "attack_speed")) return `${item.attack_speed}s`;
        return "0s";
    },
    icon: Zap,
    colorClass: "text-yellow-400",
    condition: (item) => hasProperty(item, "attack_interval") || hasProperty(item, "attack_speed"),
  },
  range: {
    id: "range",
    label: "Range",
    getValue: (item) => (hasProperty(item, "range") ? (item.range as number) : undefined),
    icon: Users,
    colorClass: "text-blue-400",
    condition: (item) => hasProperty(item, "range") && !!item.range,
  },
  movement_speed: {
    id: "movement_speed",
    label: "Speed",
    getValue: (item) => (hasProperty(item, "movement_speed") ? (item.movement_speed as number) : undefined),
    icon: Clock,
    colorClass: "text-cyan-400",
    condition: (item) => hasProperty(item, "movement_speed") && !!item.movement_speed,
  },
  movement_type: {
    id: "movement_type",
    label: "Move Type",
    getValue: (item) => (hasProperty(item, "movement_type") ? (item.movement_type as string) : undefined),
    icon: Wind,
    colorClass: "text-sky-300",
    condition: (item) => hasProperty(item, "movement_type") && !!item.movement_type,
  },
  // Spell Specific
  heal_amount_spell: {
    id: "heal_amount_spell",
    label: "Heal",
    getValue: (item) => (isSpell(item) ? item.heal_amount : undefined),
    icon: Heart,
    colorClass: "text-green-500",
    condition: (item) => isSpell(item) && !!item.heal_amount,
  },
  duration: {
    id: "duration",
    label: "Duration",
    getValue: (item) => (isSpell(item) ? `${item.duration}s` : undefined),
    icon: Clock,
    colorClass: "text-yellow-400",
    condition: (item) => isSpell(item) && !!item.duration,
  },
  radius: {
    id: "radius",
    label: "Radius",
    getValue: (item) => (isSpell(item) ? item.radius : undefined),
    icon: Users,
    colorClass: "text-blue-400",
    condition: (item) => isSpell(item) && !!item.radius,
  },
  population: {
    id: "population",
    label: "Pop",
    getValue: (item) => (hasProperty(item, "population") ? (item.population as number) : undefined),
    icon: Users,
    colorClass: "text-purple-400",
    condition: (item) => hasProperty(item, "population") && !!item.population,
  },
  charges: {
    id: "charges",
    label: "Charges",
    getValue: (item) => (hasProperty(item, "charges") ? (item.charges as number) : undefined),
    icon: Zap,
    colorClass: "text-yellow-400",
    condition: (item) => hasProperty(item, "charges") && !!item.charges,
  },
  recharge_time: {
    id: "recharge_time",
    label: "Recharge",
    getValue: (item) => (hasProperty(item, "recharge_time") ? `${item.recharge_time}s` : undefined),
    icon: Clock,
    colorClass: "text-blue-300",
    condition: (item) => hasProperty(item, "recharge_time") && !!item.recharge_time,
  },
  max_targets: {
    id: "max_targets",
    label: "Targets",
    getValue: (item) => (isSpell(item) && (item as Spell & { max_targets?: number }).max_targets ? (item as Spell & { max_targets?: number }).max_targets : undefined),
    icon: Users,
    colorClass: "text-purple-400",
    condition: (item) => isSpell(item) && !!(item as Spell & { max_targets?: number }).max_targets,
  },
};

// --- Strategy Map ---

export const STAT_STRATEGIES: Record<EntityCategory, StatDefinition[]> = {
  Unit: [
    STATS.health,
    STATS.damage,
    STATS.dps,
    STATS.attack_speed,
    STATS.range,
    STATS.movement_speed,
    STATS.movement_type,
    STATS.population,
    STATS.charges,
    STATS.recharge_time, 
  ],
  Titan: [
    STATS.health,
    STATS.passive_health_regen,
    STATS.heal_amount_titan,
    STATS.damage,
    STATS.dps,
    STATS.attack_speed,
    STATS.range,
    STATS.movement_speed,
    STATS.movement_type,
  ],
  Spell: [
    STATS.damage,
    STATS.heal_amount_spell, // Spell heal
    STATS.duration,
    STATS.radius,
    STATS.population,
    STATS.charges,
    STATS.recharge_time,
    STATS.max_targets,
  ],
  Spellcaster: [
      STATS.health,
      STATS.movement_speed,
      STATS.population,
  ]
};

export function getStatsStrategy(item: EntityDisplayItem): StatDefinition[] {
    if ("spellcaster_id" in item) return STAT_STRATEGIES.Spellcaster;
    
    // Safer category check
    if (hasProperty(item, "category")) {
        const cat = item.category;
        if (cat === "Titan") return STAT_STRATEGIES.Titan;
        if (cat === "Spell") return STAT_STRATEGIES.Spell;
    }
    
    return STAT_STRATEGIES.Unit; // Default to Unit (Creature/Building)
}
