"use client";

import { Unit } from "@/types/api";
import { Shield, Swords, Zap, Clock, Users, PlusCircle } from "lucide-react";

interface CardInspectorProps {
  unit: Unit | null;
  onAddSlot: (slotIndex: 0 | 1 | 2 | 3 | 4) => void;
}

export function CardInspector({ unit, onAddSlot }: CardInspectorProps) {
  if (!unit) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 border-x border-white/10 bg-surface-main/50">
        <div className="text-center p-8">
            <h3 className="text-xl font-bold mb-2">Select a Unit</h3>
            <p className="text-sm opacity-60">Click a unit on the left to inspect stats</p>
        </div>
      </div>
    );
  }

  const isTitan = unit.category === "Titan";
  const { health, damage, attack_speed, range, card_config } = unit;

  return (
    <div className="h-full flex flex-col bg-surface-card border-x border-white/10 overflow-y-auto custom-scrollbar">
       {/* Art / Banner Area */}
       <div className="aspect-video w-full bg-slate-800 relative flex items-center justify-center overflow-hidden">
            {/* Placeholder Art */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white/20 tracking-tighter uppercase">{unit.name}</h1>
            </div>
            {/* Badges */}
            <div className="absolute top-4 right-4 flex gap-2">
                <span className="bg-black/80 px-3 py-1 rounded text-lg font-bold font-mono text-brand-accent border border-brand-accent/30">
                    {card_config.rank}
                </span>
            </div>
             <div className="absolute bottom-4 left-4">
                <span className="bg-brand-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {unit.category}
                </span>
            </div>
       </div>

       {/* Quick Add Actions */}
       <div className="p-4 grid grid-cols-5 gap-2 border-b border-white/10 bg-surface-main/30 sticky top-0 backdrop-blur z-10">
           {isTitan ? (
               <button 
                  onClick={() => onAddSlot(4)}
                  className="col-span-5 py-3 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
                >
                  <PlusCircle size={18} /> Add Titan to Slot 5
                </button>
           ) : (
             ([0, 1, 2, 3] as const).map(idx => (
                <button
                    key={idx}
                    onClick={() => onAddSlot(idx)}
                    className="py-2 bg-white/5 hover:bg-brand-secondary/50 border border-white/10 hover:border-brand-secondary text-xs rounded transition-colors"
                >
                    Slot {idx + 1}
                </button>
             ))
           )}
       </div>

       {/* Detailed Stats */}
       <div className="p-6 space-y-8">
            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatBox label="Health" value={health} icon={<Shield size={16} className="text-green-400" />} />
                <StatBox label="Damage" value={damage} icon={<Swords size={16} className="text-red-400" />} />
                <StatBox label="Atk Speed" value={`${attack_speed}s`} icon={<Zap size={16} className="text-yellow-400" />} />
                <StatBox label="Range" value={range} icon={<Users size={16} className="text-blue-400" />} />
            </div>

            {/* Economy Stats */}
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Economy</h3>
                 <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-gray-300">
                        <Users size={14} /> Pop Cost
                    </span>
                    <span className="font-mono font-bold">{card_config.cost_population}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-gray-300">
                        <Clock size={14} /> Charge Time
                    </span>
                    <span className="font-mono font-bold text-brand-secondary">{card_config.charge_time}s</span>
                </div>
            </div>

            {/* Description */}
            <div className="prose prose-invert text-sm text-gray-300">
                <p>{unit.description}</p>
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
