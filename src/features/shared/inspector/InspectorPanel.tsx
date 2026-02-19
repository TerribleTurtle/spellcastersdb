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
    <div className={cn("w-full bg-surface-deck/50 flex flex-col relative", className)}>
       {/* Scrollable Content Area */}
       <div className="flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar">
          <CardInspector 
            item={inspectedCard} 
            // No onClose/onBack needed for persistent panel
          />
       </div>
    </div>
  );
}
