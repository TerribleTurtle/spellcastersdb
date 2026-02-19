// ============================================================================
// Rank & Class Visual Styles
// ============================================================================
// Extracted from constants.ts to decouple domain config from UI presentation.
// Used by RankBadge, SpellcasterSlot, DraggableCard, etc.

export const RANK_STYLES: Record<
  string, // Using string key to support "I" | "II" | "V" | "TITAN" etc.
  {
    color: string;
    bg: string;
    border: string;
    borderBg: string;
    fill: string;
    stroke: string;
  }
> = {
  I: {
    color: "text-text-primary",
    bg: "bg-surface-raised",
    border: "border-slate-400",
    borderBg: "bg-surface-hover",
    fill: "fill-slate-600",
    stroke: "stroke-slate-400",
  },
  II: {
    color: "text-text-primary",
    bg: "bg-emerald-700",
    border: "border-emerald-500",
    borderBg: "bg-emerald-500",
    fill: "fill-emerald-700",
    stroke: "stroke-emerald-500",
  },
  III: {
    color: "text-text-primary",
    bg: "bg-blue-700",
    border: "border-blue-500",
    borderBg: "bg-blue-500",
    fill: "fill-blue-700",
    stroke: "stroke-blue-500",
  },
  IV: {
    color: "text-text-primary",
    bg: "bg-purple-700",
    border: "border-purple-500",
    borderBg: "bg-purple-500",
    fill: "fill-purple-700",
    stroke: "stroke-purple-500",
  },
  V: {
    color: "text-text-primary",
    bg: "bg-amber-800",
    border: "border-amber-600",
    borderBg: "bg-amber-600",
    fill: "fill-amber-800",
    stroke: "stroke-amber-600",
  },
};

export const CLASS_STYLES: Record<
  string,
  { bg: string; border: string; iconColor: string }
> = {
  Conqueror: {
    bg: "bg-surface-main",
    border: "border-slate-600",
    iconColor: "text-status-danger-text",
  },
  Duelist: {
    bg: "bg-surface-main",
    border: "border-slate-600",
    iconColor: "text-amber-400",
  },
  Enchanter: {
    bg: "bg-surface-main",
    border: "border-slate-600",
    iconColor: "text-purple-400",
  },
  Unknown: {
    bg: "bg-surface-main",
    border: "border-slate-400",
    iconColor: "text-text-muted",
  },
};
