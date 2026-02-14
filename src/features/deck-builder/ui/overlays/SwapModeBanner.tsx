"use client";

import { X } from "lucide-react";
import { UnifiedEntity } from "@/types/api";

interface SwapModeBannerProps {
  pendingCard: UnifiedEntity;
  onCancel: () => void;
}

export function SwapModeBanner({ pendingCard, onCancel }: SwapModeBannerProps) {
  return (
    <div className="bg-brand-primary text-white px-6 py-3 min-w-[300px] flex items-center justify-between gap-4 rounded-full shadow-2xl border border-white/20 animate-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
          Swap Mode Active
        </span>
        <span className="text-sm font-medium leading-tight">
          Replace slot with <span className="text-amber-300 font-bold">{pendingCard.name}</span>
        </span>
      </div>
      <button
        onClick={onCancel}
        className="p-1.5 bg-black/20 hover:bg-black/40 rounded-full transition-colors shrink-0"
        title="Cancel Swap"
      >
        <X size={16} />
      </button>
    </div>
  );
}
