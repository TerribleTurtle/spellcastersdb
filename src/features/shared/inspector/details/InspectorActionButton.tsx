"use client";

import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface InspectorActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected?: boolean;
}

export function InspectorActionButton({
  isSelected,
  className,
  children,
  disabled,
  ...props
}: InspectorActionButtonProps) {
  return (
    <button
      disabled={disabled || isSelected}
      className={cn(
        "rounded transition-all duration-200 border",
        isSelected
          ? "bg-surface-hover border-border-subtle text-text-dimmed cursor-not-allowed"
          : "bg-surface-card hover:bg-brand-secondary/50 border-border-default hover:border-brand-secondary text-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
