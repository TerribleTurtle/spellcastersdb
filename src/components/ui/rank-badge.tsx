"use client";

import { cn } from "@/lib/utils";
import { RANK_CONFIG, Rank } from "@/services/config/constants";
import { Badge } from "@/components/ui/badge";

export interface RankBadgeProps {
  rank: string;
  className?: string; // e.g. w-6 h-6 or w-10
  isTitan?: boolean;
  mode?: "icon" | "text";
}

export function RankBadge({ rank, className, isTitan, mode = "icon" }: RankBadgeProps) {
  // Normalize rank to uppercase to match keys
  const normalizedRank = rank.toUpperCase() as Rank;
  const config = RANK_CONFIG[normalizedRank];

  // If strict config not found and not Titan override, return null
  if (!config && !isTitan) return null;

  // Fallback for Titan if rank is somehow not V or just to be safe
  const finalConfig = isTitan ? RANK_CONFIG["V"] : config;
  
  if (!finalConfig) return null;

  const label = isTitan ? "TITAN" : finalConfig.label;

  // Icon Mode (Geometric Shapes via SVG)
  if (mode === "icon") {
    const strokeClass = finalConfig.stroke;
    // const fillClass = finalConfig.bg;  
    // Wait, previous constants change added `fill` key like `fill-emerald-700`.
    // Let's use `finalConfig.fill` directly.
    const svgFill = finalConfig.fill; // e.g. "fill-emerald-700"

    // Common SVG Props
    // We use a 24x24 viewBox.
    // stroke-width should be around 1.5 - 2px for visibility.
    // Using `vector-effect="non-scaling-stroke"` is an option, but Tailwind's stroke utility is simpler if we just keep consistent viewBox.
    
    // We want relatively consistent visual weight (area).
    // Titan can be larger.

    let shape = null;
    let viewBox = "0 0 24 24";
    let defaultSize = "w-6 h-6";

    // Titan
    if (isTitan) {
         // Titan Shield / Crystal - Wide
         viewBox = "0 0 48 24";
         defaultSize = "w-12 h-6";
         
         // Wide Crystal Shape to fit "TITAN"
         // 48x24
         // Points:
         // Top-Left: 6,2
         // Top-Right: 42,2
         // Right-Point: 46,12
         // Bot-Right: 42,22
         // Bot-Left: 6,22
         // Left-Point: 2,12
         
         shape = (
             <polygon 
                points="6,2 42,2 46,12 42,22 6,22 2,12"
                className={cn("stroke-[1.5]", strokeClass, svgFill)}
                strokeLinejoin="round"
             />
         );
    } else {
        switch (normalizedRank) {
            case "I": // Circle
                // Radius 10.5 (Diameter 21) - Increased area
                shape = <circle cx="12" cy="12" r="10.5" className={cn("stroke-2", strokeClass, svgFill)} />;
                break;
            case "II": // Square
                // Size 16x16 -> Area 256. Perfect match for area.
                // 12-8 = 4. Start at 4,4.
                shape = <rect x="4" y="4" width="16" height="16" rx="2" className={cn("stroke-2", strokeClass, svgFill)} />;
                break;
            case "III": // Diamond
                // Rotated Square.
                // Top(12, 1), Right(23, 12), Bot(12, 23), Left(1, 12).
                shape = <polygon points="12,1 23,12 12,23 1,12" className={cn("stroke-2", strokeClass, svgFill)} strokeLinejoin="round" />;
                break;
            case "IV": // Hexagon
                // (12,1) (21.5,6.5) (21.5,17.5) (12,23) (2.5,17.5) (2.5,6.5)
                shape = <polygon points="12,1 21.5,6.5 21.5,17.5 12,23 2.5,17.5 2.5,6.5" className={cn("stroke-2", strokeClass, svgFill)} strokeLinejoin="round" />;
                break;
            case "V": // Rank V fallback (treat as Titan wide usually, or standard?)
                 // If normal Rank V exists separate from Titan, treating it as Titan for now per config logic.
                 // But if we fall through here without isTitan, it must be V.
                 viewBox = "0 0 48 24";
                 defaultSize = "w-12 h-6";
                 shape = (
                     <polygon 
                        points="6,2 42,2 46,12 42,22 6,22 2,12"
                        className={cn("stroke-[1.5]", strokeClass, svgFill)}
                        strokeLinejoin="round"
                     />
                 );
                 break;
            default:
                return null;
        }
    }

    // Container needs to center the SVG.
    // The previous implementation used different width/height for Titan.
    // We should respect the passed `className` for sizing (e.g. w-6 h-6).
    // SVG will fill that container.
    // IMPORTANT: precise default dimensions are needed or SVG defaults to 300x150
    // We calculated defaultSize above based on type.
    
    return (
      <div className={cn("relative flex items-center justify-center drop-shadow-md", defaultSize, className)}>
         <svg viewBox={viewBox} className="w-full h-full overflow-visible">
            {shape}
         </svg>
         <span className={cn(
             "absolute inset-0 flex items-center justify-center z-10 text-[10px] sm:text-[10px] font-bold font-mono pointer-events-none select-none", 
             // Adjust font size scaling via container query or just assume context?
             // The previous impl used text-[10px].
             // Center text perfectly.
             finalConfig.color
         )}>
             {label}
         </span>
      </div>
    );
  }

  // Text Mode (Full "RANK X" or just "X")
  const fullLabel = isTitan ? "TITAN" : `RANK ${label}`;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono font-bold tracking-wider px-2 py-0.5 border backdrop-blur-sm shadow-sm",
        finalConfig.color,
        finalConfig.bg, // Text mode still uses bg/border utilities from config?
        finalConfig.border, // Yes, those are tailored for boxes.
        className
      )}
    >
      {fullLabel}
    </Badge>
  );
}
