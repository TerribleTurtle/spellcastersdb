"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useTheme } from "next-themes";

import { Flame, Moon, Palette, Skull, Snowflake, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { cn } from "@/lib/utils";
import { CustomThemeService } from "@/services/persistence/custom-themes";

const VISIBLE_THEMES = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Why?", icon: Sun },
  { value: "theme-arcane", label: "Arcane", icon: Skull },
  { value: "theme-inferno", label: "Inferno", icon: Flame },
  { value: "theme-frost", label: "Frost", icon: Snowflake },
  { value: "theme-retro", label: "Retro", icon: Palette },
] as const;

export interface ThemePickerProps {
  className?: string;
  side?: "top" | "bottom";
  align?: "start" | "end";
  children?: React.ReactNode;
}

export function ThemePicker({
  className,
  side = "bottom",
  align = "end",
  children,
}: ThemePickerProps) {
  const { setTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Konami code listener (activates Rainbow)
  useKonamiCode();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount guard pattern
  useEffect(() => setMounted(true), []);

  // Derive custom themes list (refreshes each render when dropdown opens)
  const customThemes = mounted ? CustomThemeService.getAll() : [];

  // Calculate fixed position from button rect
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const top = side === "bottom" ? rect.bottom + 4 : rect.top - 4;
    const left = align === "end" ? rect.right : rect.left;
    setDropdownPos({ top, left });
  }, [side, align]);

  // Open handler: calculate position then show
  const handleToggle = useCallback(() => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  }, [isOpen, updatePosition]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Reposition on scroll / resize while open
  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => updatePosition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen, updatePosition]);

  if (!mounted) return null;

  const currentTheme = VISIBLE_THEMES.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon ?? Moon;
  const isRainbow = theme === "theme-rainbow";

  const dropdown =
    isOpen &&
    dropdownPos &&
    createPortal(
      <div
        ref={menuRef}
        className="fixed z-200 min-w-[140px] rounded-lg border border-border-default bg-surface-main shadow-lg overflow-hidden animate-in fade-in duration-150"
        style={{
          top: side === "bottom" ? dropdownPos.top : undefined,
          bottom:
            side === "top"
              ? `${window.innerHeight - dropdownPos.top}px`
              : undefined,
          left: align === "start" ? dropdownPos.left : undefined,
          right:
            align === "end"
              ? `${window.innerWidth - dropdownPos.left}px`
              : undefined,
        }}
        data-testid="theme-picker-menu"
      >
        {VISIBLE_THEMES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => {
              setTheme(value);
            }}
            data-testid={`theme-option-${value}`}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              theme === value
                ? "text-brand-primary bg-surface-hover"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}

        {customThemes.length > 0 && (
          <>
            <div className="px-3 py-1.5 text-xs text-text-muted border-t border-border-default mt-1 opacity-50">
              Custom
            </div>
            {customThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                data-testid={`theme-option-custom-${t.id}`}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  theme === t.id
                    ? "text-brand-primary bg-surface-hover"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0 border border-border-subtle"
                  style={{ backgroundColor: t.colors["brand-primary"] }}
                />
                <span className="truncate">{t.name}</span>
              </button>
            ))}
          </>
        )}

        {isRainbow && (
          <div className="px-3 py-1.5 text-xs text-brand-accent border-t border-border-subtle text-center">
            🌈 Rainbow Mode!
          </div>
        )}
      </div>,
      document.body
    );

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size={children ? "default" : "icon"}
        onClick={handleToggle}
        className={className}
        title="Change theme"
        aria-label="Change theme"
        data-testid="theme-picker-trigger"
      >
        <CurrentIcon
          className={cn(
            `h-[1.1rem] w-[1.1rem] ${isRainbow ? "animate-spin" : ""}`,
            children && "mr-3"
          )}
        />
        {children}
      </Button>
      {dropdown}
    </>
  );
}
