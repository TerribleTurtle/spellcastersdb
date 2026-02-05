"use client";

import Image from "next/image";
import { Unit, Spellcaster } from "@/types/api";
import { getCardImageUrl } from "@/lib/utils";
import { Shield, Swords, Zap, Users, PlusCircle, Crown, Clock, ArrowLeft, X } from "lucide-react";

type InspectorItem = Unit | Spellcaster;

interface CardInspectorProps {
  item: InspectorItem | null;
  onAddSlot: (slotIndex: 0 | 1 | 2 | 3 | 4) => void;
  onSetSpellcaster: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

export function CardInspector({ item, onAddSlot, onSetSpellcaster, onBack, onClose }: CardInspectorProps) {
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
  const isUnit = 'entity_id' in item;
  const isSpellcaster = !isUnit;

  const category = isUnit ? item.category : 'Spellcaster';
  const name = item.name;
  const rank = isUnit ? item.card_config.rank : 'HERO';

  return (
    <div className="h-full w-full bg-surface-main/30 p-4 md:p-6 overflow-y-auto custom-scrollbar">
       <div className="relative bg-surface-card rounded-xl border border-white/10 shadow-2xl overflow-hidden max-w-2xl mx-auto">
       
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
       <div className="aspect-video w-full bg-slate-800 relative flex items-center justify-center overflow-hidden">
            {/* Blurred Background */}
            <Image 
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
                <Image 
                    src={getCardImageUrl(item)} 
                    alt={name}
                    width={500}
                    height={300}
                    className="h-full w-auto max-w-full object-contain drop-shadow-2xl rounded" 
                />
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-surface-card to-transparent z-20" />
            {/* Badges */}
            <div className="absolute top-4 right-4 flex gap-2">
                <span className="bg-black/80 px-3 py-1 rounded text-lg font-bold font-mono text-brand-accent border border-brand-accent/30">
                    {rank}
                </span>
            </div>
             <div className="absolute bottom-4 left-4">
                <span className="bg-brand-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {category}
                </span>
            </div>
       </div>

       {/* Quick Add Actions */}
       <div className="p-4 bg-surface-main/30 sticky top-0 backdrop-blur z-10 border-b border-white/10">
           {isSpellcaster ? (
               <button 
                  onClick={onSetSpellcaster}
                  className="w-full py-3 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  <Crown size={20} /> Select as Spellcaster
                </button>
           ) : item.category === "Titan" ? (
               <button 
                  onClick={() => onAddSlot(4)}
                  className="w-full py-3 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <PlusCircle size={18} /> Add Titan to Slot 5
                </button>
           ) : (
             <div className="grid grid-cols-4 gap-2">
                 {([0, 1, 2, 3] as const).map(idx => (
                    <button
                        key={idx}
                        onClick={() => onAddSlot(idx)}
                        className="py-2 bg-white/5 hover:bg-brand-secondary/50 border border-white/10 hover:border-brand-secondary text-xs rounded transition-colors"
                    >
                        Slot {idx + 1}
                    </button>
                 ))}
             </div>
           )}
       </div>

       {/* Detailed Stats */}
       <div className="p-6 space-y-8">
            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatBox label="Health" value={item.health} icon={<Shield size={16} className="text-green-400" />} />
                
                {isUnit ? (
                    <>
                        <StatBox label="Damage" value={item.damage} icon={<Swords size={16} className="text-red-400" />} />
                        <StatBox label="Atk Speed" value={`${item.attack_speed}s`} icon={<Zap size={16} className="text-yellow-400" />} />
                        <StatBox label="Range" value={item.range} icon={<Users size={16} className="text-blue-400" />} />
                    </>
                ) : (
                    <>
                         <StatBox label="Minion Dmg" value={item.attack_damage_minion} icon={<Swords size={16} className="text-red-400" />} />
                         <StatBox label="Summoner Dmg" value={item.attack_damage_summoner} icon={<Swords size={16} className="text-purple-400" />} />
                         <StatBox label="Move Speed" value={item.movement_speed} icon={<Zap size={16} className="text-yellow-400" />} />
                    </>
                )}
            </div>

            {/* Economy Stats (Only for Units) */}
            {isUnit && (
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Economy</h3>
                     <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2 text-gray-300">
                            <Users size={14} /> Pop Cost
                        </span>
                        <span className="font-mono font-bold">{item.card_config.cost_population}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2 text-gray-300">
                            <Clock size={14} /> Charge Time
                        </span>
                        <span className="font-mono font-bold text-brand-secondary">{item.card_config.charge_time}s</span>
                    </div>
                </div>
            )}
            
            {/* Spellcaster Abilities */}
            {isSpellcaster && (
                 <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase text-gray-500">Abilities</h3>
                    {[item.abilities.primary, item.abilities.defense, item.abilities.ultimate].map((ab, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded border border-white/5">
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-sm text-brand-accent">{ab.name}</span>
                                {ab.cooldown && <span className="text-xs text-gray-500">{ab.cooldown}s CD</span>}
                            </div>
                            <p className="text-xs text-gray-400">{ab.description}</p>
                        </div>
                    ))}
                 </div>
            )}

            {/* Description */}
            {/* Some units might not have description in mock data or it's empty, handle optional */}
            {'description' in item && item.description && (
                <div className="prose prose-invert text-sm text-gray-300">
                    <p>{item.description}</p>
                </div>
            )}
       </div>
       </div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
    return (
        <div className="bg-surface-main border border-white/5 p-3 rounded-lg flex flex-col items-center justify-center text-center">
            <div className="mb-1 opacity-80">{icon}</div>
            <div className="text-lg font-bold font-mono text-white">{value}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
        </div>
    )
}
