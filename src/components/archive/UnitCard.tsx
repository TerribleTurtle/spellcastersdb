import Link from "next/link";
import { UnifiedEntity, Spellcaster } from "@/types/api";
import { cn } from "@/lib/utils";
import { EntityImage } from "@/components/ui/EntityImage";

interface UnitCardProps {
  unit: UnifiedEntity;
  variant?: "default" | "compact";
  className?: string;
}

// Helper to determine link and category
function getEntityMeta(entity: UnifiedEntity) {
  if (entity.category === 'Spellcaster') {
    return { 
      href: `/spellcasters/${entity.spellcaster_id}`, 
      category: "Spellcaster",  
      rank: entity.class.toUpperCase(),
      school: "Spellcaster"
    };
  }
  if (entity.category === 'Consumable') {
    return { 
      href: `/consumables/${entity.entity_id}`, 
      category: "Consumable", 
      rank: entity.rarity || "COMMON",
      school: "Item"
    };
  }
  // Titan
  if (entity.category === 'Titan') {
      return {
          href: `/titans/${entity.entity_id}`,
          category: "Titan",
          rank: "TITAN",
          school: entity.magic_school
      };
  }

  // Spell
  if (entity.category === 'Spell') {
    return {
      href: `/incantations/spells/${entity.entity_id}`,
      category: "Spell",
      rank: "SPELL",
      school: entity.magic_school
    };
  }

  // Unit or Spell
  return { 
    href: `/incantations/units/${entity.entity_id}`, 
    category: entity.category, 
    rank: ('rank' in entity && entity.rank) ? entity.rank : 'I',
    school: entity.magic_school
  };
}

export function UnitCard({ unit, variant = "default", className }: UnitCardProps) {
  const meta = getEntityMeta(unit);
  
  if (variant === "compact") {
    return (
      <Link
        href={meta.href}
        className={cn(
          "group flex items-center gap-3 p-2.5 rounded-lg border border-white/5 bg-surface-card hover:bg-surface-hover hover:border-brand-accent/30 transition-all",
          className
        )}
      >
        {/* Image Thumbnail */}
        <EntityImage
          entity={unit}
          className="w-12 h-12 shrink-0"
        />
        
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white group-hover:text-brand-accent transition-colors truncate">
            {unit.name}
          </h3>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
            <span className="text-brand-primary font-semibold">{meta.school}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-500">{meta.category}</span>
          </div>
        </div>
        
        {/* Stats - Only show for units with combat stats */}
        {"health" in unit && "damage" in unit && (
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono shrink-0">
            <div className="text-center">
              <div className="text-gray-600 text-[9px]">HP</div>
              <div className="text-white font-bold">{unit.health}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600 text-[9px]">DMG</div>
              <div className="text-white font-bold">{unit.damage}</div>
            </div>
          </div>
        )}
        
        {/* Rank Badge */}
        <div className="flex items-center justify-center w-7 h-7 rounded bg-brand-dark border border-brand-primary/20 text-[9px] font-mono font-bold text-brand-primary shrink-0">
          {meta.rank}
        </div>
      </Link>
    );
  }

  // Default (Grid) Variant
  return (
    <Link
      href={meta.href}
      className={cn(
        "block group bg-surface-card border border-white/10 rounded-lg overflow-hidden transition-all hover:bg-surface-hover hover:border-brand-accent/50 hover:-translate-y-1",
        className
      )}
    >
      {/* Card Image */}
      <EntityImage
        entity={unit}
        className="w-full h-28"
      />
      
      <div className="p-3">
        {/* Header with Rank */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wide">{meta.category}</span>
          <span className="text-[10px] font-mono font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
            {meta.rank}
          </span>
        </div>

        <h2 className="text-base font-bold text-white group-hover:text-brand-accent transition-colors mb-1 truncate">
          {unit.name}
        </h2>

        <p className="text-[10px] text-brand-primary mb-3 uppercase tracking-wider font-semibold">
          {meta.school}
        </p>

        {/* Stats Grid - Cleaner presentation */}
        {"health" in unit && "damage" in unit ? (
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
            <div className="text-center">
              <div className="text-[9px] text-gray-600 mb-0.5">HP</div>
              <div className="text-xs text-white font-mono font-bold">{"health" in unit ? unit.health : "-"}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-gray-600 mb-0.5">DMG</div>
              <div className="text-xs text-white font-mono font-bold">{unit.damage}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-gray-600 mb-0.5">RNG</div>
              <div className="text-xs text-white font-mono font-bold">{"range" in unit ? unit.range : "-"}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-gray-600 mb-0.5">SPD</div>
              <div className="text-xs text-white font-mono font-bold">{unit.movement_speed}</div>
            </div>
          </div>
        ) : unit.category === 'Spellcaster' ? (
           <div className="pt-2 border-t border-white/5 flex flex-col items-center">
                <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Difficulty</div>
                <div className="flex gap-1">
                    {[1, 2, 3].map(star => (
                            <div 
                            key={star}
                            className={cn(
                                "w-2 h-2 rounded-full",
                                ((unit as Spellcaster).difficulty || 1) >= star ? "bg-brand-primary shadow-[0_0_5px_rgba(var(--brand-primary),0.6)]" : "bg-white/10"
                            )}
                            />
                    ))}
                </div>
           </div>
        ) : (
          <div className="pt-2 border-t border-white/5">
            <p className="text-gray-400 line-clamp-2 text-[10px] leading-relaxed">
              {"description" in unit ? unit.description : ""}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
