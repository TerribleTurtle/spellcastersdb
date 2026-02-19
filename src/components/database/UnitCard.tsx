import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SmartRankBadge } from "@/components/ui/rank-badge";

import { EntityImage } from "@/components/ui/EntityImage";
import { cn } from "@/lib/utils";
import { UnifiedEntity } from "@/types/api";

interface UnitCardProps {
  unit: UnifiedEntity;
  variant?: "default" | "compact";
  className?: string;
}

// Helper to determine link and category
function getEntityMeta(entity: UnifiedEntity) {
  if (entity.category === "Spellcaster") {
    return {
      href: `/spellcasters/${entity.spellcaster_id}`,
      category: "Spellcaster",
      rank: entity.class.toUpperCase(),
      school: "Spellcaster",
    };
  }
  if (entity.category === "Consumable") {
    return {
      href: `/consumables/${entity.entity_id}`,
      category: "Consumable",
      rank: entity.rarity || "COMMON",
      school: "Item",
    };
  }
  // Titan - Updated to use RankBadge logic (rank V)
  if (entity.category === "Titan") {
    return {
      href: `/titans/${entity.entity_id}`,
      category: "Titan",
      rank: "V", 
      school: entity.magic_school,
      isTitan: true,
    };
  }

  // Spell
  if (entity.category === "Spell") {
    return {
      href: `/incantations/spells/${entity.entity_id}`,
      category: "Spell",
      rank: "SPELL",
      school: entity.magic_school,
    };
  }

  // Upgrade
  if (entity.category === "Upgrade" || (!("magic_school" in entity) && "cost" in entity)) {
     return {
         href: `/upgrades/${entity.entity_id}`,
         category: "Upgrade",
         rank: "UPGRADE",
         school: "Technology",
     };
  }

  // Unit or Spell
  return {
    href: `/incantations/units/${entity.entity_id}`,
    category: entity.category,
    rank: "rank" in entity && entity.rank ? entity.rank : "I",
    school: "magic_school" in entity ? entity.magic_school : "Neutral",
  };
}

export function UnitCard({
  unit,
  variant = "default",
  className,
}: UnitCardProps) {
  const meta = getEntityMeta(unit);


  if (variant === "compact") {
    return (
      <Link
        href={meta.href}
        className={cn(
          "group flex items-center gap-3 p-2.5 rounded-lg border border-border-subtle bg-surface-card md:hover:bg-surface-hover md:hover:border-brand-accent/30 transition-all",
          className
        )}
      >
        {/* Image Thumbnail */}
        <EntityImage entity={unit} className="w-12 h-12 shrink-0" />

        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text-primary group-hover:text-brand-accent transition-colors truncate">
            {unit.name}
          </h3>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
            <span className="text-brand-primary font-semibold">
              {meta.school}
            </span>
            <span className="text-text-faint">•</span>
            <span className="text-text-dimmed">{meta.category}</span>
          </div>
        </div>

        {/* Stats - Only show for units with combat stats */}
        {"health" in unit && "damage" in unit && (
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono shrink-0">
            <div className="text-center">
              <div className="text-text-faint text-[9px]">HP</div>
              <div className="text-text-primary font-bold">{unit.health}</div>
            </div>
            <div className="text-center">
              <div className="text-text-faint text-[9px]">DMG</div>
              <div className="text-text-primary font-bold">{unit.damage}</div>
            </div>
          </div>
        )}

        {/* Rank Badge */}
        <SmartRankBadge
          rank={meta.rank}
          isTitan={meta.isTitan}
          className="w-7 h-7 flex items-center justify-center p-0 rounded text-[10px] shrink-0"
          fallbackClassName="w-7 h-7 flex items-center justify-center p-0 rounded bg-brand-dark border-brand-primary/20 text-[10px] font-mono font-bold text-brand-primary shrink-0"
        />


      </Link>
    );
  }

  // Default (Grid) Variant
  return (
    <Link
      href={meta.href}
      className={cn(
        "block group bg-surface-card border border-border-default rounded-lg overflow-hidden transition-all md:hover:bg-surface-hover md:hover:border-brand-accent/50 md:hover:-translate-y-1 active:scale-95 md:active:scale-100",
        className
      )}
    >
      {/* Card Image */}
      <EntityImage entity={unit} className="w-full h-20" />

      <div className="p-2">
        {/* Header with Rank */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-text-dimmed uppercase tracking-wide">
            {meta.category}
          </span>
          <SmartRankBadge
            rank={meta.rank}
            isTitan={meta.isTitan}
            className="text-[10px] px-2 py-0.5 rounded"
          />
        </div>

        <h2 className="text-base font-bold text-text-primary group-hover:text-brand-accent transition-colors mb-1 truncate">
          {unit.name}
        </h2>

        {/* School + View CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <p className="text-[10px] text-brand-primary uppercase tracking-wider font-semibold">
            {meta.school}
          </p>
          <span className="flex items-center gap-1 text-[10px] text-text-faint group-hover:text-brand-accent transition-colors">
            <span className="hidden group-hover:inline">View</span>
            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
          </span>
        </div>
      </div>
    </Link>
  );
}
