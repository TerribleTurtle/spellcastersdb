"use client";

import Image from "next/image";

import {
  ArrowLeft,
  Clock,
  Crown,
  Heart,
  PlusCircle,
  Swords,
  Users,
  X,
  Zap,
  Wind,
  Target,
} from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { cn, getCardImageUrl } from "@/lib/utils";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

export type InspectorItem = Unit | Spellcaster | Spell | Titan;

const getDamageDisplay = (item: InspectorItem) => {
  if (!("damage" in item) || !item.damage) return undefined;
  const mechanics = "mechanics" in item ? (item as Unit | Spell).mechanics : undefined;
  if (mechanics?.waves && mechanics.waves > 1) {
    return `${item.damage}x${mechanics.waves}`;
  }
  return item.damage;
};

interface CardInspectorProps {
  item: InspectorItem | null;
  currentDeck: import("@/types/deck").Deck; // Use type import to avoid circular dependency if any
  onAddSlot: (slotIndex: 0 | 1 | 2 | 3 | 4) => void;
  onSetSpellcaster: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

export function CardInspector({
  item,
  currentDeck,
  onAddSlot,
  onSetSpellcaster,
  onBack,
  onClose,
}: CardInspectorProps) {
  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 border-x border-white/10 bg-surface-main/30 relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-primary/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center p-8 animate-in fade-in zoom-in duration-500">
          <div className="mb-6 relative w-24 h-24 opacity-80">
            <Image
              src="/logo.svg"
              alt="SpellcastersDB Logo"
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-wider mb-2">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
              SPELLCASTERS
            </span>
            <span className="text-white">DB</span>
          </h1>

          <div className="h-px w-16 bg-linear-to-r from-transparent via-white/20 to-transparent my-4" />

          <h3 className="text-lg font-bold text-gray-200">Ready to Forge?</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-[200px]">
            Select a Unit or Spellcaster from the vault to inspect details.
          </p>
        </div>
      </div>
    );
  }

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
      rank = "N/A"; // Don't show rank for spells to avoid duplicate "SPELL" badge
    } else if ("rank" in entity && entity.rank) {
      rank = entity.rank;
    }
  }

  // Magic School
  const magicSchool = "magic_school" in item ? (item as Unit | Spell | Titan).magic_school : null;

  // Check if item is already in deck
  const isCurrentSpellcaster =
    isSpellcaster &&
    currentDeck.spellcaster?.spellcaster_id ===
      (item as Spellcaster).spellcaster_id;

  // For units, check specific slots
  const getSlotStatus = (idx: number) => {
    if (!isUnit) return null;
    const slot = currentDeck.slots[idx];
    const entity = item as Unit | Spell | Titan;
    const isExample = slot.unit?.entity_id === entity.entity_id;
    return isExample ? "ALREADY_IN" : null;
  };

  const isTitanInDeck =
    isUnit &&
    (item as Unit | Spell | Titan).category === "Titan" &&
    currentDeck.slots[4].unit?.entity_id ===
      (item as Unit | Spell | Titan).entity_id;

  return (
    <div className="h-full w-full bg-surface-main/30 p-1 md:p-2 overflow-y-auto">
      <div className="relative bg-surface-card rounded-xl border border-white/10 shadow-2xl overflow-hidden max-w-[95%] md:max-w-[380px] mx-auto flex flex-col">
        {/* Close Button (Desktop) */}
        {onClose && (
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-4 right-4 z-40 p-2 bg-black/60 hover:bg-brand-primary/80 rounded-full text-white backdrop-blur-md border border-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Art / Banner Area */}
        <div className="flex-1 min-h-[140px] max-h-[30vh] w-full bg-slate-800 relative flex items-center justify-center overflow-hidden shrink-0">
          {/* Blurred Background */}
          <GameImage
            src={getCardImageUrl(item)}
            alt={name}
            fill
            className="object-cover opacity-30 blur-xl scale-110"
          />
          {/* Back Button (Mobile Only) */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden absolute top-4 left-4 z-30 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md border border-white/10"
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
              className="h-full w-auto max-w-full object-contain drop-shadow-2xl rounded scale-90"
            />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-surface-card to-transparent z-20" />
          
          {/* Badges - Top Left (Offset for Back Button on Mobile) */}
          <div className="absolute top-3 left-14 md:left-4 flex flex-col items-start gap-1 z-30">
            {/* Rank / Class Badge */}
            {rank && rank !== "N/A" && (
              <span className="bg-black/80 px-2 py-0.5 rounded text-xs font-bold font-mono text-brand-accent border border-brand-accent/30 backdrop-blur-md">
                {["I", "II", "III", "IV", "V"].includes(rank) ? `RANK ${rank}` : rank}
              </span>
            )}
            
            {/* Magic School Badge */}
            {magicSchool && (
              <span className="bg-brand-secondary/90 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider text-white border border-brand-secondary/30 backdrop-blur-md shadow-sm">
                {magicSchool}
              </span>
            )}
            
            {/* Category Badge */}
            <span className="bg-brand-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
              {category}
            </span>
          </div>
        </div>

        {/* Quick Add Actions */}
        <div className="p-2 bg-surface-main/30 sticky top-0 backdrop-blur z-10 border-b border-white/10 shrink-0">
          {isSpellcaster ? (
            <button
              onClick={onSetSpellcaster}
              disabled={isCurrentSpellcaster}
              className={cn(
                "w-full py-3 font-bold rounded flex items-center justify-center gap-2 transition-colors duration-200",
                isCurrentSpellcaster
                  ? "bg-white/10 text-gray-400 cursor-not-allowed border border-white/5"
                  : "bg-brand-primary hover:bg-brand-primary/80 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              )}
            >
              {isCurrentSpellcaster ? (
                <>
                  <Crown size={20} className="opacity-50" /> Selected
                </>
              ) : (
                <>
                  <Crown size={20} /> Select as Spellcaster
                </>
              )}
            </button>
          ) : item.category === "Titan" ? (
            <button
              onClick={() => onAddSlot(4)}
              disabled={isTitanInDeck}
              className={cn(
                "w-full py-3 font-bold rounded flex items-center justify-center gap-2 transition-colors duration-200",
                isTitanInDeck
                  ? "bg-white/10 text-gray-400 cursor-not-allowed border border-white/5"
                  : "bg-brand-primary hover:bg-brand-primary/80 text-white"
              )}
            >
              {isTitanInDeck ? (
                <>
                  <PlusCircle size={18} className="opacity-50" /> Selected
                </>
              ) : (
                <>
                  <PlusCircle size={18} /> Select as Titan
                </>
              )}
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {([0, 1, 2, 3] as const).map((idx) => {
                const status = getSlotStatus(idx);
                const isOccupiedBySelf = status === "ALREADY_IN";

                return (
                  <button
                    key={idx}
                    onClick={() => onAddSlot(idx)}
                    disabled={isOccupiedBySelf}
                    className={cn(
                      "py-2 text-xs rounded transition-colors flex flex-col items-center justify-center",
                      isOccupiedBySelf
                        ? "bg-white/10 border-white/5 text-gray-500 cursor-not-allowed"
                        : "bg-white/5 hover:bg-brand-secondary/50 border border-white/10 hover:border-brand-secondary text-white"
                    )}
                  >
                    <span>Slot {idx + 1}</span>
                    {isOccupiedBySelf && (
                      <span className="text-[9px] uppercase tracking-widest opacity-60">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Stats */}
        <div className="p-3 space-y-3 flex-1 overflow-y-auto">
          {/* Core Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            {"health" in item && (
              <StatBox
                label="Health"
                value={item.health}
                icon={<Heart size={16} className="text-green-500" />}
              />
            )}

            {/* Unit / Titan Stats */}
            {isUnit && category !== "Spell" && "damage" in item && (
              <>
                <StatBox
                  label="Damage"
                  value={getDamageDisplay(item)}
                  icon={<Swords size={16} className="text-red-400" />}
                />
                {/* Only show attack speed for Units (Titans might not have it in schema yet or it's fixed) */}
                {"attack_speed" in item && (
                  <StatBox
                    label="Atk Speed"
                    value={`${(item as Unit).attack_speed ?? 0}s`}
                    icon={<Zap size={16} className="text-yellow-400" />}
                  />
                )}
                {"range" in item && (item as Unit).range && (
                  <StatBox
                    label="Range"
                    value={(item as Unit).range}
                    icon={<Users size={16} className="text-blue-400" />}
                  />
                )}
                {"movement_speed" in item &&
                  (item as Unit | Titan).movement_speed && (
                    <StatBox
                      label="Speed"
                      value={(item as Unit | Titan).movement_speed}
                      icon={<Clock size={16} className="text-cyan-400" />}
                    />
                  )}
                {"movement_type" in item && (item as Unit).movement_type && (
                  <StatBox
                    label="Move Type"
                    value={(item as Unit).movement_type}
                    icon={<Wind size={16} className="text-sky-300" />}
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
                    icon={<Swords size={16} className="text-red-400" />}
                  />
                )}
                {"duration" in item && (item as Spell).duration && (
                  <StatBox
                    label="Duration"
                    value={`${(item as Spell).duration}s`}
                    icon={<Clock size={16} className="text-yellow-400" />}
                  />
                )}
                {"radius" in item && (item as Spell).radius && (
                  <StatBox
                    label="Radius"
                    value={(item as Spell).radius}
                    icon={<Users size={16} className="text-blue-400" />}
                  />
                )}
                {"max_targets" in item && (item as Spell).max_targets && (
                  <StatBox
                    label="Targets"
                    value={(item as Spell).max_targets}
                    icon={<Users size={16} className="text-purple-400" />}
                  />
                )}
              </>
            )}

            {isSpellcaster && (
              <>
                <div className="bg-surface-main border border-white/5 p-1.5 rounded flex flex-col items-center justify-center text-center col-span-2">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                    Difficulty
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((star) => (
                      <div
                        key={star}
                        className={`h-2 w-2 rounded-full ${
                          ((item as Spellcaster).difficulty || 1) >= star
                            ? "bg-brand-primary"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mechanics Section (Bonus Damage etc) */}
          {"mechanics" in item && (item as Unit | Spell).mechanics && (
            <div className="space-y-2 mt-2">
              {(item as Unit | Spell).mechanics?.bonus_damage?.map((bonus, i) => (
                <div
                  key={i}
                  className="bg-brand-secondary/10 border border-brand-secondary/20 p-2 rounded flex items-center gap-2"
                >
                  <Target size={14} className="text-brand-secondary" />
                  <span className="text-xs text-brand-secondary font-bold">
                    +{bonus.value * (bonus.unit === "percent_max_hp" ? 100 : 1)}
                    {bonus.unit === "percent_max_hp" ? "% Max HP" : ""}{" "}
                    Damage vs {bonus.target_type}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Spellcaster Passives & Abilities */}
          {isSpellcaster && "abilities" in item && (
            <div className="space-y-3">
              {/* Passives */}
              {(item as Spellcaster).abilities.passive.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                    Passive
                  </h3>
                  {(item as Spellcaster).abilities.passive.map((p, i) => (
                    <div
                      key={i}
                      className="bg-white/5 p-2 rounded border border-white/5 text-xs"
                    >
                      <span className="font-bold text-brand-secondary block mb-0.5">
                        {p.name}
                      </span>
                      <span className="text-gray-400 leading-tight">
                        {p.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Active Abilities */}
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                  Abilities
                </h3>
                {[
                  (item as Spellcaster).abilities.primary,
                  (item as Spellcaster).abilities.defense,
                  (item as Spellcaster).abilities.ultimate,
                ].map((ab, i) => (
                  <div
                    key={i}
                    className="bg-white/5 p-2 rounded border border-white/5"
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-xs text-brand-accent">
                        {ab.name}
                      </span>
                      {ab.cooldown && (
                        <span className="text-[9px] text-gray-500 bg-black/40 px-1 rounded">
                          {ab.cooldown}s
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      {ab.description}
                    </p>

                    {/* Mechanics */}
                    {"mechanics" in ab && Array.isArray(ab.mechanics) && ab.mechanics.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        {ab.mechanics.map((mech, mIdx) => (
                           <div key={mIdx} className="bg-black/30 p-1 rounded border border-white/5 text-[9px] flex flex-col gap-0.5">
                              <span className="text-brand-accent font-bold uppercase tracking-wider">{mech.name}</span>
                              <span className="text-gray-500">{mech.description}</span>
                           </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Stats */}
                    {"stats" in ab && ab.stats && (
                        <div className="mt-1.5 grid grid-cols-2 gap-1 pt-1 border-t border-white/5">
                           {Object.entries(ab.stats).map(([k, v]) => {
                               if (v === null || v === undefined) return null;
                               return (
                                  <div key={k} className="flex justify-between items-center bg-black/30 px-1.5 py-0.5 rounded text-[9px]">
                                     <span className="text-gray-500 uppercase font-bold text-[8px] tracking-wide">{String(k).replace('_',' ')}</span>
                                     <span className="text-white font-mono">{String(v)}</span>
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

          {/* Description */}
          {"description" in item && item.description && (
            <div className="bg-black/20 p-3 rounded-lg border border-white/5 mt-auto">
              <p className="text-xs text-gray-300 italic leading-relaxed text-center">
                &quot;{item.description}&quot;
              </p>
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
    <div className="bg-surface-main border border-white/5 p-1.5 rounded flex flex-col items-center justify-center text-center">
      <div className="opacity-60 scale-75">{icon}</div>
      <div className="text-sm font-bold font-mono text-white leading-tight">
        {value ?? "-"}
      </div>
      <div className="text-[8px] uppercase tracking-widest text-gray-500">
        {label}
      </div>
    </div>
  );
}
