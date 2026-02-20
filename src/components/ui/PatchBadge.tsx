"use client";

/**
 * PatchBadge — Visual indicator for patch categories.
 *
 * @example
 * <PatchBadge type="Patch" variant="icon" />
 * <PatchBadge type="Hotfix" variant="full" />
 */
import { FileDiff, Flame, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PatchCategory } from "@/types/patch-history";

// ============================================================================
// Configuration
// ============================================================================

const PATCH_CONFIG: Record<
  PatchCategory,
  {
    icon: typeof FileDiff;
    label: string;
    bg: string;
    text: string;
    border: string;
    glow: string;
  }
> = {
  Patch: {
    icon: FileDiff,
    label: "Patch",
    bg: "bg-sky-500/20",
    text: "text-sky-400",
    border: "border-sky-500/40",
    glow: "shadow-[0_0_6px_rgba(14,165,233,0.3)]",
  },
  Hotfix: {
    icon: Flame,
    label: "Hotfix",
    bg: "bg-rose-500/20",
    text: "text-rose-400",
    border: "border-rose-500/40",
    glow: "shadow-[0_0_6px_rgba(244,63,94,0.3)]",
  },
  Content: {
    icon: Sparkles,
    label: "Content",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    glow: "shadow-[0_0_6px_rgba(16,185,129,0.3)]",
  },
};

// ============================================================================
// Component
// ============================================================================

interface PatchBadgeProps {
  type: PatchCategory;
  variant?: "icon" | "full";
  className?: string; // Allow custom sizing/positioning
}

export function PatchBadge({
  type,
  variant = "icon",
  className,
}: PatchBadgeProps) {
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
