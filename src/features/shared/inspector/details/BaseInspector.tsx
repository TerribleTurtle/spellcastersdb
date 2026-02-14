"use client";

import { X } from "lucide-react";
import { InspectorHeader } from "../InspectorHeader";
import { InspectorControls } from "../InspectorControls";
import { InspectorItem } from "../CardInspector";

interface BaseInspectorProps {
  item: InspectorItem;
  onBack?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
}

export function BaseInspector({
  item,
  onBack,
  onClose,
  children
}: BaseInspectorProps) {
  return (
    <div className="flex flex-col h-full bg-surface-card relative">
        {onClose && (
          <button
            onClick={onClose}
            className="hidden md:block absolute top-3 right-3 z-50 p-2 bg-black/80 hover:bg-brand-primary text-white rounded-full backdrop-blur-md border border-white/20 shadow-lg transition-all hover:scale-110"
          >
            <X size={18} />
          </button>
        )}

        <InspectorHeader item={item} onBack={onBack || onClose} />
        
        <div className="flex-1 overflow-y-auto space-y-3 p-4 md:p-6 custom-scrollbar">
          {children}
        </div>

        <div className="p-4 border-t border-white/10 bg-surface-main/95 backdrop-blur z-40 mt-auto shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
           <InspectorControls item={item} onClose={onClose || onBack} />
        </div>
    </div>
  );
}
