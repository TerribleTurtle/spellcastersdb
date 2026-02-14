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
    <div className={cn("w-full bg-gray-950/50 flex flex-col relative", className)}>
       {/* Removed overflow-y-auto to allow content to dictate height, inner BaseInspector handles its own scroll if needed */}
       <div className="flex-1 min-h-0 flex flex-col">
          <CardInspector 
            item={inspectedCard} 
            // No onClose/onBack needed for persistent panel
          />
       </div>
    </div>
  );
}
