"use client";


import { Zap } from "lucide-react";
import { Feature } from "@/types/api"; // Ensure this type exists or use GenericFeature
import { cn } from "@/lib/utils";

interface FeaturesListProps {
  features?: Feature[];
  isCompact?: boolean;
  showDescriptions?: boolean;
}

export function FeaturesList({ features, isCompact, showDescriptions }: FeaturesListProps) {
  if (!features || features.length === 0) return null;

  return (
    <>
        {features.map((feature, i) => (
            <div
            key={`feat-${i}`}
            className={cn(
                "flex items-center gap-1.5 rounded",
                isCompact
                ? "bg-amber-500/10 border border-amber-500/20 p-1"
                : "bg-amber-500/10 border border-amber-500/20 p-3 gap-3 transition-colors hover:bg-amber-500/20"
            )}
            >
            <Zap size={isCompact ? 13 : 16} className="text-amber-400 shrink-0" />
            <div className="flex flex-col">
                <span className={cn("text-amber-200 font-bold leading-tight", isCompact ? "text-xs" : "text-sm")}>
                {feature.name}
                </span>
                {showDescriptions && feature.description && (
                <span className="text-amber-300/70 text-[10px] italic">
                    {feature.description}
                </span>
                )}
            </div>
            </div>
        ))}
    </>
  );
}
