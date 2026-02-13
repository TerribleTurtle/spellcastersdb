"use client";

import { useDeckStore } from "@/store/index";
import { CardInspector } from "./CardInspector";
import { cn } from "@/lib/utils";

interface InspectorPanelProps {
  className?: string;
}

export function InspectorPanel({ className }: InspectorPanelProps) {
  const { inspectedCard } = useDeckStore();

  return (
    <div className={cn("h-full w-full bg-gray-950/50 border-l border-white/10 overflow-hidden flex flex-col relative", className)}>
       <div className="flex-1 overflow-y-auto custom-scrollbar">
          <CardInspector 
            item={inspectedCard} 
            // No onClose/onBack needed for persistent panel
          />
       </div>
    </div>
  );
}
