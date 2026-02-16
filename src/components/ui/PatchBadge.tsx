"use client";

/**
 * PatchBadge — Visual indicator for balance changes (buff/nerf/rework/fix/new).
 *
 * Two variants:
 * - "icon" — Small icon badge for browser cards (top-right corner).
 * - "full" — Icon + label for inspector panels and detail pages.
 *
 * @example
 * <PatchBadge type="buff" variant="icon" />
 * <PatchBadge type="nerf" variant="full" />
 */

import { ArrowUp, ArrowDown, RefreshCw, Wrench, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PatchType } from "@/types/patch-history";

// ============================================================================
// Configuration
// ============================================================================

const PATCH_CONFIG: Record<
  PatchType,
  {
    icon: typeof ArrowUp;
    label: string;
    bg: string;
    text: string;
    border: string;
    glow: string;
  }
> = {
  buff: {
    icon: ArrowUp,
    label: "Buffed",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    glow: "shadow-[0_0_6px_rgba(16,185,129,0.3)]",
  },
  nerf: {
    icon: ArrowDown,
    label: "Nerfed",
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/40",
    glow: "shadow-[0_0_6px_rgba(239,68,68,0.3)]",
  },
  rework: {
    icon: RefreshCw,
    label: "Reworked",
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/40",
    glow: "shadow-[0_0_6px_rgba(245,158,11,0.3)]",
  },
  fix: {
    icon: Wrench,
    label: "Fixed",
    bg: "bg-sky-500/20",
    text: "text-sky-400",
    border: "border-sky-500/40",
    glow: "shadow-[0_0_6px_rgba(14,165,233,0.3)]",
  },
  new: {
    icon: Sparkles,
    label: "New",
    bg: "bg-violet-500/20",
    text: "text-violet-400",
    border: "border-violet-500/40",
    glow: "shadow-[0_0_6px_rgba(139,92,246,0.3)]",
  },
};

// ============================================================================
// Component
// ============================================================================

interface PatchBadgeProps {
  type: PatchType;
  variant?: "icon" | "full";
  className?: string;
}

export function PatchBadge({ type, variant = "icon", className }: PatchBadgeProps) {
  const config = PATCH_CONFIG[type];
  if (!config) return null;

  const Icon = config.icon;

  if (variant === "icon") {
    return (
      <div
        data-testid={`patch-badge-${type}`}
        className={cn(
          "flex items-center justify-center rounded-full border backdrop-blur-sm",
          "w-5 h-5 lg:w-6 lg:h-6",
          config.bg,
          config.text,
          config.border,
          config.glow,
          className
        )}
        title={config.label}
      >
        <Icon className="w-3 h-3 lg:w-3.5 lg:h-3.5" strokeWidth={2.5} />
      </div>
    );
  }

  // "full" variant — icon + label
  return (
    <div
      data-testid={`patch-badge-${type}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-sm text-xs font-bold uppercase tracking-wider",
        config.bg,
        config.text,
        config.border,
        config.glow,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span>{config.label}</span>
    </div>
  );
}
