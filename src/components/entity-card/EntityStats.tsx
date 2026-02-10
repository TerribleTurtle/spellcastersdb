"use client";

import React from "react";
import {
  Clock,
  Heart,
  Swords,
  Users,
  Zap,
  Wind,
} from "lucide-react";
import { Unit, Spell, Spellcaster, Titan } from "@/types/api";
import { cn } from "@/lib/utils";
import { EntityDisplayItem, EntityCardVariant } from "./types";
import { getDamageDisplay } from "./utils";

interface EntityStatsProps {
  item: EntityDisplayItem;
  variant?: EntityCardVariant;
}

export function EntityStats({ item, variant = "detailed" }: EntityStatsProps) {
  // Type Guard
  const isSpellcaster = "spellcaster_id" in item;
  const isUnit = !isSpellcaster;

  // Safe category access
  const category = isUnit
    ? (item as Unit | Spell | Titan).category
    : "Spellcaster";

  // Grid columns based on variant
  // Compact (Inspector): 2 cols
  // Detailed (Showcase): 3 cols seems to be the pattern in Showcase, but let's stick to responsive grid
  const gridClass = variant === "compact" ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className={cn("grid gap-2", gridClass)}>
      {"health" in item && (
        <StatBox
          label="Health"
          value={item.health}
          icon={<Heart size={variant === "compact" ? 16 : 18} className="text-green-500" />}
          variant={variant}
        />
      )}

      {/* Unit / Titan Stats */}
      {isUnit && category !== "Spell" && "damage" in item && (
        <>
          <StatBox
            label="Damage"
            value={getDamageDisplay(item)}
            icon={<Swords size={variant === "compact" ? 16 : 18} className="text-red-400" />}
            variant={variant}
          />
          {/* Only show attack speed for Units */}
          {"attack_speed" in item && (
            <StatBox
              label="Atk Speed"
              value={`${(item as Unit).attack_speed ?? 0}s`}
              icon={<Zap size={variant === "compact" ? 16 : 18} className="text-yellow-400" />}
              variant={variant}
            />
          )}
          {"range" in item && (item as Unit).range && (
            <StatBox
              label="Range"
              value={(item as Unit).range}
              icon={<Users size={variant === "compact" ? 16 : 18} className="text-blue-400" />}
              variant={variant}
            />
          )}
          {"movement_speed" in item &&
            (item as Unit | Titan).movement_speed && (
              <StatBox
                label="Speed"
                value={(item as Unit | Titan).movement_speed}
                icon={<Clock size={variant === "compact" ? 16 : 18} className="text-cyan-400" />}
                variant={variant}
              />
            )}
          {"movement_type" in item && (item as Unit).movement_type && (
            <StatBox
              label="Move Type"
              value={(item as Unit).movement_type}
              icon={<Wind size={variant === "compact" ? 16 : 18} className="text-sky-300" />}
              variant={variant}
            />
          )}
        </>
      )}

      {/* Spell Stats */}
      {category === "Spell" && (
        <>
          {"damage" in item && (item as Spell).damage && (
            <StatBox
              label="Damage"
              value={getDamageDisplay(item)}
              icon={<Swords size={variant === "compact" ? 16 : 18} className="text-red-400" />}
              variant={variant}
            />
          )}
          {"duration" in item && (item as Spell).duration && (
            <StatBox
              label="Duration"
              value={`${(item as Spell).duration}s`}
              icon={<Clock size={variant === "compact" ? 16 : 18} className="text-yellow-400" />}
              variant={variant}
            />
          )}
          {"radius" in item && (item as Spell).radius && (
            <StatBox
              label="Radius"
              value={(item as Spell).radius}
              icon={<Users size={variant === "compact" ? 16 : 18} className="text-blue-400" />}
              variant={variant}
            />
          )}
          {"max_targets" in item && (item as Spell).max_targets && (
            <StatBox
              label="Targets"
              value={(item as Spell).max_targets}
              icon={<Users size={variant === "compact" ? 16 : 18} className="text-purple-400" />}
              variant={variant}
            />
          )}
        </>
      )}

      {/* Spellcaster Difficulty */}
      {isSpellcaster && (
         <div className={cn(
             "bg-surface-main border border-white/5 rounded flex flex-col items-center justify-center text-center",
             variant === "compact" ? "p-1.5 col-span-2" : "p-3 col-span-3 bg-surface-main/50"
         )}>
            <div className={cn(
                "uppercase tracking-widest text-gray-500",
                variant === "compact" ? "text-[10px] mb-1" : "text-[10px] mb-2"
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
        variant === "compact" ? "p-1.5" : "p-3 hover:border-white/10 bg-surface-main/50"
    )}>
      <div className={cn(
          variant === "compact" ? "scale-75 opacity-60" : "mb-1 opacity-60 scale-90 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300"
      )}>
          {icon}
      </div>
      <div className={cn(
          "font-bold font-mono text-white leading-tight",
          variant === "compact" ? "text-sm" : "text-base"
      )}>
        {value ?? "-"}
      </div>
      <div className={cn(
          "uppercase tracking-widest text-gray-500",
          variant === "compact" ? "text-[8px]" : "text-[9px] mt-0.5"
      )}>
        {label}
      </div>
    </div>
  );
}
