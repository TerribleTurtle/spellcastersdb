"use client";

import { cn } from "@/lib/utils";
import { RANK_CONFIG, Rank } from "@/services/config/constants";
import { Badge } from "@/components/ui/badge";

export interface RankBadgeProps {
  rank: string;
  className?: string;
  isTitan?: boolean;
  mode?: "icon" | "text";
}

export function RankBadge({ rank, className, isTitan, mode = "icon" }: RankBadgeProps) {
  // Normalize rank to uppercase to match keys
  const normalizedRank = rank.toUpperCase() as Rank;
  const config = RANK_CONFIG[normalizedRank];

  // Helper to determine if we need a wide container for Titan


  if (!config && !isTitan) return null;

  // Fallback for Titan if rank is somehow not V or just to be safe
  const finalConfig = isTitan ? RANK_CONFIG["V"] : config;
  
  // If still no config (e.g. invalid rank and not titan), abort
  if (!finalConfig) return null;

  const label = isTitan ? "TITAN" : finalConfig.label;

  // Icon Mode (Geometric Shapes)
  // Icon Mode (Geometric Shapes)
  if (mode === "icon") {
    const commonClasses = cn(
        "absolute inset-0 transition-all",
        finalConfig.bg,
        finalConfig.border
    );
    
    // Helper for clipped shapes
    const renderClippedShape = (polygon: string, scale = "scale-100") => (
        <>
            <div 
                className={cn("absolute inset-0 bg-slate-400", scale)}
                style={{ clipPath: polygon }}
            />
            <div 
                className={cn("absolute inset-[2px]", finalConfig.bg, scale)}
                style={{ clipPath: polygon }}
            />
        </>
    );


    const isWide = normalizedRank === "V" || isTitan;

    return (
        <div className={cn("relative flex items-center justify-center drop-shadow-md", isWide ? "w-10 h-6" : "w-6 h-6", className)}>
             {/* Shape Render */}


             {normalizedRank === "I" ? (
                 <div className={cn(commonClasses, "rounded-full border-2 scale-110")} />
             ) : normalizedRank === "II" ? (
                 <div className={cn(commonClasses, "rounded-[1px] border-2 rotate-0")} /> // Square
             ) : normalizedRank === "III" ? (
                <div className={cn(commonClasses, "rounded-[2px] border-2 rotate-45 scale-90")} /> // Diamond
             ) : normalizedRank === "IV" ? (
                // Hexagon Composite
                renderClippedShape("polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", "scale-110")
             ) : (
                // V / Titan - Crystal Composite
                renderClippedShape("polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)", "scale-110")
             )}

            <span className={cn(
                "relative z-10 text-[10px] font-bold font-mono",
                finalConfig.color
            )}>
                {label}
            </span>
        </div>
    );
  }

  // Text Mode (Full "RANK X" or just "X" if label is short? User said "RANK X")
  // If standard rank, prepend "RANK". If Titan, just "TITAN".
  const fullLabel = isTitan ? "TITAN" : `RANK ${label}`;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono font-bold tracking-wider px-2 py-0.5 border backdrop-blur-sm shadow-sm",
        finalConfig.color,
        finalConfig.bg,
        finalConfig.border,
        className
      )}
    >
      {fullLabel}
    </Badge>
  );
}
