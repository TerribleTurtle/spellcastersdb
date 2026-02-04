import Link from "next/link";
import { UnifiedEntity, Unit, Hero, Consumable } from "@/types/api";
import { cn } from "@/lib/utils"; 
// If cn doesn't exist, I'll use clsx + tailwind-merge locally or check utils.
// Checking package.json revealed clsx and tailwind-merge.

interface UnitCardProps {
  unit: UnifiedEntity;
  variant?: "default" | "compact";
  className?: string;
}

// Helper to determine link and category
function getEntityMeta(entity: UnifiedEntity) {
  if ("hero_id" in entity) {
    return { 
      href: `/heroes/${entity.hero_id}`, 
      category: "Hero", 
      rank: "LEGENDARY",
      pop: null,
      school: "Hero"
    };
  }
  if ("consumable_id" in entity) {
    return { 
      href: `/consumables/${entity.consumable_id}`, 
      category: "Consumable", 
      rank: entity.rarity || "COMMON",
      pop: null,
      school: "Item"
    };
  }
  // It's a Unit (Unit | Spell | Building)
  return { 
    href: `/units/${entity.entity_id}`, 
    category: entity.category, 
    rank: entity.card_config.rank,
    pop: entity.card_config.cost_population,
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
          "group flex items-center justify-between p-3 rounded-lg border border-white/5 bg-surface-card hover:bg-surface-hover hover:border-brand-accent/30 transition-all",
          className
        )}
      >
        <div className="flex items-center gap-3">
          {/* Rank Badge */}
          <div className="flex items-center justify-center w-8 h-8 rounded bg-brand-dark border border-white/10 text-[10px] font-mono font-bold text-brand-primary group-hover:text-brand-accent tracking-tighter overflow-hidden">
            {meta.rank}
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-white group-hover:text-brand-accent transition-colors">
              {unit.name}
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 group-hover:text-gray-400">
              {meta.school} • {meta.category}
            </span>
          </div>
        </div>

        {/* Stats / Cost */}
        <div className="flex items-center gap-4 text-xs font-mono">
           <div className="text-right">
             {meta.pop !== null && (
               <div className="text-brand-secondary">{meta.pop} Pop</div>
             )}
           </div>
        </div>
      </Link>
    );
  }

  // Default (Large/Grid) Variant
  return (
    <Link
      href={meta.href}
      className={cn(
        "block group bg-surface-card border border-white/10 rounded-xl p-5 transition-all hover:bg-surface-hover hover:border-brand-accent/50 hover:-translate-y-1 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-mono text-gray-500 uppercase">{meta.category}</span>
        {meta.pop !== null && (
          <span className="text-xs font-mono text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded border border-brand-secondary/20">
            {meta.pop} Pop
          </span>
        )}
      </div>

      <h2 className="text-xl font-bold text-white group-hover:text-brand-accent transition-colors mb-1 truncate">
        {unit.name}
      </h2>

      <p className="text-xs text-brand-primary mb-3 uppercase tracking-wider font-semibold">
        {meta.school} • {meta.rank}
      </p>

      {/* Render stats conditionally based on type, or just common ones */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mt-4 border-t border-white/5 pt-3">
        {"health" in unit ? (
           <>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-gray-600 mb-0.5">Health</span>
              <span className="text-white font-mono">{unit.health}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-gray-600 mb-0.5">Speed</span>
              <span className="text-white font-mono">{unit.movement_speed}</span>
            </div>
           </>
        ) : (
           <div className="col-span-2">
             <span className="block text-[10px] uppercase tracking-wider text-gray-600 mb-0.5">Description</span>
             <p className="text-gray-400 line-clamp-2">{unit.description}</p>
           </div>
        )}
      </div>
    </Link>
  );
}
