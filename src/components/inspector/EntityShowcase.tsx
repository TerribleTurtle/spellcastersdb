"use client";

import Link from "next/link";
import {
  ArrowLeft,
} from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { getCardAltText, getCardImageUrl } from "@/services/assets/asset-helpers";
import { EntityDisplayItem } from "@/components/entity-card/types";
import { EntityStats } from "@/components/entity-card/EntityStats";
import { EntityMechanics } from "@/components/entity-card/EntityMechanics";

import { SpellcasterAbilities } from "@/components/entity-card/SpellcasterAbilities";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { RankBadge } from "@/components/ui/rank-badge";

export type EntityItem = EntityDisplayItem;



interface EntityShowcaseProps {
  item: EntityItem;
  backUrl?: string; // Optional back link URL
  backLabel?: string; // Optional back link label
}

export function EntityShowcase({
  item,
  backUrl,
  backLabel = "Back",
}: EntityShowcaseProps) {
  // Type Guard
  const isSpellcaster = "spellcaster_id" in item;
  const isUnit = !isSpellcaster;

  // Safe category access
  const category = isUnit
    ? (item as Unit | Spell | Titan).category
    : "Spellcaster";
  const name = item.name;

  let rank = "N/A";
  let isTitan = false;
  if (isSpellcaster) {
    if ("class" in item) {
      rank = (item as Spellcaster).class.toUpperCase();
    }
  } else {
    const entity = item as Unit | Spell | Titan;
    if (entity.category === "Titan") {
      // Hide rank for Titans (user request: "we don't ever(yet) want to show rank 5")
      // Update: User now wants TITAN with Legendary styling
      rank = "V";
      isTitan = true;
    } else if (entity.category === "Spell") {
      rank = "N/A"; 
    } else if ("rank" in entity && entity.rank) {
      rank = entity.rank;
    }
  }

  // Magic School for linking if available - Hide if it's "Titan" to reduce redundancy
  const magicSchoolRaw = "magic_school" in item ? (item as Unit | Spell | Titan).magic_school : null;
  const magicSchool = magicSchoolRaw === "Titan" ? null : magicSchoolRaw;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 bg-surface-main/30 relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 blur-[150px] rounded-full" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 blur-[150px] rounded-full" />
      </div>

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-md bg-surface-card rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* Header / Art Area */}
        <div className="relative w-full h-64 md:h-80 bg-slate-900 group overflow-hidden rounded-t-2xl">
             {/* Dynamic Background Image (Blurred) */}
             <GameImage
                src={getCardImageUrl(item)}
                alt={getCardAltText(item)}
                fill
                className="object-cover opacity-40 blur-2xl scale-110 group-hover:scale-125 transition-transform duration-700"
              />
              
              {/* Back Button */}
              {backUrl && (
                <Link 
                  href={backUrl}
                  className="absolute top-4 left-4 z-30 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md border border-white/10 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span className="sr-only">{backLabel}</span>
                </Link>
              )}

              {/* Main Entity Image */}
              <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
                <GameImage
                  src={getCardImageUrl(item)}
                  alt={getCardAltText(item)}
                  width={500}
                  height={500}
                  className="h-full w-auto max-w-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] scale-100 group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-surface-card via-surface-card/20 to-transparent z-20 pointer-events-none" />

              {/* Badges */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-30">
                 <div className="flex flex-col gap-2 items-start">
                    {/* Rank Badge */}
                    {rank && rank !== "N/A" && (
                         isTitan || ["I", "II", "III", "IV", "V"].includes(rank) ? (
                            <RankBadge 
                                rank={rank} 
                                isTitan={isTitan}
                                mode="text"
                                className="px-3 py-1 rounded text-xs font-bold font-mono shadow-lg"
                            />
                         ) : (
                            <span className="bg-black/60 px-3 py-1 rounded text-xs font-bold font-mono text-brand-accent border border-brand-accent/30 backdrop-blur-md shadow-lg">
                                {rank}
                            </span>
                         )
                    )}
                    
                    {/* School Badge (Linkable maybe?) */}
                    {magicSchool && (
                        <Link href={`/schools/${magicSchool}`} className="bg-brand-secondary/80 hover:bg-brand-secondary text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-colors">
                           {magicSchool}
                        </Link>
                    )}
                 </div>

                 {/* Category Badge */}
                 <span className="bg-brand-primary/90 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/10">
                    {category}
                 </span>
              </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 bg-surface-card rounded-b-2xl">
           
           {/* Title Section */}
           <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2 drop-shadow-md">
                {name}
              </h1>
              {"description" in item && item.description && (
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                  {item.description}
                </p>
              )}
           </div>

           <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

           {/* Stats Grid */}
           <div className="w-full">
            <EntityStats item={item} variant="detailed" />
           </div>

           {/* Mechanics v1.1 */}
           <div className="w-full">
            <EntityMechanics item={item} variant="detailed" />
           </div>

          {/* Abilities (Spellcaster) */}
          <SpellcasterAbilities item={item} variant="detailed" />
        </div>
      </div>
    </div>
  );
}


