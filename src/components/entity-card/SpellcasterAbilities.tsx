"use client";

import { TextWithLinks } from "@/components/common/TextWithLinks";
import { GameImage } from "@/components/ui/GameImage";
import { cn } from "@/lib/utils";
import {
  AbilityImageType,
  getAbilityImageUrl,
} from "@/services/assets/asset-helpers";
import { Spellcaster } from "@/types/api";

import { EntityMechanics } from "./EntityMechanics";
import { EntityCardVariant, EntityDisplayItem } from "./types";

/** Maps UI ability type labels to API image_urls keys */
const ABILITY_TYPE_TO_IMAGE_KEY: Record<string, AbilityImageType> = {
  PRIMARY: "attack",
  DEFENSE: "defense",
  ULTIMATE: "ultimate",
};

interface SpellcasterAbilitiesProps {
  item: EntityDisplayItem;
  variant?: EntityCardVariant;
}

export function SpellcasterAbilities({
  item,
  variant = "detailed",
}: SpellcasterAbilitiesProps) {
  // Only for Spellcasters
  if (!("spellcaster_id" in item)) return null;

  const spellcaster = item as Spellcaster;
  const isCompact = variant === "compact";

  return (
    <div className={cn("space-y-3", !isCompact && "pt-2")}>
      {/* Passives */}
      {spellcaster.abilities.passive.length > 0 && (
        <div className={cn("space-y-1", !isCompact && "space-y-2")}>
          <h3
            className={cn(
              "font-bold uppercase text-text-dimmed tracking-wider",
              isCompact ? "text-[10px] md:text-xs" : "text-xs px-1"
            )}
          >
            Passive
          </h3>
          {spellcaster.abilities.passive.map((p, i) => {
            const passiveImg = getAbilityImageUrl(spellcaster, "passive");
            return (
              <div
                key={i}
                className={cn(
                  "rounded border border-border-subtle",
                  isCompact
                    ? "bg-surface-card p-2 text-xs md:text-sm"
                    : "bg-surface-card hover:bg-surface-hover p-3 hover:border-border-default transition-colors"
                )}
              >
                <div
                  className={cn(
                    "flex items-start gap-3",
                    isCompact ? "mb-0.5" : "mb-1.5"
                  )}
                >
                  {!isCompact && passiveImg && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 hover:scale-105 transition-transform duration-200">
                      <GameImage
                        src={passiveImg}
                        alt={`${p.name} passive`}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span
                      className={cn(
                        "font-bold text-brand-secondary block",
                        isCompact ? "" : "text-sm"
                      )}
                    >
                      {p.name}
                    </span>
                  </div>
                </div>
                <TextWithLinks
                  text={p.description || ""}
                  excludeKeys={[spellcaster.name]}
                  className={cn(
                    "text-text-muted leading-tight",
                    isCompact ? "text-xs" : "text-xs leading-relaxed"
                  )}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Active Abilities */}
      <div className={cn("space-y-1", !isCompact && "space-y-2")}>
        <h3
          className={cn(
            "font-bold uppercase text-text-dimmed tracking-wider",
            isCompact ? "text-[10px] md:text-xs" : "text-xs px-1"
          )}
        >
          Abilities
        </h3>
        {[
          { ...spellcaster.abilities.primary, type: "PRIMARY" as const },
          { ...spellcaster.abilities.defense, type: "DEFENSE" as const },
          { ...spellcaster.abilities.ultimate, type: "ULTIMATE" as const },
        ].map((ab, i) => {
          const imageKey = ABILITY_TYPE_TO_IMAGE_KEY[ab.type];
          const abilityImg = imageKey
            ? getAbilityImageUrl(spellcaster, imageKey)
            : null;
          return (
            <div
              key={i}
              className={cn(
                "rounded border border-border-subtle",
                isCompact
                  ? "bg-surface-card p-2"
                  : "bg-surface-card hover:bg-surface-hover p-3 hover:border-border-default transition-colors group"
              )}
            >
              <div
                className={cn(
                  "flex justify-between items-center",
                  isCompact ? "mb-0.5" : "mb-1"
                )}
              >
                {isCompact ? (
                  <span className="font-bold text-xs md:text-sm text-brand-accent">
                    {ab.name}{" "}
                    <span className="opacity-60 text-[10px] font-normal tracking-wide ml-1">
                      {ab.type}
                    </span>
                  </span>
                ) : (
                  <div className="flex items-start gap-3">
                    {abilityImg && (
                      <div
                        className={cn(
                          "relative w-12 h-12 rounded-lg overflow-hidden shrink-0 hover:scale-105 transition-transform duration-200"
                        )}
                      >
                        <GameImage
                          src={abilityImg}
                          alt={`${ab.name} ${ab.type.toLowerCase()}`}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
                      </div>
                    )}
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-bold bg-surface-hover text-text-muted group-hover:text-text-primary transition-colors",
                        ab.type === "PRIMARY" && "group-hover:bg-brand-primary",
                        ab.type === "DEFENSE" &&
                          "group-hover:bg-brand-accent group-hover:text-brand-dark",
                        ab.type === "ULTIMATE" &&
                          "group-hover:bg-brand-secondary"
                      )}
                    >
                      {ab.type}
                    </span>
                    <span className="font-bold text-sm text-text-primary">
                      {ab.name}
                    </span>
                  </div>
                )}

                {ab.cooldown && (
                  <span
                    className={cn(
                      "rounded text-text-dimmed bg-surface-inset",
                      isCompact
                        ? "text-[10px] px-1"
                        : "text-[10px] px-1.5 py-0.5 font-mono"
                    )}
                  >
                    {ab.cooldown}s
                  </span>
                )}
              </div>
              <TextWithLinks
                text={ab.description || ""}
                excludeKeys={[spellcaster.name]}
                className={cn(
                  "text-text-muted leading-tight",
                  isCompact
                    ? "text-[10px] md:text-xs"
                    : "text-xs leading-relaxed group-hover:text-text-secondary transition-colors"
                )}
              />

              {/* Mechanics */}
              {"mechanics" in ab && ab.mechanics && (
                <div
                  className={cn(
                    "mt-1.5",
                    !isCompact && "mt-2 pt-1 border-t border-border-subtle"
                  )}
                >
                  <EntityMechanics
                    item={ab}
                    variant="compact"
                    showDescriptions={true}
                  />
                </div>
              )}

              {/* Stats (Top Level now) */}
              <div
                className={cn(
                  "grid gap-1 pt-1 border-t border-border-subtle",
                  isCompact ? "mt-1.5 grid-cols-2" : "mt-2 grid-cols-2 gap-1.5"
                )}
              >
                {/* Cooldown */}
                {ab.cooldown && (
                  <div
                    className={cn(
                      "flex justify-between items-center bg-surface-dim rounded text-text-dimmed",
                      isCompact
                        ? "px-1.5 py-0.5 text-[10px]"
                        : "px-2 py-1 text-[10px] border border-border-subtle"
                    )}
                  >
                    <span
                      className={cn(
                        "uppercase font-bold tracking-wide",
                        "text-[10px]"
                      )}
                    >
                      COOLDOWN
                    </span>
                    <span
                      className={cn(
                        "text-text-primary font-mono",
                        !isCompact && "font-bold"
                      )}
                    >
                      {ab.cooldown}s
                    </span>
                  </div>
                )}

                {/* Damage */}
                {ab.damage && (
                  <div
                    className={cn(
                      "flex justify-between items-center bg-surface-dim rounded text-text-dimmed",
                      isCompact
                        ? "px-1.5 py-0.5 text-[10px]"
                        : "px-2 py-1 text-[10px] border border-border-subtle"
                    )}
                  >
                    <span
                      className={cn(
                        "uppercase font-bold tracking-wide text-status-danger-text",
                        "text-[10px]"
                      )}
                    >
                      DAMAGE
                    </span>
                    <span
                      className={cn(
                        "text-text-primary font-mono",
                        !isCompact && "font-bold"
                      )}
                    >
                      {ab.damage}
                    </span>
                  </div>
                )}

                {/* Projectiles */}
                {ab.projectiles && (
                  <div
                    className={cn(
                      "flex justify-between items-center bg-surface-dim rounded text-text-dimmed",
                      isCompact
                        ? "px-1.5 py-0.5 text-[10px]"
                        : "px-2 py-1 text-[10px] border border-border-subtle"
                    )}
                  >
                    <span
                      className={cn(
                        "uppercase font-bold tracking-wide",
                        "text-[10px]"
                      )}
                    >
                      PROJECTILES
                    </span>
                    <span
                      className={cn(
                        "text-text-primary font-mono",
                        !isCompact && "font-bold"
                      )}
                    >
                      {ab.projectiles}
                    </span>
                  </div>
                )}

                {/* Duration */}
                {ab.duration && (
                  <div
                    className={cn(
                      "flex justify-between items-center bg-surface-dim rounded text-text-dimmed",
                      isCompact
                        ? "px-1.5 py-0.5 text-[10px]"
                        : "px-2 py-1 text-[10px] border border-border-subtle"
                    )}
                  >
                    <span
                      className={cn(
                        "uppercase font-bold tracking-wide",
                        "text-[10px]"
                      )}
                    >
                      DURATION
                    </span>
                    <span
                      className={cn(
                        "text-text-primary font-mono",
                        !isCompact && "font-bold"
                      )}
                    >
                      {ab.duration}s
                    </span>
                  </div>
                )}

                {/* Charges */}
                {ab.charges && (
                  <div
                    className={cn(
                      "flex justify-between items-center bg-surface-dim rounded text-text-dimmed",
                      isCompact
                        ? "px-1.5 py-0.5 text-[10px]"
                        : "px-2 py-1 text-[10px] border border-border-subtle"
                    )}
                  >
                    <span
                      className={cn(
                        "uppercase font-bold tracking-wide",
                        "text-[10px]"
                      )}
                    >
                      CHARGES
                    </span>
                    <span
                      className={cn(
                        "text-text-primary font-mono",
                        !isCompact && "font-bold"
                      )}
                    >
                      {ab.charges}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
