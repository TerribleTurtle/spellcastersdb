"use client";

import Image from "next/image";

import {
  ArrowLeft,
  Crown,
  PlusCircle,
  X,
} from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { cn, getCardImageUrl } from "@/lib/utils";
import { EntityDisplayItem } from "@/components/entity-card/types";
import { EntityStats } from "@/components/entity-card/EntityStats";
import { EntityMechanics } from "@/components/entity-card/EntityMechanics";
import { SpellcasterAbilities } from "@/components/entity-card/SpellcasterAbilities";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";

export type InspectorItem = EntityDisplayItem;



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

          {/* Name Overlay */}
          <div className="absolute bottom-2 left-4 right-4 z-30 pointer-events-none text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate">
              {name}
            </h2>
          </div>
          
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
          {/* Stats Grid */}
          <EntityStats item={item} variant="compact" />

          {/* Mechanics */}
          {/* Mechanics */}
          <EntityMechanics item={item} variant="compact" />

          {/* Spellcaster Passives & Abilities */}
          <SpellcasterAbilities item={item} variant="compact" />

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


