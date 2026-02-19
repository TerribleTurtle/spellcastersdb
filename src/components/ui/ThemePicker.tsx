"use client";

import { Moon, Sun, Flame, Snowflake, Skull, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { cn } from "@/lib/utils";

const VISIBLE_THEMES = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
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

export function ThemePicker({ className, side = "bottom", align = "end", children }: ThemePickerProps) {
  const { setTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Konami code listener (activates Rainbow)
  useKonamiCode();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setMounted(true), []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  if (!mounted) return null;

  const currentTheme = VISIBLE_THEMES.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon ?? Moon;
  const isRainbow = theme === "theme-rainbow";

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size={children ? "default" : "icon"}
        onClick={() => setIsOpen(!isOpen)}
        className={className}
        title="Change theme"
        aria-label="Change theme"
      >
        <CurrentIcon className={cn(`h-[1.1rem] w-[1.1rem] ${isRainbow ? "animate-spin" : ""}`, children && "mr-3")} />
        {children}
      </Button>

      {isOpen && (
        <div 
            className={cn(
                "absolute z-100 min-w-[140px] rounded-lg border border-border-default bg-surface-main shadow-lg overflow-hidden animate-in fade-in duration-150",
                side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
                align === "end" ? "right-0" : "left-0"
            )}
        >
          {VISIBLE_THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
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
          {isRainbow && (
            <div className="px-3 py-1.5 text-xs text-brand-accent border-t border-border-subtle text-center">
              🌈 Rainbow Mode!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
