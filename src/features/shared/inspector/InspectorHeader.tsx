"use client";

import { ArrowLeft } from "lucide-react";
import { GameImage } from "@/components/ui/GameImage";
import { getCardImageUrl } from "@/services/assets/asset-helpers";
import { UnifiedEntity, Spellcaster, Unit, Spell, Titan } from "@/types/api";

interface InspectorHeaderProps {
  item: UnifiedEntity;
  onBack?: () => void;
}

export function InspectorHeader({ item, onBack }: InspectorHeaderProps) {
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
      rank = "N/A";
    } else if (entity.category === "Spell") {
      rank = "N/A";
    } else if ("rank" in entity && entity.rank) {
      rank = entity.rank;
    }
  }

  // Magic School
  const magicSchoolRaw = "magic_school" in item ? (item as Unit | Spell | Titan).magic_school : null;
  const magicSchool = magicSchoolRaw === "Titan" ? null : magicSchoolRaw;

  return (
    <div className="w-full h-[140px] relative flex items-center justify-center overflow-hidden shrink-0 bg-slate-900">
      {/* Blurred Background */}
      <GameImage
        src={getCardImageUrl(item)}
        alt={name}
        fill
        className="object-cover opacity-20 blur-xl scale-125"
      />
      
      {/* Back Button (Mobile Only) */}
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden absolute top-3 left-3 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md border border-white/10 shadow-lg"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      
      {/* Main Image (Contained) */}
      <div className="absolute inset-0 flex items-center justify-center p-2 z-10">
        <GameImage
          src={getCardImageUrl(item)}
          alt={name}
          width={400}
          height={240}
          className="h-full w-auto max-w-full object-contain drop-shadow-2xl rounded scale-95"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-surface-card via-transparent to-transparent z-20" />

      {/* Name Overlay */}
      <div className="absolute bottom-2 left-4 right-4 z-30 pointer-events-none text-center">
        <h2 className="text-lg md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate">
          {name}
        </h2>
      </div>
      
      {/* Badges - Top Right on Mobile, Top Left on Desktop */}
      <div className="absolute top-3 right-3 md:right-auto md:left-4 flex flex-col items-end md:items-start gap-1 z-30 scale-90 origin-top-right md:origin-top-left pointer-events-none">
        {/* Rank / Class Badge */}
        {rank && rank !== "N/A" && (
          <span className="bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold font-mono text-brand-accent border border-brand-accent/30 backdrop-blur-md">
            {["I", "II", "III", "IV", "V"].includes(rank) ? `RANK ${rank}` : rank}
          </span>
        )}
        
        {/* Magic School Badge */}
        {magicSchool && (
          <span className="bg-brand-secondary/90 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-brand-secondary/30 backdrop-blur-md shadow-sm">
            {magicSchool}
          </span>
        )}
        
        {/* Category Badge */}
        <span className="bg-brand-primary/90 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
          {category}
        </span>
      </div>
    </div>
  );
}
