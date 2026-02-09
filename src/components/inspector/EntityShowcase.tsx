"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Heart,
  Swords,
  Users,
  Zap,
  Wind,
  Target,
} from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { cn, getCardImageUrl } from "@/lib/utils";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

export type EntityItem = Unit | Spellcaster | Spell | Titan;

const getDamageDisplay = (item: EntityItem) => {
  if (!("damage" in item) || !item.damage) return undefined;
  const mechanics = "mechanics" in item ? (item as Unit | Spell).mechanics : undefined;
  if (mechanics?.waves && mechanics.waves > 1) {
    return `${item.damage}x${mechanics.waves}`;
  }
  return item.damage;
};

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
  if (isSpellcaster) {
    if ("class" in item) {
      rank = (item as Spellcaster).class.toUpperCase();
    }
  } else {
    const entity = item as Unit | Spell | Titan;
    if (entity.category === "Titan") {
      rank = "TITAN";
    } else if (entity.category === "Spell") {
      rank = "N/A"; 
    } else if ("rank" in entity && entity.rank) {
      rank = entity.rank;
    }
  }

  // Magic School for linking if available
  const magicSchool = "magic_school" in item ? (item as Unit | Spell | Titan).magic_school : null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 bg-surface-main/30 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 blur-[150px] rounded-full" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 blur-[150px] rounded-full" />
      </div>

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-md bg-surface-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Header / Art Area */}
        <div className="relative w-full h-64 md:h-80 bg-slate-900 group overflow-hidden">
             {/* Dynamic Background Image (Blurred) */}
             <GameImage
                src={getCardImageUrl(item)}
                alt={name}
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
                  alt={name}
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
                      <span className="bg-black/60 px-3 py-1 rounded text-xs font-bold font-mono text-brand-accent border border-brand-accent/30 backdrop-blur-md shadow-lg">
                        {["I", "II", "III", "IV", "V"].includes(rank) ? `RANK ${rank}` : rank}
                      </span>
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
        <div className="p-6 space-y-6 bg-surface-card">
           
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
            <div className="grid grid-cols-3 gap-3">
            {"health" in item && (
              <StatBox
                label="Health"
                value={item.health}
                icon={<Heart size={18} className="text-green-500" />}
              />
            )}

            {/* Unit / Titan Stats */}
            {isUnit && category !== "Spell" && "damage" in item && (
              <>
                <StatBox
                  label="Damage"
                  value={getDamageDisplay(item)}
                  icon={<Swords size={18} className="text-red-400" />}
                />
                {"attack_speed" in item && (
                  <StatBox
                    label="Atk Spd"
                    value={`${(item as Unit).attack_speed ?? 0}s`}
                    icon={<Zap size={18} className="text-yellow-400" />}
                  />
                )}
                {"range" in item && (item as Unit).range && (
                  <StatBox
                    label="Range"
                    value={(item as Unit).range}
                    icon={<Users size={18} className="text-blue-400" />}
                  />
                )}
                {"movement_speed" in item &&
                  (item as Unit | Titan).movement_speed && (
                    <StatBox
                      label="Speed"
                      value={(item as Unit | Titan).movement_speed}
                      icon={<Clock size={18} className="text-cyan-400" />}
                    />
                  )}
                {"movement_type" in item && (item as Unit).movement_type && (
                  <StatBox
                    label="Move Type"
                    value={(item as Unit).movement_type}
                    icon={<Wind size={18} className="text-sky-300" />}
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
                    icon={<Swords size={18} className="text-red-400" />}
                  />
                )}
                {"duration" in item && (item as Spell).duration && (
                  <StatBox
                    label="Duration"
                    value={`${(item as Spell).duration}s`}
                    icon={<Clock size={18} className="text-yellow-400" />}
                  />
                )}
                {"radius" in item && (item as Spell).radius && (
                  <StatBox
                    label="Radius"
                    value={(item as Spell).radius}
                    icon={<Users size={18} className="text-blue-400" />}
                  />
                )}
                {"max_targets" in item && (item as Spell).max_targets && (
                  <StatBox
                    label="Targets"
                    value={(item as Spell).max_targets}
                    icon={<Users size={18} className="text-purple-400" />}
                  />
                )}
              </>
            )}

            {/* Spellcaster Difficulty */}
            {isSpellcaster && (
               <div className="bg-surface-main/50 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center text-center col-span-3">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                    Difficulty
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((star) => (
                      <div
                        key={star}
                        className={`h-2.5 w-2.5 rounded-full ring-2 ring-offset-2 ring-offset-surface-card transition-all ${
                          ((item as Spellcaster).difficulty || 1) >= star
                            ? "bg-brand-primary ring-brand-primary/30"
                            : "bg-surface-main ring-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
            )}
           </div>

           {/* Mechanics */}
           {"mechanics" in item && (item as Unit | Spell).mechanics && (item as Unit | Spell).mechanics?.bonus_damage && (item as Unit | Spell).mechanics!.bonus_damage!.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Mechanics</h3>
              {(item as Unit | Spell).mechanics?.bonus_damage?.map((bonus, i) => (
                <div
                  key={i}
                  className="bg-brand-secondary/10 border border-brand-secondary/20 p-3 rounded-lg flex items-center gap-3 transition-colors hover:bg-brand-secondary/20"
                >
                  <Target size={16} className="text-brand-secondary shrink-0" />
                  <span className="text-sm text-brand-secondary font-bold">
                    +{bonus.value * (bonus.unit === "percent_max_hp" ? 100 : 1)}
                    {bonus.unit === "percent_max_hp" ? "% Max HP" : ""}{" "}
                    Damage vs <span className="text-white">{bonus.target_type}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Abilities (Spellcaster) */}
          {isSpellcaster && "abilities" in item && (
             <div className="space-y-4 pt-2">
                {/* Passives */}
               {(item as Spellcaster).abilities.passive.length > 0 && (
                 <div className="space-y-2">
                   <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider px-1">
                     Passive
                   </h3>
                   {(item as Spellcaster).abilities.passive.map((p, i) => (
                     <div
                       key={i}
                       className="bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                     >
                       <span className="font-bold text-brand-secondary block mb-1 text-sm">
                         {p.name}
                       </span>
                       <span className="text-gray-400 text-xs leading-relaxed">
                         {p.description}
                       </span>
                     </div>
                   ))}
                 </div>
               )}
               
               {/* Actives */}
               <div className="space-y-2">
                 <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider px-1">
                   Abilities
                 </h3>
                 {[
                   { ...((item as Spellcaster).abilities.primary), type: 'PRIMARY' },
                   { ...((item as Spellcaster).abilities.defense), type: 'DEFENSE' },
                   { ...((item as Spellcaster).abilities.ultimate), type: 'ULTIMATE' },
                 ].map((ab, i) => (
                   <div
                     key={i}
                     className="bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors group"
                   >
                     <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "text-[9px] px-1.5 py-0.5 rounded font-bold bg-white/10 text-gray-400 group-hover:text-white transition-colors",
                             ab.type === 'PRIMARY' && "group-hover:bg-brand-primary",
                             ab.type === 'DEFENSE' && "group-hover:bg-brand-accent group-hover:text-brand-dark",
                             ab.type === 'ULTIMATE' && "group-hover:bg-brand-secondary"
                           )}>
                              {ab.type}
                           </span>
                           <span className="font-bold text-sm text-white">
                             {ab.name}
                           </span>
                        </div>
                       {ab.cooldown && (
                         <span className="text-[10px] text-gray-400 bg-black/40 px-1.5 py-0.5 rounded font-mono">
                           {ab.cooldown}s
                         </span>
                       )}
                     </div>
                     <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                       {ab.description}
                     </p>

                     {/* Ability Mechanics - Dynamic from Schema */}
                     {"mechanics" in ab && Array.isArray(ab.mechanics) && ab.mechanics.length > 0 && (
                        <div className="mt-2 space-y-1 pt-1 border-t border-white/5">
                          {ab.mechanics.map((mech, mIdx) => (
                            <div key={mIdx} className="flex flex-col gap-0.5 text-[10px] bg-black/20 p-1.5 rounded border border-white/5">
                               <span className="text-brand-accent font-bold uppercase tracking-wider">{mech.name}</span>
                               <span className="text-gray-400 leading-tight">{mech.description}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Ability Stats - Dynamic from Schema */}
                      {"stats" in ab && ab.stats && (
                          <div className="mt-2 grid grid-cols-2 gap-1.5 pt-1 border-t border-white/5">
                            {Object.entries(ab.stats).map(([k, v]) => {
                                if (v === null || v === undefined) return null;
                                return (
                                  <div key={k} className="flex justify-between items-center bg-black/30 px-2 py-1 rounded text-[10px] border border-white/5">
                                     <span className="text-gray-500 uppercase tracking-wider font-bold text-[9px]">{k.replace('_', ' ')}</span>
                                     <span className="text-white font-mono font-bold">{String(v)}</span>
                                  </div>
                                );
                            })}
                          </div>
                      )}
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | undefined;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-surface-main/50 border border-white/5 hover:border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center transition-colors group">
      <div className="opacity-60 scale-90 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 mb-1">{icon}</div>
      <div className="text-base font-bold font-mono text-white leading-tight">
        {value ?? "-"}
      </div>
      <div className="text-[9px] uppercase tracking-widest text-gray-500 mt-0.5">
        {label}
      </div>
    </div>
  );
}
